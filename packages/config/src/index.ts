import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  DATABASE_URL: z.string().url().optional(),
  POSTGRES_HOST: z.string().default("localhost"),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_DB: z.string().default("pvdg_edge"),
  POSTGRES_USER: z.string().default("pvdg"),
  POSTGRES_PASSWORD: z.string().optional(),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  MQTT_URL: z.string().url().default("mqtt://localhost:1883")
});

export type AppConfig = z.infer<typeof envSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const config = envSchema.parse(env);

  if (config.NODE_ENV === "production" && !config.DATABASE_URL && !config.POSTGRES_PASSWORD) {
    throw new Error("POSTGRES_PASSWORD or DATABASE_URL is required in production");
  }

  return config;
}

export function getPostgresConnectionString(config: AppConfig): string | undefined {
  if (config.DATABASE_URL) {
    return config.DATABASE_URL;
  }

  if (!config.POSTGRES_PASSWORD) {
    return undefined;
  }

  const user = encodeURIComponent(config.POSTGRES_USER);
  const password = encodeURIComponent(config.POSTGRES_PASSWORD);
  return `postgres://${user}:${password}@${config.POSTGRES_HOST}:${config.POSTGRES_PORT}/${config.POSTGRES_DB}`;
}
