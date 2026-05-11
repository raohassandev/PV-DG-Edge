import { z } from "zod";

export const telemetryDeviceTypes = [
  "grid_meter",
  "load_meter",
  "solar_inverter",
  "solar_meter",
  "generator_meter",
  "generator_controller",
  "plc",
  "weather_station",
  "system",
  "gateway",
  "other"
] as const;

export const telemetrySources = ["modbus_tcp", "modbus_rtu", "mqtt", "manual", "system", "acquisition-worker"] as const;

export const canonicalMetricValueSchema = z.object({
  value: z.number().finite(),
  unit: z.string().min(1).optional(),
  quality: z.number().int().min(0).max(255).optional(),
  sourceAddress: z.string().min(1).optional(),
  scale: z.number().finite().optional()
});

export const canonicalTelemetrySchema = z.object({
  schemaVersion: z.string().min(1).default("1.0"),
  ts: z.string().datetime(),
  siteId: z.string().uuid(),
  siteSlug: z.string().min(1).optional(),
  deviceId: z.string().uuid(),
  deviceSlug: z.string().min(1).optional(),
  deviceType: z.enum(telemetryDeviceTypes),
  source: z.enum(telemetrySources),
  quality: z.number().int().min(0).max(255),
  metrics: z.record(z.string().min(1), canonicalMetricValueSchema).refine((metrics) => Object.keys(metrics).length > 0, {
    message: "At least one metric is required"
  }),
  rawRef: z.record(z.unknown()).optional()
});

export type CanonicalMetricValue = z.infer<typeof canonicalMetricValueSchema>;
export type CanonicalTelemetryPayload = z.infer<typeof canonicalTelemetrySchema>;

export interface TelemetryValidationResult {
  valid: boolean;
  payload?: CanonicalTelemetryPayload;
  errors?: string[];
}

export function validateCanonicalTelemetry(input: unknown): TelemetryValidationResult {
  const result = canonicalTelemetrySchema.safeParse(input);
  if (result.success) {
    return { valid: true, payload: result.data };
  }

  return {
    valid: false,
    errors: result.error.issues.map((issue) => `${issue.path.join(".") || "payload"}: ${issue.message}`)
  };
}

export function parseCanonicalTelemetryJson(json: string | Buffer): TelemetryValidationResult {
  try {
    return validateCanonicalTelemetry(JSON.parse(json.toString()));
  } catch {
    return { valid: false, errors: ["payload: Invalid JSON"] };
  }
}
