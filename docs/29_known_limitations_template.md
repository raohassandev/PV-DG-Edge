# Known Limitations

Codex must update this whenever work is incomplete.

## Format

```text
Date:
Phase:
Area:
Limitation:
Impact:
Workaround:
Next action:
```

## Current limitations

- Date: 2026-05-09
  Phase: 01 Bootstrap
  Area: API/database integrations
  Limitation: The API exposes only `GET /api/v1/system/health`; database, Redis, MQTT, auth, RBAC, CRUD, telemetry, alarms, commands, and reporting endpoints are not implemented yet.
  Impact: The platform can compile and start as a skeleton, but it cannot operate a site or ingest device data.
  Workaround: Use the health endpoint and Docker skeleton only for bootstrap validation.
  Next action: Continue with Phase 02 database migrations and DB health.

- Date: 2026-05-09
  Phase: 01 Bootstrap
  Area: Worker services
  Limitation: Acquisition, aggregation, and rules workers only start and log bootstrap health; no polling, MQTT subscriptions, rollups, rules, or command execution are implemented.
  Impact: No telemetry collection, persistence, KPI aggregation, alarm lifecycle, or control path exists yet.
  Workaround: None for production use; later phases must implement the worker responsibilities from the architecture docs.
  Next action: Add database foundations in Phase 02 before connecting worker persistence.
