import { rollbackLastMigration, shutdownDatabase } from "./index.js";

try {
  await rollbackLastMigration();
} finally {
  await shutdownDatabase();
}
