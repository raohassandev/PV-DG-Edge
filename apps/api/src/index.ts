import { loadConfig } from "@pvdg/config";
import { createLogger } from "@pvdg/logger";
import { buildServer } from "./server.js";

const config = loadConfig();
const logger = createLogger("api", config.LOG_LEVEL);
const server = buildServer();

await server.listen({
  host: config.API_HOST,
  port: config.API_PORT
});

logger.info({ host: config.API_HOST, port: config.API_PORT }, "api listening");
