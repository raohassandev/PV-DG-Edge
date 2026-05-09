export type TelemetryQuality = "good" | "uncertain" | "bad";

export interface CanonicalTelemetryPoint {
  siteId: string;
  deviceId: string;
  metric: string;
  value: number;
  unit: string;
  quality: TelemetryQuality;
  timestamp: string;
}
