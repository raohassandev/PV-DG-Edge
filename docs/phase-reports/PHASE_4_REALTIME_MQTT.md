# Phase 4 Realtime MQTT

Date/time: 2026-05-10 Asia/Karachi.

## Implemented

- Canonical telemetry validation in `@pvdg/telemetry`.
- API-side MQTT client subscribing to `pvdg/+/+/telemetry`.
- Redis live telemetry cache for `live:site:{siteId}`, `live:device:{deviceId}`, and `health:device:{deviceId}`.
- Socket.IO server mounted at `/socket.io`.
- Socket.IO room handlers for `site:join`, `site:leave`, `device:join`, and `device:leave`.
- Compact realtime hints emitted as `site:telemetry` and `device:status`.
- Protected live telemetry HTTP endpoints:
  - `GET /api/v1/telemetry/live/site/{siteId}`
  - `GET /api/v1/telemetry/live/device/{deviceId}`
- Simulated MQTT processing tests without requiring a live broker.
- OpenAPI documentation for the live telemetry endpoints.

## Local verification

Commands run:

```bash
npx pnpm@9.15.4 install
npx pnpm@9.15.4 typecheck
npx pnpm@9.15.4 test
npx pnpm@9.15.4 lint
npx pnpm@9.15.4 build
```

Results before commit:

- `test` passed with telemetry validation and simulated MQTT coverage.
- `typecheck`, `lint`, and `build` passed after fixing strict optional access and an unused test variable.

## Deployment notes

The API now starts realtime services during production boot:

- Redis must be reachable through `REDIS_URL`.
- Mosquitto must be reachable through `MQTT_URL`.
- The Docker Compose stack already includes Redis and Mosquitto.

Target deployment should use:

```bash
cd /opt/pvdg-edge-local/app
git pull --ff-only origin main
./deploy/scripts/deploy_linux_pc.sh
curl -sS http://localhost/api/v1/system/health
curl -sS http://192.168.0.188/api/v1/system/health
```

No secrets are required in this report.

## Known limitations

- Mosquitto still allows anonymous access for local Phase 4 testing.
- Socket.IO room joins do not yet enforce token-based authorization.
- The acquisition worker does not yet publish real device telemetry; Phase 4 tests simulate canonical MQTT payloads.
- Historical telemetry persistence from MQTT to PostgreSQL is not implemented in this phase.

## Next step

Phase 5 should connect acquisition workers and validated driver reads to the realtime telemetry path, then add MQTT authentication and ACLs before broader site rollout.
