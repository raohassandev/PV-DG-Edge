import type pg from "pg";
import type { CanonicalTelemetryPayload } from "@pvdg/telemetry";
import { getDatabasePool } from "./index.js";

export type TelemetryQualityText = "ok" | "degraded" | "bad";

export function telemetryQualityText(quality: number): TelemetryQualityText {
  if (quality >= 192) return "ok";
  if (quality >= 64) return "degraded";
  return "bad";
}

export async function persistCanonicalTelemetry(
  payload: CanonicalTelemetryPayload,
  sourceTopic?: string,
  pool: pg.Pool | undefined = getDatabasePool()
): Promise<void> {
  if (!pool) return;

  const client = await pool.connect();
  const quality = telemetryQualityText(payload.quality);

  try {
    await client.query("begin");
    await client.query(
      `insert into telemetry_raw (time, site_id, device_id, source_topic, payload, quality)
       values ($1, $2, $3, $4, $5, $6)`,
      [payload.ts, payload.siteId, payload.deviceId, sourceTopic ?? null, payload, quality]
    );

    for (const [parameterKey, metric] of Object.entries(payload.metrics)) {
      await client.query(
        `insert into telemetry_latest
          (site_id, device_id, parameter_key, value_numeric, value_text, unit, quality, source_time, updated_at)
         values ($1, $2, $3, $4, null, $5, $6, $7, now())
         on conflict (device_id, parameter_key) do update set
          site_id = excluded.site_id,
          value_numeric = excluded.value_numeric,
          value_text = excluded.value_text,
          unit = excluded.unit,
          quality = excluded.quality,
          source_time = excluded.source_time,
          updated_at = now()`,
        [
          payload.siteId,
          payload.deviceId,
          parameterKey,
          metric.value,
          metric.unit ?? null,
          telemetryQualityText(metric.quality ?? payload.quality),
          payload.ts
        ]
      );
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
