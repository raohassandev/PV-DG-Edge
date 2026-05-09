import { loadConfig } from "@pvdg/config";
import { createLogger } from "@pvdg/logger";
import { createHealthStatus } from "@pvdg/shared";

const config = loadConfig();
const logger = createLogger("rules-worker", config.LOG_LEVEL);

logger.info(createHealthStatus("rules-worker"), "rules worker bootstrap complete");

setInterval(() => undefined, 60_000);
