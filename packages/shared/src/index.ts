export type ServiceName =
  | "api"
  | "acquisition-worker"
  | "aggregation-worker"
  | "rules-worker"
  | "web";

export interface HealthStatus {
  service: ServiceName;
  status: "ok";
  timestamp: string;
}

export function createHealthStatus(service: ServiceName): HealthStatus {
  return {
    service,
    status: "ok",
    timestamp: new Date().toISOString()
  };
}
