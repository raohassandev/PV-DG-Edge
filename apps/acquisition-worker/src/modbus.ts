import ModbusSerialDefault from "modbus-serial";
import type { MqttClient } from "mqtt";
import type pg from "pg";
import { validateCanonicalTelemetry, type CanonicalMetricValue, type CanonicalTelemetryPayload } from "@pvdg/telemetry";

export type AcquisitionProtocol = "modbus_tcp" | "modbus_rtu";
export type ModbusDataType = "uint16" | "int16" | "uint32" | "int32" | "float32";
export type RegisterByteOrder = "ABCD" | "BADC" | "CDAB" | "DCBA";

export interface AcquisitionDevice {
  id: string;
  siteId: string;
  deviceType: CanonicalTelemetryPayload["deviceType"];
  protocol: AcquisitionProtocol;
  connectionConfig: unknown;
  pollingIntervalMs: number;
}

export interface DeviceRegisterMap {
  id: string;
  deviceId: string;
  parameterKey: string;
  displayName: string;
  unit: string | null;
  dataType: ModbusDataType;
  addressDecimal: number;
  functionCode: 3 | 4;
  scaleFactor: number;
  registerCount: number;
  byteOrder: string | null;
  wordOrder: string | null;
}

export interface DevicePollingJob {
  device: AcquisitionDevice;
  registerMaps: DeviceRegisterMap[];
}

export interface ModbusConnectionConfig {
  host?: string;
  port?: number;
  path?: string;
  baudRate?: number;
  dataBits?: number;
  stopBits?: number;
  parity?: "none" | "even" | "odd";
  unitId?: number;
  timeoutMs?: number;
}

export interface ModbusClientLike {
  setID(unitId: number): void;
  setTimeout(timeoutMs: number): void;
  connectTCP(host: string, options: { port: number }): Promise<void>;
  connectRTUBuffered(path: string, options: { baudRate: number; dataBits: number; stopBits: number; parity: "none" | "even" | "odd" }): Promise<void>;
  readHoldingRegisters(address: number, length: number): Promise<{ data: number[] }>;
  readInputRegisters(address: number, length: number): Promise<{ data: number[] }>;
  close(callback?: () => void): void;
}

export interface ModbusClientFactory {
  create(): ModbusClientLike;
}

export class ModbusSerialClientFactory implements ModbusClientFactory {
  create(): ModbusClientLike {
    return new ModbusSerial() as ModbusClientLike;
  }
}

interface ModbusSerialConstructor {
  new (): unknown;
}

const ModbusSerial = ModbusSerialDefault as unknown as ModbusSerialConstructor;

export function normalizeRegisterByteOrder(byteOrder?: string | null, wordOrder?: string | null): RegisterByteOrder {
  const combined = `${wordOrder ?? ""}${byteOrder ?? ""}`.toUpperCase();
  if (["ABCD", "BADC", "CDAB", "DCBA"].includes(combined)) return combined as RegisterByteOrder;

  const byte = (byteOrder ?? "ABCD").toUpperCase();
  const word = (wordOrder ?? "").toUpperCase();
  if (word === "CDAB") return byte === "BADC" ? "DCBA" : "CDAB";
  if (word === "BA" || byte === "BADC") return "BADC";
  if (byte === "DCBA") return "DCBA";
  return "ABCD";
}

export function decodeRegisterValue(registers: number[], dataType: ModbusDataType, scaleFactor = 1, byteOrder: RegisterByteOrder = "ABCD"): number {
  const first = registers[0] ?? 0;
  const second = registers[1] ?? 0;
  if (dataType === "uint16") return first * scaleFactor;
  if (dataType === "int16") {
    const value = first & 0xffff;
    return (value & 0x8000 ? value - 0x10000 : value) * scaleFactor;
  }

  const bytes = Buffer.alloc(4);
  bytes.writeUInt16BE(first & 0xffff, 0);
  bytes.writeUInt16BE(second & 0xffff, 2);
  const order = {
    ABCD: [0, 1, 2, 3],
    BADC: [1, 0, 3, 2],
    CDAB: [2, 3, 0, 1],
    DCBA: [3, 2, 1, 0]
  }[byteOrder];
  const ordered = Buffer.from(order.map((index) => bytes[index] ?? 0));

  if (dataType === "uint32") return ordered.readUInt32BE(0) * scaleFactor;
  if (dataType === "int32") return ordered.readInt32BE(0) * scaleFactor;
  return ordered.readFloatBE(0) * scaleFactor;
}

export function connectionConfig(input: unknown): ModbusConnectionConfig {
  return typeof input === "object" && input !== null ? (input as ModbusConnectionConfig) : {};
}

export async function loadPollingJobs(pool: pg.Pool): Promise<DevicePollingJob[]> {
  const devices = await pool.query<Record<string, unknown>>(
    `select id, site_id, device_type, protocol, connection_config, polling_interval_ms
     from devices
     where enabled = true and protocol in ('modbus_tcp', 'modbus_rtu')
     order by id`
  );

  if (devices.rows.length === 0) return [];

  const maps = await pool.query<Record<string, unknown>>(
    `select id, device_id, parameter_key, display_name, unit, data_type, address_decimal, function_code,
       scale_factor, register_count, byte_order, word_order
     from device_register_maps
     where device_id = any($1::uuid[]) and access in ('R', 'RW') and function_code in (3, 4) and address_decimal is not null
     order by device_id, function_code, address_decimal`,
    [devices.rows.map((row) => row.id)]
  );
  const mapsByDevice = new Map<string, DeviceRegisterMap[]>();
  for (const row of maps.rows) {
    const map = registerMapFromRow(row);
    mapsByDevice.set(map.deviceId, [...(mapsByDevice.get(map.deviceId) ?? []), map]);
  }

  return devices.rows.map((row) => {
    const device = deviceFromRow(row);
    return { device, registerMaps: mapsByDevice.get(device.id) ?? [] };
  });
}

export async function pollDevice(job: DevicePollingJob, factory: ModbusClientFactory): Promise<CanonicalTelemetryPayload | null> {
  if (job.registerMaps.length === 0) return null;

  const client = factory.create();
  const config = connectionConfig(job.device.connectionConfig);
  try {
    await connectClient(client, job.device.protocol, config);
    const metrics: Record<string, CanonicalMetricValue> = {};

    for (const map of job.registerMaps) {
      try {
        const response = map.functionCode === 3
          ? await client.readHoldingRegisters(map.addressDecimal, map.registerCount)
          : await client.readInputRegisters(map.addressDecimal, map.registerCount);
        metrics[map.parameterKey] = {
          value: decodeRegisterValue(response.data, map.dataType, map.scaleFactor, normalizeRegisterByteOrder(map.byteOrder, map.wordOrder)),
          unit: map.unit ?? undefined,
          quality: 192,
          sourceAddress: `${map.functionCode}:${map.addressDecimal}`
        };
      } catch {
        metrics[map.parameterKey] = { value: 0, unit: map.unit ?? undefined, quality: 0, sourceAddress: `${map.functionCode}:${map.addressDecimal}` };
      }
    }

    return buildCanonicalPayload(job.device, metrics);
  } finally {
    client.close();
  }
}

export function buildCanonicalPayload(device: AcquisitionDevice, metrics: Record<string, CanonicalMetricValue>): CanonicalTelemetryPayload | null {
  if (Object.keys(metrics).length === 0) return null;
  const qualities = Object.values(metrics).map((metric) => metric.quality ?? 192);
  const quality = qualities.every((value) => value >= 192) ? 192 : qualities.every((value) => value < 64) ? 0 : 64;
  const payload = {
    schemaVersion: "1.0",
    ts: new Date().toISOString(),
    siteId: device.siteId,
    deviceId: device.id,
    deviceType: device.deviceType,
    source: "acquisition-worker",
    quality,
    metrics
  };
  const validated = validateCanonicalTelemetry(payload);
  return validated.valid && validated.payload ? validated.payload : null;
}

export async function publishPayload(client: MqttClient, payload: CanonicalTelemetryPayload): Promise<void> {
  const validated = validateCanonicalTelemetry(payload);
  if (!validated.valid) return;
  await new Promise<void>((resolve, reject) => {
    client.publish(`pvdg/${payload.siteId}/${payload.deviceId}/telemetry`, JSON.stringify(payload), { qos: 0 }, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function connectClient(client: ModbusClientLike, protocol: AcquisitionProtocol, config: ModbusConnectionConfig): Promise<void> {
  client.setTimeout(config.timeoutMs ?? 2000);
  client.setID(config.unitId ?? 1);
  if (protocol === "modbus_tcp") {
    if (!config.host) throw new Error("modbus_tcp connection_config.host is required");
    await client.connectTCP(config.host, { port: config.port ?? 502 });
    return;
  }
  if (!config.path) throw new Error("modbus_rtu connection_config.path is required");
  await client.connectRTUBuffered(config.path, {
    baudRate: config.baudRate ?? 9600,
    dataBits: config.dataBits ?? 8,
    stopBits: config.stopBits ?? 1,
    parity: config.parity ?? "none"
  });
}

function deviceFromRow(row: Record<string, unknown>): AcquisitionDevice {
  return {
    id: String(row.id),
    siteId: String(row.site_id),
    deviceType: row.device_type as AcquisitionDevice["deviceType"],
    protocol: row.protocol as AcquisitionProtocol,
    connectionConfig: row.connection_config,
    pollingIntervalMs: Number(row.polling_interval_ms)
  };
}

function registerMapFromRow(row: Record<string, unknown>): DeviceRegisterMap {
  return {
    id: String(row.id),
    deviceId: String(row.device_id),
    parameterKey: String(row.parameter_key),
    displayName: String(row.display_name),
    unit: row.unit === null ? null : String(row.unit),
    dataType: row.data_type as ModbusDataType,
    addressDecimal: Number(row.address_decimal),
    functionCode: Number(row.function_code) as 3 | 4,
    scaleFactor: Number(row.scale_factor),
    registerCount: Number(row.register_count),
    byteOrder: row.byte_order === null ? null : String(row.byte_order),
    wordOrder: row.word_order === null ? null : String(row.word_order)
  };
}
