import { describe, expect, it, vi } from "vitest";
import {
  buildCanonicalPayload,
  decodeRegisterValue,
  normalizeRegisterByteOrder,
  pollDevice,
  publishPayload,
  type DevicePollingJob,
  type ModbusClientLike
} from "./modbus.js";

const device = {
  id: "22222222-2222-4222-8222-222222222222",
  siteId: "11111111-1111-4111-8111-111111111111",
  deviceType: "grid_meter",
  protocol: "modbus_tcp",
  connectionConfig: { host: "127.0.0.1", port: 1502, unitId: 1 },
  pollingIntervalMs: 1000
} as const;

describe("register decoder", () => {
  it("decodes integer types and scale factors", () => {
    expect(decodeRegisterValue([2301], "uint16", 0.1)).toBe(230.10000000000002);
    expect(decodeRegisterValue([0xfffe], "int16", 1)).toBe(-2);
    expect(decodeRegisterValue([0x0001, 0x0002], "uint32", 1)).toBe(65538);
    expect(decodeRegisterValue([0xffff, 0xfffe], "int32", 1)).toBe(-2);
  });

  it("decodes float32 byte and word orders", () => {
    expect(decodeRegisterValue([0x42f6, 0x0000], "float32", 1, "ABCD")).toBe(123);
    expect(decodeRegisterValue([0xf642, 0x0000], "float32", 1, "BADC")).toBe(123);
    expect(decodeRegisterValue([0x0000, 0x42f6], "float32", 1, "CDAB")).toBe(123);
    expect(decodeRegisterValue([0x0000, 0xf642], "float32", 1, "DCBA")).toBe(123);
  });

  it("normalizes common byte and word order labels", () => {
    expect(normalizeRegisterByteOrder("ABCD")).toBe("ABCD");
    expect(normalizeRegisterByteOrder("BADC")).toBe("BADC");
    expect(normalizeRegisterByteOrder("ABCD", "CDAB")).toBe("CDAB");
    expect(normalizeRegisterByteOrder("BADC", "CDAB")).toBe("DCBA");
  });
});

describe("canonical payload publishing", () => {
  it("builds acquisition-worker canonical telemetry", () => {
    const payload = buildCanonicalPayload(device, { voltage_l1: { value: 230.1, unit: "V", quality: 192 } });

    expect(payload).toMatchObject({
      siteId: device.siteId,
      deviceId: device.id,
      source: "acquisition-worker",
      quality: 192,
      metrics: { voltage_l1: { value: 230.1 } }
    });
  });

  it("does not publish invalid payloads", async () => {
    const publish = vi.fn((_topic: string, _payload: string, _options: unknown, callback: (error?: Error) => void) => callback());
    await publishPayload({ publish } as never, { invalid: true } as never);
    expect(publish).not.toHaveBeenCalled();
  });

  it("publishes only after payload validation succeeds", async () => {
    const publish = vi.fn((_topic: string, _payload: string, _options: unknown, callback: (error?: Error) => void) => callback());
    const payload = buildCanonicalPayload(device, { voltage_l1: { value: 230.1, unit: "V", quality: 192 } });
    expect(payload).not.toBeNull();

    await publishPayload({ publish } as never, payload!);

    expect(publish).toHaveBeenCalledWith(
      `pvdg/${device.siteId}/${device.id}/telemetry`,
      expect.stringContaining("voltage_l1"),
      { qos: 0 },
      expect.any(Function)
    );
  });
});

describe("device polling", () => {
  it("returns null and publishes no fake telemetry when a device has no register maps", async () => {
    const payload = await pollDevice({ device, registerMaps: [] }, { create: () => fakeClient({}) });
    expect(payload).toBeNull();
  });

  it("marks failed reads bad without crashing the device poll", async () => {
    const job: DevicePollingJob = {
      device,
      registerMaps: [
        {
          id: "map-1",
          deviceId: device.id,
          parameterKey: "voltage_l1",
          displayName: "Voltage L1",
          unit: "V",
          dataType: "uint16",
          addressDecimal: 0,
          functionCode: 3,
          scaleFactor: 1,
          registerCount: 1,
          byteOrder: "ABCD",
          wordOrder: null
        }
      ]
    };

    const payload = await pollDevice(job, { create: () => fakeClient({ failRead: true }) });

    expect(payload?.quality).toBe(0);
    expect(payload?.metrics.voltage_l1?.quality).toBe(0);
  });
});

function fakeClient(options: { failRead?: boolean }): ModbusClientLike {
  return {
    setID: () => undefined,
    setTimeout: () => undefined,
    connectTCP: async () => undefined,
    connectRTUBuffered: async () => undefined,
    readHoldingRegisters: async () => {
      if (options.failRead) throw new Error("read failed");
      return { data: [230] };
    },
    readInputRegisters: async () => ({ data: [230] }),
    close: () => undefined
  };
}
