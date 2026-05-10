import { describe, expect, it } from "vitest";
import { MemoryLiveTelemetryStore, processMqttTelemetryMessage } from "./realtime.js";
import { buildServer } from "./server.js";
import { MemoryApiStore } from "./store.js";

async function setupAdmin() {
  const store = new MemoryApiStore();
  const server = buildServer({ store, jwtSecret: "test-jwt", sessionSecret: "test-session" });
  const setup = await server.inject({
    method: "POST",
    url: "/api/v1/auth/setup-admin",
    payload: { fullName: "Admin User", email: "admin@example.com", password: "very-secure-password" }
  });
  expect(setup.statusCode).toBe(201);
  const login = await server.inject({
    method: "POST",
    url: "/api/v1/auth/login",
    payload: { email: "admin@example.com", password: "very-secure-password" }
  });
  expect(login.statusCode).toBe(200);
  return { server, token: login.json().data.accessToken as string };
}

describe("api health endpoint", () => {
  it("returns the Phase 2 health response shape", async () => {
    const server = buildServer({ store: new MemoryApiStore() });
    const response = await server.inject({ method: "GET", url: "/api/v1/system/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      success: true,
      data: {
        services: {
          api: { status: "ok" },
          database: { status: "not_configured" },
          mqtt: { status: "not_configured" }
        }
      }
    });
    expect(response.json().data.status).toMatch(/ok|degraded/);
  });
});

describe("auth and site routes", () => {
  it("creates the first admin, logs in, and reads /auth/me", async () => {
    const { server, token } = await setupAdmin();
    const me = await server.inject({ method: "GET", url: "/api/v1/auth/me", headers: { authorization: `Bearer ${token}` } });

    expect(me.statusCode).toBe(200);
    expect(me.json().data.email).toBe("admin@example.com");
    expect(me.json().data.permissions).toContain("admin.manage");
  });

  it("protects site routes without a bearer token", async () => {
    const server = buildServer({ store: new MemoryApiStore() });
    const response = await server.inject({ method: "GET", url: "/api/v1/sites" });

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("AUTH_REQUIRED");
  });

  it("creates and lists sites for an authenticated admin", async () => {
    const { server, token } = await setupAdmin();
    const created = await server.inject({
      method: "POST",
      url: "/api/v1/sites",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Plant 1", code: "PLANT1", timezone: "Asia/Karachi" }
    });

    expect(created.statusCode).toBe(201);
    expect(created.json().data.code).toBe("PLANT1");

    const list = await server.inject({
      method: "GET",
      url: "/api/v1/sites",
      headers: { authorization: `Bearer ${token}` }
    });

    expect(list.statusCode).toBe(200);
    expect(list.json().data).toHaveLength(1);
  });
});

describe("live telemetry", () => {
  it("accepts canonical MQTT telemetry and returns a site snapshot", async () => {
    const liveTelemetryStore = new MemoryLiveTelemetryStore();
    const payload = {
      schemaVersion: "1.0",
      ts: "2026-05-09T10:00:00.000Z",
      siteId: "11111111-1111-4111-8111-111111111111",
      siteSlug: "demo",
      deviceId: "22222222-2222-4222-8222-222222222222",
      deviceSlug: "grid-meter-01",
      deviceType: "grid_meter",
      source: "modbus_tcp",
      quality: 192,
      metrics: {
        "ac.power.total_kw": { value: 120.5, unit: "kW", quality: 192 }
      }
    };

    const accepted = await processMqttTelemetryMessage(liveTelemetryStore, JSON.stringify(payload));
    expect(accepted).toMatchObject({ accepted: true, hint: { changed: ["ac.power.total_kw"] } });

    const serverWithTelemetry = buildServer({
      store: new MemoryApiStore(),
      liveTelemetryStore,
      jwtSecret: "test-jwt",
      sessionSecret: "test-session",
      mqttStatus: () => ({ status: "ok" })
    });
    const setup = await serverWithTelemetry.inject({
      method: "POST",
      url: "/api/v1/auth/setup-admin",
      payload: { fullName: "Admin User", email: "admin@example.com", password: "very-secure-password" }
    });
    expect(setup.statusCode).toBe(201);
    const login = await serverWithTelemetry.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "admin@example.com", password: "very-secure-password" }
    });
    const response = await serverWithTelemetry.inject({
      method: "GET",
      url: `/api/v1/telemetry/live/site/${payload.siteId}`,
      headers: { authorization: `Bearer ${login.json().data.accessToken as string}` }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.payload.metrics["ac.power.total_kw"].value).toBe(120.5);
  });
});
