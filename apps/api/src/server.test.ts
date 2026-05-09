import { describe, expect, it } from "vitest";
import { buildServer } from "./server.js";

describe("api health endpoint", () => {
  it("returns an ok health response", async () => {
    const server = buildServer();
    const response = await server.inject({
      method: "GET",
      url: "/api/v1/system/health"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      success: true,
      data: {
        service: "api",
        status: "ok"
      }
    });
  });
});
