import Fastify from "fastify";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { loadConfig } from "@pvdg/config";
import { checkDatabaseHealth } from "@pvdg/db";
import { createClient } from "redis";
import { z } from "zod";
import { createToken, hashPassword, verifyPassword, verifyToken } from "./auth.js";
import { PostgresApiStore } from "./store.js";
import type { ApiStore, UserRecord } from "./store.js";

interface ServiceHealth {
  status: "ok" | "degraded" | "down" | "not_configured";
  latencyMs?: number | null;
  error?: { code: string; message: string };
}

interface BuildServerOptions {
  store?: ApiStore;
  jwtSecret?: string;
  sessionSecret?: string;
}

interface AuthenticatedRequest extends FastifyRequest {
  user: UserRecord;
}

const siteSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  locationName: z.string().nullable().default(null),
  timezone: z.string().min(1).default("Asia/Karachi"),
  capacityKw: z.string().nullable().default(null)
});

const deviceSchema = z.object({
  siteId: z.string().uuid(),
  name: z.string().min(1),
  deviceKey: z.string().min(1),
  deviceType: z.enum(["grid_meter", "generator_meter", "solar_inverter", "load_meter", "weather_station", "plc", "gateway", "other"]),
  protocol: z.enum(["modbus_tcp", "modbus_rtu", "mqtt", "manual"]),
  enabled: z.boolean().default(true),
  connectionConfig: z.unknown().default({}),
  pollingIntervalMs: z.number().int().positive().default(1000)
});

const driverSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  protocol: z.enum(["modbus_tcp", "modbus_rtu", "mqtt", "manual"]),
  manifest: z.record(z.unknown()).default({})
});

async function checkRedisHealth(redisUrl: string): Promise<ServiceHealth> {
  const startedAt = performance.now();
  const client = createClient({ url: redisUrl, socket: { connectTimeout: 500, reconnectStrategy: false } });
  client.on("error", () => undefined);

  try {
    await client.connect();
    await client.ping();
    return { status: "ok", latencyMs: Math.round(performance.now() - startedAt) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Redis health check failed";
    return { status: "down", latencyMs: Math.round(performance.now() - startedAt), error: { code: "REDIS_HEALTH_ERROR", message } };
  } finally {
    if (client.isOpen) await client.quit();
  }
}

function overallStatus(services: Record<string, ServiceHealth>): "ok" | "degraded" | "down" {
  const statuses = Object.values(services).map((service) => service.status);
  if (statuses.includes("down") || statuses.includes("degraded") || statuses.includes("not_configured")) return "degraded";
  return "ok";
}

function ok(request: FastifyRequest, data: unknown) {
  return { success: true, data, meta: { requestId: request.id } };
}

function fail(request: FastifyRequest, code: string, message: string) {
  return { success: false, error: { code, message }, meta: { requestId: request.id } };
}

function parseBody<T>(schema: z.ZodSchema<T>, request: FastifyRequest, reply: FastifyReply): T | null {
  const result = schema.safeParse(request.body);
  if (!result.success) {
    reply.code(400);
    return null;
  }
  return result.data;
}

export function buildServer(options: BuildServerOptions = {}): FastifyInstance {
  const config = loadConfig();
  const store = options.store ?? new PostgresApiStore();
  const jwtSecret = options.jwtSecret ?? config.JWT_SECRET ?? "development-jwt-secret";
  const sessionSecret = options.sessionSecret ?? config.SESSION_SECRET ?? "development-session-secret";
  const app = Fastify();

  async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<UserRecord | null> {
    const header = request.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
    if (!token) {
      reply.code(401).send(fail(request, "AUTH_REQUIRED", "Authentication required"));
      return null;
    }

    const payload = verifyToken(token, jwtSecret);
    if (!payload) {
      reply.code(401).send(fail(request, "INVALID_TOKEN", "Invalid or expired token"));
      return null;
    }

    const user = await store.findUserById(payload.sub);
    if (!user?.isActive) {
      reply.code(401).send(fail(request, "INVALID_TOKEN", "Invalid or expired token"));
      return null;
    }

    (request as AuthenticatedRequest).user = user;
    return user;
  }

  function requirePermission(permission: string) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const user = await authenticate(request, reply);
      if (!user) return;
      if (!user.permissions.includes(permission) && !user.permissions.includes("admin.manage")) {
        reply.code(403).send(fail(request, "FORBIDDEN", "Permission denied"));
      }
    };
  }

  app.get("/api/v1/system/health", async (request) => {
    const database = await checkDatabaseHealth();
    const redis = await checkRedisHealth(config.REDIS_URL);
    const services = { api: { status: "ok" }, database, redis, mqtt: { status: "not_configured" } } satisfies Record<string, ServiceHealth>;
    return ok(request, { status: overallStatus(services), timestamp: new Date().toISOString(), uptimeSeconds: Math.round(process.uptime()), version: process.env.npm_package_version ?? "0.1.0", environment: config.NODE_ENV, services });
  });

  app.post("/api/v1/auth/setup-admin", async (request, reply) => {
    if (await store.hasUsers()) {
      reply.code(409);
      return fail(request, "SETUP_CLOSED", "First-run admin setup is already complete");
    }
    const body = parseBody(z.object({ fullName: z.string().min(1), email: z.string().email(), password: z.string().min(12) }), request, reply);
    if (!body) return fail(request, "VALIDATION_ERROR", "Invalid request");
    const user = await store.createAdmin({ fullName: body.fullName, email: body.email, passwordHash: hashPassword(body.password) });
    await store.audit({ actorUserId: user.id, action: "auth.setup_admin", entityType: "users", entityId: user.id });
    reply.code(201);
    return ok(request, { id: user.id, email: user.email, fullName: user.fullName });
  });

  app.post("/api/v1/auth/login", async (request, reply) => {
    const body = parseBody(z.object({ email: z.string().email(), password: z.string().min(1) }), request, reply);
    if (!body) return fail(request, "VALIDATION_ERROR", "Invalid request");
    const user = await store.findUserByEmail(body.email);
    if (!user || !verifyPassword(body.password, user.passwordHash) || !user.isActive) {
      reply.code(401);
      return fail(request, "INVALID_CREDENTIALS", "Invalid email or password");
    }
    return ok(request, {
      accessToken: createToken({ sub: user.id, email: user.email, permissions: user.permissions }, jwtSecret, 900),
      refreshToken: createToken({ sub: user.id, email: user.email, permissions: user.permissions }, sessionSecret, 60 * 60 * 24 * 7),
      user: { id: user.id, email: user.email, fullName: user.fullName, permissions: user.permissions }
    });
  });

  app.post("/api/v1/auth/refresh", async (request, reply) => {
    const body = parseBody(z.object({ refreshToken: z.string().min(1) }), request, reply);
    if (!body) return fail(request, "VALIDATION_ERROR", "Invalid request");
    const payload = verifyToken(body.refreshToken, sessionSecret);
    if (!payload) {
      reply.code(401);
      return fail(request, "INVALID_TOKEN", "Invalid or expired refresh token");
    }
    const user = await store.findUserById(payload.sub);
    if (!user?.isActive) {
      reply.code(401);
      return fail(request, "INVALID_TOKEN", "Invalid or expired refresh token");
    }
    return ok(request, { accessToken: createToken({ sub: user.id, email: user.email, permissions: user.permissions }, jwtSecret, 900) });
  });

  app.post("/api/v1/auth/logout", { preHandler: requirePermission("system.view") }, async (request) => ok(request, { loggedOut: true }));
  app.get("/api/v1/auth/me", { preHandler: requirePermission("system.view") }, async (request) => {
    const user = (request as AuthenticatedRequest).user;
    return ok(request, { id: user.id, email: user.email, fullName: user.fullName, permissions: user.permissions });
  });

  app.get("/api/v1/roles", { preHandler: requirePermission("admin.manage") }, async (request) => ok(request, await store.listRoles()));

  app.get("/api/v1/sites", { preHandler: requirePermission("site.view") }, async (request) => ok(request, await store.listSites()));
  app.post("/api/v1/sites", { preHandler: requirePermission("site.manage") }, async (request, reply) => {
    const body = parseBody(siteSchema, request, reply);
    if (!body) return fail(request, "VALIDATION_ERROR", "Invalid request");
    const site = await store.createSite({
      name: body.name,
      code: body.code,
      locationName: body.locationName ?? null,
      timezone: body.timezone ?? "Asia/Karachi",
      capacityKw: body.capacityKw ?? null
    });
    await store.audit({ actorUserId: (request as AuthenticatedRequest).user.id, action: "site.create", entityType: "sites", entityId: site.id, after: site });
    reply.code(201);
    return ok(request, site);
  });
  app.get("/api/v1/sites/:siteId", { preHandler: requirePermission("site.view") }, async (request, reply) => {
    const site = await store.getSite((request.params as { siteId: string }).siteId);
    if (!site) { reply.code(404); return fail(request, "NOT_FOUND", "Site not found"); }
    return ok(request, site);
  });
  app.patch("/api/v1/sites/:siteId", { preHandler: requirePermission("site.manage") }, async (request, reply) => {
    const body = parseBody(siteSchema.partial(), request, reply);
    if (!body) return fail(request, "VALIDATION_ERROR", "Invalid request");
    const site = await store.updateSite((request.params as { siteId: string }).siteId, body);
    if (!site) { reply.code(404); return fail(request, "NOT_FOUND", "Site not found"); }
    await store.audit({ actorUserId: (request as AuthenticatedRequest).user.id, action: "site.update", entityType: "sites", entityId: site.id, after: site });
    return ok(request, site);
  });
  app.delete("/api/v1/sites/:siteId", { preHandler: requirePermission("site.manage") }, async (request, reply) => {
    const deleted = await store.deleteSite((request.params as { siteId: string }).siteId);
    if (!deleted) { reply.code(404); return fail(request, "NOT_FOUND", "Site not found"); }
    return ok(request, { deleted: true });
  });

  app.get("/api/v1/devices", { preHandler: requirePermission("device.view") }, async (request) => ok(request, await store.listDevices()));
  app.post("/api/v1/devices", { preHandler: requirePermission("device.manage") }, async (request, reply) => {
    const body = parseBody(deviceSchema, request, reply);
    if (!body) return fail(request, "VALIDATION_ERROR", "Invalid request");
    const device = await store.createDevice({
      siteId: body.siteId,
      name: body.name,
      deviceKey: body.deviceKey,
      deviceType: body.deviceType,
      protocol: body.protocol,
      enabled: body.enabled ?? true,
      connectionConfig: body.connectionConfig ?? {},
      pollingIntervalMs: body.pollingIntervalMs ?? 1000
    });
    await store.audit({ actorUserId: (request as AuthenticatedRequest).user.id, action: "device.create", entityType: "devices", entityId: device.id, after: device });
    reply.code(201);
    return ok(request, device);
  });
  app.get("/api/v1/devices/:deviceId", { preHandler: requirePermission("device.view") }, async (request, reply) => {
    const device = await store.getDevice((request.params as { deviceId: string }).deviceId);
    if (!device) { reply.code(404); return fail(request, "NOT_FOUND", "Device not found"); }
    return ok(request, device);
  });
  app.patch("/api/v1/devices/:deviceId", { preHandler: requirePermission("device.manage") }, async (request, reply) => {
    const body = parseBody(deviceSchema.partial(), request, reply);
    if (!body) return fail(request, "VALIDATION_ERROR", "Invalid request");
    const device = await store.updateDevice((request.params as { deviceId: string }).deviceId, body);
    if (!device) { reply.code(404); return fail(request, "NOT_FOUND", "Device not found"); }
    return ok(request, device);
  });
  app.delete("/api/v1/devices/:deviceId", { preHandler: requirePermission("device.manage") }, async (request, reply) => {
    const deleted = await store.deleteDevice((request.params as { deviceId: string }).deviceId);
    if (!deleted) { reply.code(404); return fail(request, "NOT_FOUND", "Device not found"); }
    return ok(request, { deleted: true });
  });
  app.post("/api/v1/devices/:deviceId/test-connection", { preHandler: requirePermission("device.manage") }, async (request, reply) => {
    reply.code(501);
    return fail(request, "NOT_IMPLEMENTED", "Device connection tests are scheduled for the acquisition phase");
  });
  app.post("/api/v1/devices/:deviceId/read-register", { preHandler: requirePermission("device.manage") }, async (request, reply) => {
    reply.code(501);
    return fail(request, "NOT_IMPLEMENTED", "Register reads require validated driver files and are scheduled for the acquisition phase");
  });

  app.get("/api/v1/drivers", { preHandler: requirePermission("device.view") }, async (request) => ok(request, await store.listDrivers()));
  app.post("/api/v1/drivers/import", { preHandler: requirePermission("device.manage") }, async (request, reply) => {
    const body = parseBody(driverSchema, request, reply);
    if (!body) return fail(request, "VALIDATION_ERROR", "Invalid request");
    const driver = await store.createDriver({ name: body.name, version: body.version, protocol: body.protocol, manifest: body.manifest ?? {} });
    reply.code(201);
    return ok(request, driver);
  });
  app.get("/api/v1/drivers/:driverId", { preHandler: requirePermission("device.view") }, async (request, reply) => {
    const driver = await store.getDriver((request.params as { driverId: string }).driverId);
    if (!driver) { reply.code(404); return fail(request, "NOT_FOUND", "Driver not found"); }
    return ok(request, driver);
  });
  app.post("/api/v1/drivers/:driverId/validate", { preHandler: requirePermission("device.manage") }, async (request, reply) => {
    const driver = await store.getDriver((request.params as { driverId: string }).driverId);
    if (!driver) { reply.code(404); return fail(request, "NOT_FOUND", "Driver not found"); }
    return ok(request, { valid: true, warnings: ["Register semantics are not verified until manuals or driver maps are supplied"] });
  });
  app.get("/api/v1/drivers/:driverId/export", { preHandler: requirePermission("device.view") }, async (request, reply) => {
    const driver = await store.getDriver((request.params as { driverId: string }).driverId);
    if (!driver) { reply.code(404); return fail(request, "NOT_FOUND", "Driver not found"); }
    return ok(request, driver);
  });

  return app;
}
