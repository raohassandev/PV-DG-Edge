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

- Date: 2026-05-09
  Phase: 02 Database and deployment
  Area: API surface
  Limitation: Only `GET /api/v1/system/health` is implemented. Auth, RBAC, site/device/driver CRUD, telemetry APIs, alarms, commands, audit queries, and reports remain pending.
  Impact: The system can validate infrastructure health but cannot yet operate PV-DG workflows.
  Workaround: Use database migrations and seed data as the foundation for Phase 3.
  Next action: Implement Phase 3 API auth/RBAC/site/device/driver management.

- Date: 2026-05-09
  Phase: 02 Database and deployment
  Area: MQTT security
  Limitation: Mosquitto allows anonymous access for Phase 2 local testing.
  Impact: MQTT is not production-secure yet.
  Workaround: Keep Mosquitto on trusted local networks only during Phase 2.
  Next action: Add MQTT username/password and ACLs in Phase 4.

- Date: 2026-05-09
  Phase: 02 Database and deployment
  Area: On-site Linux PC deployment
  Limitation: Live deployment and cleanup depend on successful SSH access and target verification.
  Impact: Local repo implementation can be verified independently, but on-site deployment must not be claimed until both localhost and LAN health checks pass.
  Workaround: Use `docs/deployment/ON_SITE_PC_DEPLOYMENT_RUNBOOK.md` and inventory script when SSH access is available.
  Next action: Run target inventory before any cleanup, then deploy and verify.

- Date: 2026-05-09
  Phase: 02C Interactive on-site deployment
  Area: Linux PC sudo access
  Limitation: The target accepts SSH for `amx-dev`, but this automation environment cannot accept typed input at the interactive `sudo -v` prompt. Docker is not installed and `/opt/pvdg-edge-local` does not exist yet.
  Impact: The stack cannot be installed or started on the Linux PC from this session, so localhost/LAN health checks, web response, migrations, seed data, and Docker service verification remain pending.
  Workaround: Run the documented sudo deployment commands from a real interactive terminal on the Linux PC or an SSH session where the operator can type the sudo password manually.
  Next action: Complete sudo validation, install Docker, create `/opt/pvdg-edge-local`, clone the repo, create target-only `.env`, and run the compose deployment.

- Date: 2026-05-09
  Phase: 02D Actual Docker deployment
  Area: MQTT health/security
  Limitation: API health reports overall status `degraded` because MQTT health remains `not_configured`; Mosquitto is running but authenticated MQTT health and ACLs are deferred.
  Impact: Web, API, DB, Redis, migrations, and seed data are verified, but MQTT security and telemetry verification are not production-complete.
  Workaround: Keep Mosquitto on the trusted local network for Phase 2.
  Next action: Implement MQTT authentication, ACLs, and telemetry health in Phase 4.

- Date: 2026-05-10
  Phase: 03 API auth/RBAC/site/device/driver
  Area: Auth/session management
  Limitation: Access and refresh tokens are stateless signed tokens; logout acknowledges the request but does not revoke already issued refresh tokens server-side.
  Impact: A stolen refresh token remains usable until expiry.
  Workaround: Keep tokens short-lived and rotate secrets if compromise is suspected.
  Next action: Add persistent refresh-token/session storage and revocation before broader user rollout.

- Date: 2026-05-10
  Phase: 03 API auth/RBAC/site/device/driver
  Area: Device driver operations
  Limitation: Driver import stores metadata/manifests only. Device connection tests and register reads return `NOT_IMPLEMENTED` until acquisition/driver validation phases.
  Impact: Engineers can configure site/device/driver records, but cannot yet test physical Modbus devices through the API.
  Workaround: Use CRUD/configuration endpoints only.
  Next action: Implement validated driver loading and Modbus operations in Phase 5.
