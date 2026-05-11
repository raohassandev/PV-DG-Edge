import mqtt from "mqtt";
import { loadConfig } from "@pvdg/config";
import { getDatabasePool, shutdownDatabase } from "@pvdg/db";
import { createLogger } from "@pvdg/logger";
import { createHealthStatus } from "@pvdg/shared";
import { ModbusSerialClientFactory, loadPollingJobs, pollDevice, publishPayload } from "./modbus.js";

const config = loadConfig();
const logger = createLogger("acquisition-worker", config.LOG_LEVEL);
const pool = getDatabasePool();
const mqttClient = mqtt.connect(config.MQTT_URL, { reconnectPeriod: 5000 });
const modbusFactory = new ModbusSerialClientFactory();
const lastPolledAt = new Map<string, number>();
const pendingLogDeviceIds = new Set<string>();
let shuttingDown = false;

logger.info(createHealthStatus("acquisition-worker"), "acquisition worker bootstrap complete");

mqttClient.on("connect", () => logger.info("mqtt connected"));
mqttClient.on("reconnect", () => logger.warn("mqtt reconnecting"));
mqttClient.on("error", (error) => logger.error({ error: error.message }, "mqtt connection error"));

async function runPollingCycle(): Promise<void> {
  if (!pool) {
    logger.warn("database not configured; acquisition polling skipped");
    return;
  }

  const now = Date.now();
  const jobs = await loadPollingJobs(pool);

  for (const job of jobs) {
    const last = lastPolledAt.get(job.device.id) ?? 0;
    if (now - last < job.device.pollingIntervalMs) continue;
    lastPolledAt.set(job.device.id, now);

    if (job.registerMaps.length === 0) {
      if (!pendingLogDeviceIds.has(job.device.id)) {
        pendingLogDeviceIds.add(job.device.id);
        logger.warn({ deviceId: job.device.id, protocol: job.device.protocol }, "device polling not implemented yet: no enabled register maps");
      }
      continue;
    }

    try {
      const payload = await pollDevice(job, modbusFactory);
      if (!payload) continue;
      await publishPayload(mqttClient, payload);
      logger.debug({ siteId: payload.siteId, deviceId: payload.deviceId, metricCount: Object.keys(payload.metrics).length }, "published canonical telemetry");
    } catch (error) {
      const message = error instanceof Error ? error.message : "device polling failed";
      logger.warn({ deviceId: job.device.id, protocol: job.device.protocol, error: message }, "device polling failed");
    }
  }
}

const interval = setInterval(() => {
  if (!shuttingDown) {
    void runPollingCycle().catch((error) => {
      const message = error instanceof Error ? error.message : "acquisition cycle failed";
      logger.error({ error: message }, "acquisition cycle failed");
    });
  }
}, config.ACQUISITION_REFRESH_INTERVAL_MS);

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "acquisition worker shutting down");
  clearInterval(interval);
  mqttClient.end(true);
  await shutdownDatabase();
}

process.on("SIGINT", (signal) => void shutdown(signal));
process.on("SIGTERM", (signal) => void shutdown(signal));
