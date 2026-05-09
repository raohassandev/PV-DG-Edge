export interface DatabaseHealth {
  configured: boolean;
  status: "not_connected";
}

export function getDatabaseHealth(): DatabaseHealth {
  return {
    configured: true,
    status: "not_connected"
  };
}
