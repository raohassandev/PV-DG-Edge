import { runMigrations, shutdownDatabase } from "./index.js";

try {
  await runMigrations();
} finally {
  await shutdownDatabase();
}
