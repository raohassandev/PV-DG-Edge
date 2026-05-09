import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import { loadConfig } from "@pvdg/config";
import { checkDatabaseHealth } from "@pvdg/db";
import { createClient } from "redis";

interface ServiceHealth {
  status: "ok" | "degraded" | "down" | "not_configured";
  latencyMs?: number | null;
  error?: {
    code: string;
    message: string;
  };
}

async function checkRedisHealth(redisUrl: string): Promise<ServiceHealth> {
  const startedAt = performance.now();
  const client = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 500,
      reconnectStrategy: false
    }
  });

  client.on("error", () => undefined);

  try {
    await client.connect();
    await client.ping();
    return { status: "ok", latencyMs: Math.round(performance.now() - startedAt) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Redis health check failed";
    return {
      status: "down",
      latencyMs: Math.round(performance.now() - startedAt),
      error: { code: "REDIS_HEALTH_ERROR", message }
    };
  } finally {
    if (client.isOpen) {
      await client.quit();
    }
  }
}

function overallStatus(services: Record<string, ServiceHealth>): "ok" | "degraded" | "down" {
  const statuses = Object.values(services).map((service) => service.status);
  if (statuses.includes("down")) {
    return "degraded";
  }
  if (statuses.includes("degraded") || statuses.includes("not_configured")) {
    return "degraded";
  }
  return "ok";
}

export function buildServer(): FastifyInstance {
  const app = Fastify();

  app.get("/api/v1/system/health", async (request) => {
    const config = loadConfig();
    const database = await checkDatabaseHealth();
    const redis = await checkRedisHealth(config.REDIS_URL);
    const services = {
      api: { status: "ok" },
      database,
      redis,
      mqtt: config.MQTT_URL ? { status: "not_configured" } : { status: "not_configured" }
    } satisfies Record<string, ServiceHealth>;

    return {
      success: true,
      data: {
        status: overallStatus(services),
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
        version: process.env.npm_package_version ?? "0.1.0",
        environment: config.NODE_ENV,
        services
      },
      meta: {
        requestId: request.id
      }
    };
  });

  return app;
}
