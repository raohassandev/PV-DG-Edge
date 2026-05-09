import { describe, expect, it } from "vitest";
import { buildServer } from "./server.js";

describe("api health endpoint", () => {
  it("returns the Phase 2 health response shape", async () => {
    const server = buildServer();
    const response = await server.inject({
      method: "GET",
      url: "/api/v1/system/health"
    });

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
