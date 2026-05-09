import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import { getDatabaseHealth } from "@pvdg/db";
import { createHealthStatus } from "@pvdg/shared";

export function buildServer(): FastifyInstance {
  const app = Fastify();

  app.get("/api/v1/system/health", async () => ({
    success: true,
    data: {
      ...createHealthStatus("api"),
      dependencies: {
        database: getDatabaseHealth()
      }
    },
    meta: {
      requestId: "bootstrap"
    }
  }));

  return app;
}
