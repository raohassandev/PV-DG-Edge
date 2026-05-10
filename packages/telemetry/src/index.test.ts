import { describe, expect, it } from "vitest";
import { parseCanonicalTelemetryJson, validateCanonicalTelemetry } from "./index.js";

const validPayload = {
  schemaVersion: "1.0",
  ts: "2026-05-09T10:00:00.000Z",
  siteId: "11111111-1111-4111-8111-111111111111",
  deviceId: "22222222-2222-4222-8222-222222222222",
  deviceType: "grid_meter",
  source: "modbus_tcp",
  quality: 192,
  metrics: {
    "ac.power.total_kw": { value: 120.5, unit: "kW", quality: 192 }
  }
};

describe("canonical telemetry validation", () => {
  it("accepts a canonical telemetry payload", () => {
    const result = validateCanonicalTelemetry(validPayload);
    expect(result.valid).toBe(true);
    expect(result.payload?.metrics["ac.power.total_kw"]?.value).toBe(120.5);
  });

  it("rejects invalid JSON and string numeric metrics", () => {
    expect(parseCanonicalTelemetryJson("{")).toMatchObject({ valid: false });
    expect(validateCanonicalTelemetry({
      ...validPayload,
      metrics: { "ac.power.total_kw": { value: "120.5", unit: "kW" } }
    })).toMatchObject({ valid: false });
  });
});
