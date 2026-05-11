import type { Server as HttpServer } from "node:http";
import mqtt from "mqtt";
import type { MqttClient } from "mqtt";
import { createClient } from "redis";
import type { RedisClientType } from "redis";
import { Server as SocketIoServer } from "socket.io";
import { persistCanonicalTelemetry } from "@pvdg/db";
import { parseCanonicalTelemetryJson, type CanonicalTelemetryPayload } from "@pvdg/telemetry";

export interface LiveTelemetryHint {
  siteId: string;
  deviceId: string;
  ts: string;
  changed: string[];
  quality: number;
}

export interface LiveTelemetrySnapshot {
  siteId?: string;
  deviceId?: string;
  updatedAt: string;
  payload: CanonicalTelemetryPayload;
}

export interface LiveTelemetryStore {
  setTelemetry(payload: CanonicalTelemetryPayload): Promise<LiveTelemetryHint>;
  getSiteSnapshot(siteId: string): Promise<LiveTelemetrySnapshot | null>;
  getDeviceSnapshot(deviceId: string): Promise<LiveTelemetrySnapshot | null>;
  close?(): Promise<void>;
}

export type TelemetryPersistence = (payload: CanonicalTelemetryPayload, sourceTopic?: string) => Promise<void>;

export interface RealtimeService {
  io: SocketIoServer;
  mqttClient?: MqttClient;
  close(): Promise<void>;
}

function snapshotFromPayload(payload: CanonicalTelemetryPayload): LiveTelemetrySnapshot {
  return {
    siteId: payload.siteId,
    deviceId: payload.deviceId,
    updatedAt: new Date().toISOString(),
    payload
  };
}

export class MemoryLiveTelemetryStore implements LiveTelemetryStore {
  private readonly sites = new Map<string, LiveTelemetrySnapshot>();
  private readonly devices = new Map<string, LiveTelemetrySnapshot>();

  async setTelemetry(payload: CanonicalTelemetryPayload): Promise<LiveTelemetryHint> {
    const snapshot = snapshotFromPayload(payload);
    this.sites.set(payload.siteId, snapshot);
    this.devices.set(payload.deviceId, snapshot);
    return telemetryHint(payload);
  }

  async getSiteSnapshot(siteId: string): Promise<LiveTelemetrySnapshot | null> {
    return this.sites.get(siteId) ?? null;
  }

  async getDeviceSnapshot(deviceId: string): Promise<LiveTelemetrySnapshot | null> {
    return this.devices.get(deviceId) ?? null;
  }
}

export class RedisLiveTelemetryStore implements LiveTelemetryStore {
  constructor(private readonly client: RedisClientType) {}

  async setTelemetry(payload: CanonicalTelemetryPayload): Promise<LiveTelemetryHint> {
    const snapshot = JSON.stringify(snapshotFromPayload(payload));
    await Promise.all([
      this.client.set(`live:site:${payload.siteId}`, snapshot),
      this.client.set(`live:device:${payload.deviceId}`, snapshot),
      this.client.set(`health:device:${payload.deviceId}`, JSON.stringify({ status: "online", updatedAt: new Date().toISOString(), quality: payload.quality }))
    ]);
    return telemetryHint(payload);
  }

  async getSiteSnapshot(siteId: string): Promise<LiveTelemetrySnapshot | null> {
    return this.readSnapshot(`live:site:${siteId}`);
  }

  async getDeviceSnapshot(deviceId: string): Promise<LiveTelemetrySnapshot | null> {
    return this.readSnapshot(`live:device:${deviceId}`);
  }

  async close(): Promise<void> {
    if (this.client.isOpen) await this.client.quit();
  }

  private async readSnapshot(key: string): Promise<LiveTelemetrySnapshot | null> {
    const raw = await this.client.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as LiveTelemetrySnapshot;
  }
}

export function telemetryHint(payload: CanonicalTelemetryPayload): LiveTelemetryHint {
  return {
    siteId: payload.siteId,
    deviceId: payload.deviceId,
    ts: payload.ts,
    changed: Object.keys(payload.metrics),
    quality: payload.quality
  };
}

export async function processMqttTelemetryMessage(
  store: LiveTelemetryStore,
  message: string | Buffer,
  sourceTopic?: string,
  persist: TelemetryPersistence = persistCanonicalTelemetry
): Promise<{ accepted: true; hint: LiveTelemetryHint } | { accepted: false; errors: string[] }> {
  const parsed = parseCanonicalTelemetryJson(message);
  if (!parsed.valid || !parsed.payload) {
    return { accepted: false, errors: parsed.errors ?? ["Invalid telemetry payload"] };
  }

  const hint = await store.setTelemetry(parsed.payload);
  try {
    await persist(parsed.payload, sourceTopic);
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "unknown persistence error";
    console.error({ siteId: parsed.payload.siteId, deviceId: parsed.payload.deviceId, sourceTopic, error: messageText }, "telemetry persistence failed");
  }
  return { accepted: true, hint };
}

export async function createRedisLiveTelemetryStore(redisUrl: string): Promise<RedisLiveTelemetryStore> {
  const client = createClient({ url: redisUrl }) as RedisClientType;
  client.on("error", () => undefined);
  await client.connect();
  return new RedisLiveTelemetryStore(client);
}

export function attachSocketIo(server: HttpServer): SocketIoServer {
  const io = new SocketIoServer(server, { path: "/socket.io", cors: { origin: true } });

  io.on("connection", (socket) => {
    socket.on("site:join", (siteId: string) => {
      if (typeof siteId === "string" && siteId.length > 0) socket.join(`site:${siteId}`);
    });

    socket.on("site:leave", (siteId: string) => {
      if (typeof siteId === "string" && siteId.length > 0) socket.leave(`site:${siteId}`);
    });

    socket.on("device:join", (deviceId: string) => {
      if (typeof deviceId === "string" && deviceId.length > 0) socket.join(`device:${deviceId}`);
    });

    socket.on("device:leave", (deviceId: string) => {
      if (typeof deviceId === "string" && deviceId.length > 0) socket.leave(`device:${deviceId}`);
    });
  });

  return io;
}

export function startRealtimeServices(options: { httpServer: HttpServer; store: LiveTelemetryStore; mqttUrl: string; onMqttStatusChange?: (status: "ok" | "degraded" | "down") => void }): RealtimeService {
  const io = attachSocketIo(options.httpServer);
  const mqttClient = mqtt.connect(options.mqttUrl, { reconnectPeriod: 5000 });

  mqttClient.on("connect", () => {
    options.onMqttStatusChange?.("ok");
    mqttClient.subscribe("pvdg/+/+/telemetry");
  });

  mqttClient.on("reconnect", () => options.onMqttStatusChange?.("degraded"));
  mqttClient.on("offline", () => options.onMqttStatusChange?.("degraded"));
  mqttClient.on("close", () => options.onMqttStatusChange?.("degraded"));
  mqttClient.on("error", () => options.onMqttStatusChange?.("down"));

  mqttClient.on("message", (topic, message) => {
    void processMqttTelemetryMessage(options.store, message, topic).then((result) => {
      if (!result.accepted) return;
      io.to(`site:${result.hint.siteId}`).emit("site:telemetry", result.hint);
      io.to(`device:${result.hint.deviceId}`).emit("device:status", result.hint);
    });
  });

  return {
    io,
    mqttClient,
    async close() {
      mqttClient.end(true);
      await io.close();
      await options.store.close?.();
    }
  };
}
