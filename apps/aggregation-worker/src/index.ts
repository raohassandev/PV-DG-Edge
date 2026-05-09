import { loadConfig } from "@pvdg/config";
import { createLogger } from "@pvdg/logger";
import { createHealthStatus } from "@pvdg/shared";

const config = loadConfig();
const logger = createLogger("aggregation-worker", config.LOG_LEVEL);

logger.info(createHealthStatus("aggregation-worker"), "aggregation worker bootstrap complete");
