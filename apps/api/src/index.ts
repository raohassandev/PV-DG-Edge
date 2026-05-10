import { loadConfig } from "@pvdg/config";
import { createLogger } from "@pvdg/logger";
import { createRedisLiveTelemetryStore, startRealtimeServices } from "./realtime.js";
import { buildServer } from "./server.js";

const config = loadConfig();
const logger = createLogger("api", config.LOG_LEVEL);
const liveTelemetryStore = await createRedisLiveTelemetryStore(config.REDIS_URL);
let mqttStatus: "degraded" | "down" | "ok" = "degraded";
const server = buildServer({ liveTelemetryStore, mqttStatus: () => ({ status: mqttStatus }) });
const realtime = startRealtimeServices({
  httpServer: server.server,
  store: liveTelemetryStore,
  mqttUrl: config.MQTT_URL,
  onMqttStatusChange: (status) => {
    mqttStatus = status;
  }
});

server.addHook("onClose", async () => {
  await realtime.close();
});

await server.listen({
  host: config.API_HOST,
  port: config.API_PORT
});

logger.info({ host: config.API_HOST, port: config.API_PORT }, "api listening");
