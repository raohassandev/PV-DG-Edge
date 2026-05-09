import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { getPostgresConnectionString, loadConfig } from "@pvdg/config";
import type { AppConfig } from "@pvdg/config";

const { Pool } = pg;

export type DependencyStatus = "ok" | "degraded" | "down" | "not_configured";

export interface DatabaseHealth {
  status: DependencyStatus;
  latencyMs: number | null;
  error?: {
    code: string;
    message: string;
  };
}

export interface MigrationRecord {
  filename: string;
  checksum: string;
  appliedAt: Date;
}

export interface MigrationStatus {
  filename: string;
  checksum: string;
  applied: boolean;
  appliedAt: Date | null;
}

let sharedPool: pg.Pool | undefined;

function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
}

function migrationsDir(): string {
  return path.join(repoRoot(), "database", "migrations");
}

function seedsDir(): string {
  return path.join(repoRoot(), "database", "seeds");
}

export function createDatabasePool(config: AppConfig = loadConfig()): pg.Pool | undefined {
  const connectionString = getPostgresConnectionString(config);

  if (!connectionString) {
    return undefined;
  }

  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000
  });
}

export function getDatabasePool(): pg.Pool | undefined {
  sharedPool ??= createDatabasePool();
  return sharedPool;
}

export async function shutdownDatabase(): Promise<void> {
  if (sharedPool) {
    await sharedPool.end();
    sharedPool = undefined;
  }
}

function safeDbError(error: unknown): DatabaseHealth["error"] {
  if (error instanceof Error) {
    const code = "code" in error && typeof error.code === "string" ? error.code : "DB_ERROR";
    return { code, message: error.message };
  }

  return { code: "DB_ERROR", message: "Database health check failed" };
}

export async function checkDatabaseHealth(pool = getDatabasePool()): Promise<DatabaseHealth> {
  if (!pool) {
    return { status: "not_configured", latencyMs: null };
  }

  const startedAt = performance.now();

  try {
    await pool.query("select 1");
    return { status: "ok", latencyMs: Math.round(performance.now() - startedAt) };
  } catch (error) {
    return {
      status: "down",
      latencyMs: Math.round(performance.now() - startedAt),
      error: safeDbError(error)
    };
  }
}

async function ensureMigrationTable(client: pg.PoolClient): Promise<void> {
  await client.query(`
    create table if not exists schema_migrations (
      filename text primary key,
      checksum text not null,
      applied_at timestamptz not null default now()
    )
  `);
}

async function listMigrationFiles(suffix: ".up.sql" | ".down.sql"): Promise<string[]> {
  const files = await readdir(migrationsDir());
  return files.filter((file) => file.endsWith(suffix)).sort();
}

async function readSqlFile(directory: string, filename: string): Promise<{ sql: string; checksum: string }> {
  const sql = await readFile(path.join(directory, filename), "utf8");
  return {
    sql,
    checksum: createHash("sha256").update(sql).digest("hex")
  };
}

function isNonTransactional(sql: string): boolean {
  return /create\s+extension|create_hypertable|add_retention_policy|remove_retention_policy/i.test(sql);
}

export async function getMigrationStatus(pool = getDatabasePool()): Promise<MigrationStatus[]> {
  if (!pool) {
    throw new Error("Database is not configured. Set DATABASE_URL or POSTGRES_* environment values.");
  }

  const client = await pool.connect();
  try {
    await ensureMigrationTable(client);
    const applied = await client.query<MigrationRecord>(
      "select filename, checksum, applied_at as \"appliedAt\" from schema_migrations order by filename"
    );
    const appliedByName = new Map(applied.rows.map((row) => [row.filename, row]));
    const files = await listMigrationFiles(".up.sql");

    return Promise.all(
      files.map(async (filename) => {
        const { checksum } = await readSqlFile(migrationsDir(), filename);
        const record = appliedByName.get(filename);
        return {
          filename,
          checksum,
          applied: Boolean(record),
          appliedAt: record?.appliedAt ?? null
        };
      })
    );
  } finally {
    client.release();
  }
}

export async function runMigrations(pool = getDatabasePool()): Promise<void> {
  if (!pool) {
    throw new Error("Database is not configured. Set DATABASE_URL or POSTGRES_* environment values.");
  }

  const client = await pool.connect();
  try {
    await ensureMigrationTable(client);
    const files = await listMigrationFiles(".up.sql");

    for (const filename of files) {
      const { rows } = await client.query<{ checksum: string }>(
        "select checksum from schema_migrations where filename = $1",
        [filename]
      );
      const { sql, checksum } = await readSqlFile(migrationsDir(), filename);

      if (rows[0]) {
        if (rows[0].checksum !== checksum) {
          throw new Error(`Checksum mismatch for applied migration ${filename}`);
        }
        console.log(`skip ${filename}`);
        continue;
      }

      console.log(`apply ${filename}`);
      if (isNonTransactional(sql)) {
        await client.query(sql);
        await client.query("insert into schema_migrations (filename, checksum) values ($1, $2)", [filename, checksum]);
      } else {
        await client.query("begin");
        try {
          await client.query(sql);
          await client.query("insert into schema_migrations (filename, checksum) values ($1, $2)", [filename, checksum]);
          await client.query("commit");
        } catch (error) {
          await client.query("rollback");
          throw error;
        }
      }
    }
  } finally {
    client.release();
  }
}

export async function rollbackLastMigration(pool = getDatabasePool()): Promise<void> {
  if (!pool) {
    throw new Error("Database is not configured. Set DATABASE_URL or POSTGRES_* environment values.");
  }

  const client = await pool.connect();
  try {
    await ensureMigrationTable(client);
    const { rows } = await client.query<{ filename: string }>(
      "select filename from schema_migrations order by filename desc limit 1"
    );
    const last = rows[0]?.filename;

    if (!last) {
      console.log("no migrations to rollback");
      return;
    }

    const downFile = last.replace(".up.sql", ".down.sql");
    const { sql } = await readSqlFile(migrationsDir(), downFile);
    console.log(`rollback ${last}`);

    if (isNonTransactional(sql)) {
      await client.query(sql);
      await client.query("delete from schema_migrations where filename = $1", [last]);
      return;
    }

    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("delete from schema_migrations where filename = $1", [last]);
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  } finally {
    client.release();
  }
}

export async function seedDatabase(pool = getDatabasePool()): Promise<void> {
  if (!pool) {
    throw new Error("Database is not configured. Set DATABASE_URL or POSTGRES_* environment values.");
  }

  const files = (await readdir(seedsDir())).filter((file) => file.endsWith(".sql")).sort();
  const client = await pool.connect();
  try {
    for (const file of files) {
      const { sql } = await readSqlFile(seedsDir(), file);
      console.log(`seed ${file}`);
      await client.query(sql);
    }
  } finally {
    client.release();
  }
}
