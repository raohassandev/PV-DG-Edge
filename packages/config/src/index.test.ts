import { describe, expect, it } from "vitest";
import { getPostgresConnectionString, loadConfig } from "./index.js";

describe("loadConfig", () => {
  it("parses development defaults without a database password", () => {
    const config = loadConfig({ NODE_ENV: "development" });

    expect(config.POSTGRES_DB).toBe("pvdg_edge");
    expect(getPostgresConnectionString(config)).toBeUndefined();
  });

  it("requires database credentials in production", () => {
    expect(() => loadConfig({ NODE_ENV: "production" })).toThrow(
      "POSTGRES_PASSWORD or DATABASE_URL is required in production"
    );
  });

  it("builds a connection string from POSTGRES values", () => {
    const config = loadConfig({
      NODE_ENV: "production",
      POSTGRES_HOST: "db",
      POSTGRES_PORT: "5432",
      POSTGRES_DB: "pvdg_edge",
      POSTGRES_USER: "pvdg",
      POSTGRES_PASSWORD: "secret"
    });

    expect(getPostgresConnectionString(config)).toBe("postgres://pvdg:secret@db:5432/pvdg_edge");
  });
});
