import { getMigrationStatus, shutdownDatabase } from "./index.js";

try {
  const statuses = await getMigrationStatus();
  for (const status of statuses) {
    const appliedAt = status.appliedAt ? status.appliedAt.toISOString() : "-";
    console.log(`${status.applied ? "applied" : "pending"} ${status.filename} ${appliedAt}`);
  }
} finally {
  await shutdownDatabase();
}
