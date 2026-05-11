import { describe, expect, it } from "vitest";
import { checkDatabaseHealth } from "./index.js";
import { persistCanonicalTelemetry, telemetryQualityText } from "./telemetry.js";

describe("checkDatabaseHealth", () => {
  it("returns not_configured when no pool is available", async () => {
    await expect(checkDatabaseHealth(undefined)).resolves.toEqual({
      status: "not_configured",
      latencyMs: null
    });
  });

  it("returns down with a safe error when the query fails", async () => {
    const pool = {
      query: async () => {
        throw Object.assign(new Error("connection refused"), { code: "ECONNREFUSED" });
      }
    };

    const result = await checkDatabaseHealth(pool as never);

    expect(result.status).toBe("down");
    expect(result.error).toEqual({ code: "ECONNREFUSED", message: "connection refused" });
    expect(result.latencyMs).toEqual(expect.any(Number));
  });
});

describe("persistCanonicalTelemetry", () => {
  const payload = {
    schemaVersion: "1.0",
    ts: "2026-05-09T10:00:00.000Z",
    siteId: "11111111-1111-4111-8111-111111111111",
    deviceId: "22222222-2222-4222-8222-222222222222",
    deviceType: "grid_meter",
    source: "modbus_tcp",
    quality: 192,
    metrics: {
      voltage_l1: { value: 230.5, unit: "V", quality: 192 },
      current_l1: { value: 10.25, unit: "A", quality: 64 }
    }
  } as const;

  it("maps numeric telemetry quality to persisted text", () => {
    expect(telemetryQualityText(192)).toBe("ok");
    expect(telemetryQualityText(64)).toBe("degraded");
    expect(telemetryQualityText(0)).toBe("bad");
  });

  it("inserts raw telemetry and upserts latest metrics", async () => {
    const queries: Array<{ sql: string; values?: unknown[] }> = [];
    const client = {
      query: async (sql: string, values?: unknown[]) => {
        queries.push({ sql, values });
        return { rows: [] };
      },
      release: () => undefined
    };
    const pool = { connect: async () => client };

    await persistCanonicalTelemetry(payload, "pvdg/site/device/telemetry", pool as never);

    expect(queries.map((query) => query.sql)).toEqual(expect.arrayContaining(["begin", "commit"]));
    expect(queries.some((query) => query.sql.includes("insert into telemetry_raw"))).toBe(true);
    expect(queries.filter((query) => query.sql.includes("insert into telemetry_latest"))).toHaveLength(2);
    expect(queries.find((query) => query.sql.includes("insert into telemetry_raw"))?.values).toContain("pvdg/site/device/telemetry");
  });
});
