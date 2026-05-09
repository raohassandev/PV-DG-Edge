# Migrations

Migrations are plain SQL files in `database/migrations`.

Commands:

```bash
npx pnpm@9.15.4 db:status
npx pnpm@9.15.4 db:migrate
npx pnpm@9.15.4 db:rollback
npx pnpm@9.15.4 db:seed
```

On the deployed Linux PC, run migrations inside the API container:

```bash
docker compose --env-file .env -f deploy/docker-compose.local.yml exec api pnpm --filter @pvdg/db migrate
docker compose --env-file .env -f deploy/docker-compose.local.yml exec api pnpm --filter @pvdg/db seed
docker compose --env-file .env -f deploy/docker-compose.local.yml exec api pnpm --filter @pvdg/db status
```

Verified on `site-gatway`:

- `000001_initial_core_schema.up.sql`
- `000002_timescale_policies_indexes.up.sql`

Behavior:

- `schema_migrations` is created automatically.
- Applied migrations are recorded by filename, checksum, and `applied_at`.
- Migrations run once.
- Checksum mismatch stops execution.
- Rollback rolls back only the latest migration and is intended for development or explicit administrator use.
- SQL containing TimescaleDB extension, hypertable, or retention-policy statements is run outside the explicit transaction wrapper.
