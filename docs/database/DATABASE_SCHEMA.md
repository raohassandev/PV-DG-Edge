# Database Schema

Phase 2 defines the PostgreSQL and TimescaleDB foundation for the local PV-DG Edge platform.

Implemented tables:

- `schema_migrations`
- `sites`
- `users`
- `roles`
- `permissions`
- `role_permissions`
- `user_roles`
- `devices`
- `device_register_maps`
- `telemetry_raw`
- `telemetry_latest`
- `telemetry_5min`
- `telemetry_hourly`
- `telemetry_daily`
- `alarms`
- `audit_log`
- `system_events`

TimescaleDB hypertables are created for `telemetry_raw`, `telemetry_5min`, `telemetry_hourly`, and `telemetry_daily`.

Extensions:

- `pgcrypto`
- `timescaledb`

Indexes are defined in `000002_timescale_policies_indexes.up.sql`.

Retention policy for `telemetry_raw` is only added when `pvdg.telemetry_raw_retention_days` is configured in the database session; no default data deletion policy is enabled by the committed migration.

