# Phase 2D Actual Docker Deployment

Date/time: 2026-05-09 23:40 Asia/Karachi.

## Target

- Hostname/IP: `site-gatway` / `192.168.0.188`
- SSH user: `amx-dev`
- Project path: `/opt/pvdg-edge-local/app`
- Compose file: `deploy/docker-compose.local.yml`

## Docker Permission

Command:

```bash
ssh amx-dev@192.168.0.188 "hostname && whoami && id && docker ps >/dev/null 2>&1 && echo DOCKER_OK || echo DOCKER_NEEDS_SUDO"
```

Result: `DOCKER_OK`

Sudo docker fallback used: no.

## Fixes Made

- Added `deploy/scripts/lib_compose.sh` to choose `docker compose` or `sudo docker compose` without printing secrets.
- Updated deployment scripts to always run compose from the app directory with `--env-file .env`.
- Added required target `.env` checks for database, Redis, MQTT, JWT, and session secrets.
- Added `JWT_SECRET` and `SESSION_SECRET` placeholders to `.env.example`.
- Changed API healthcheck from `wget` to a Node-based check because the API image does not include `wget`.
- Kept worker processes alive so compose services do not restart after bootstrap logging.

## Deployment Commands

```bash
ssh amx-dev@192.168.0.188 "cd /opt/pvdg-edge-local/app && git fetch origin && git pull --ff-only origin main"
ssh amx-dev@192.168.0.188 "cd /opt/pvdg-edge-local/app && ./deploy/scripts/deploy_linux_pc.sh"
```

## Services Running

Verified with:

```bash
docker compose --env-file .env -f deploy/docker-compose.local.yml ps
```

Running services:

- `nginx`
- `web`
- `api` healthy
- `postgres` healthy
- `redis` healthy
- `mosquitto`
- `acquisition-worker`
- `aggregation-worker`
- `rules-worker`

## Database Verification

Extensions:

- `timescaledb` installed
- `pgcrypto` installed

Migrations:

- `000001_initial_core_schema.up.sql`
- `000002_timescale_policies_indexes.up.sql`

Tables verified:

- `alarms`
- `audit_log`
- `device_register_maps`
- `devices`
- `permissions`
- `role_permissions`
- `roles`
- `schema_migrations`
- `sites`
- `system_events`
- `telemetry_5min`
- `telemetry_daily`
- `telemetry_hourly`
- `telemetry_latest`
- `telemetry_raw`
- `user_roles`
- `users`

Seed data:

- Demo Site: `DEMO`, `Demo Site`, `Asia/Karachi`
- Roles: `admin`, `ceo`, `engineer`, `manager`, `operator`

## API and Web Verification

API localhost:

```bash
curl -sS http://localhost/api/v1/system/health | python3 -m json.tool
```

Result: success response with API, database, and Redis `ok`; MQTT `not_configured`; overall `degraded`.

API LAN:

```bash
curl -sS http://192.168.0.188/api/v1/system/health | python3 -m json.tool
```

Result: success response with API, database, and Redis `ok`; MQTT `not_configured`; overall `degraded`.

Web:

```bash
curl -I http://192.168.0.188
```

Result: `HTTP/1.1 200 OK`

Local development machine LAN check:

```bash
curl.exe http://192.168.0.188/api/v1/system/health
```

Result: success response.

## Failures and Fixes

Failure: `docker compose up` originally left API unhealthy because the API healthcheck used `wget`, which was not available in the Node Alpine API image.

Fix: changed healthcheck to use `node -e fetch(...)`.

Failure: worker services restarted because the bootstrap process exited immediately.

Fix: kept worker processes alive with a minimal interval until Phase 4/5 real loops are implemented.

Failure: Windows PowerShell `curl` alias failed with `Object reference not set to an instance of an object`.

Fix: used `curl.exe` for the local development machine LAN check.

## Cleanup Performed

Removed: no customer data and no unknown files.

Left untouched: existing user home files, unknown system services, unknown packages, and all non-PV-DG data.

Reason: cleanup scope only allowed clearly related PV-DG test artifacts; deployment used the intended `/opt/pvdg-edge-local/app` path and named Docker volumes.

## Remaining Limitations

- API health is `degraded` because MQTT health is `not_configured` in Phase 2.
- Mosquitto anonymous access remains Phase 2 local testing only.
- Auth/RBAC/API CRUD is not implemented until Phase 3.
