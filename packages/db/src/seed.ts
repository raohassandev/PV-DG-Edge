import { seedDatabase, shutdownDatabase } from "./index.js";

try {
  await seedDatabase();
} finally {
  await shutdownDatabase();
}
