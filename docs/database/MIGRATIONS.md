# Migrations

Migrations are plain SQL files in `database/migrations`.

Commands:

```bash
npx pnpm@9.15.4 db:status
npx pnpm@9.15.4 db:migrate
npx pnpm@9.15.4 db:rollback
npx pnpm@9.15.4 db:seed
```

Behavior:

- `schema_migrations` is created automatically.
- Applied migrations are recorded by filename, checksum, and `applied_at`.
- Migrations run once.
- Checksum mismatch stops execution.
- Rollback rolls back only the latest migration and is intended for development or explicit administrator use.
- SQL containing TimescaleDB extension, hypertable, or retention-policy statements is run outside the explicit transaction wrapper.

