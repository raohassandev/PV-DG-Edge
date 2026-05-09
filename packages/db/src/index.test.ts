import { describe, expect, it } from "vitest";
import { checkDatabaseHealth } from "./index.js";

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
