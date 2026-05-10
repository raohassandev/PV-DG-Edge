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

## Site PC deployment verification

Target: `site-gatway` at `192.168.0.188`.

Commands run from the development machine:

```bash
ssh amx-dev@192.168.0.188 "hostname && whoami && cd /opt/pvdg-edge-local/app && git pull --ff-only origin main && ./deploy/scripts/deploy_linux_pc.sh"
ssh amx-dev@192.168.0.188 "cd /opt/pvdg-edge-local/app && docker compose --env-file .env -f deploy/docker-compose.local.yml ps"
curl http://192.168.0.188/api/v1/system/health
```

Results:

- Docker Compose services were running: nginx, web, api, postgres, redis, mosquitto, acquisition worker, aggregation worker, and rules worker.
- API health returned `status: ok`.
- Database health returned `ok`.
- Redis health returned `ok`.
- MQTT health returned `ok`.
- Web responded on `http://192.168.0.188` with HTTP 200.
- Protected live telemetry endpoint returned `401 AUTH_REQUIRED` without a bearer token, as expected.

Simulated MQTT verification:

```bash
docker compose --env-file .env -f deploy/docker-compose.local.yml exec -T mosquitto mosquitto_pub -h localhost -t pvdg/demo/grid-meter-01/telemetry -l
docker compose --env-file .env -f deploy/docker-compose.local.yml exec -T redis redis-cli EXISTS live:site:11111111-1111-4111-8111-111111111111 live:device:22222222-2222-4222-8222-222222222222 health:device:22222222-2222-4222-8222-222222222222
```

Result: Redis returned `3`, confirming the valid MQTT telemetry message was accepted and cached for site, device, and device health keys.

## Known limitations

- Mosquitto still allows anonymous access for local Phase 4 testing.
- Socket.IO room joins do not yet enforce token-based authorization.
- The acquisition worker does not yet publish real device telemetry; Phase 4 tests simulate canonical MQTT payloads.
- Historical telemetry persistence from MQTT to PostgreSQL is not implemented in this phase.

## Next step

Phase 5 should connect acquisition workers and validated driver reads to the realtime telemetry path, then add MQTT authentication and ACLs before broader site rollout.
