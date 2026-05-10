# Phase 3 API Auth RBAC CRUD

Date/time: 2026-05-10 Asia/Karachi.

## Implemented

- First-run admin setup endpoint: `POST /api/v1/auth/setup-admin`
- Login, refresh, logout, and current user endpoints.
- Stateless signed access and refresh tokens using Node crypto.
- Password hashing using PBKDF2-SHA256 with per-password random salt.
- RBAC permission checks for system, site, device, driver, and admin operations.
- Site CRUD endpoints.
- Device CRUD endpoints.
- Driver metadata import/list/get/export/validate endpoints.
- Audit writes for setup, site create/update, and device create.
- Phase 3 DB migration adding `drivers`.
- OpenAPI updated to match real implemented endpoints.

## Verification

Local commands:

```bash
npx pnpm@9.15.4 lint
npx pnpm@9.15.4 typecheck
npx pnpm@9.15.4 test
npx pnpm@9.15.4 build
```

Unit tests cover:

- Health response shape.
- First-run admin setup.
- Login and `GET /auth/me`.
- Auth protection on site routes.
- Site create/list for authenticated admin.

## Deployment

Deployed to `site-gatway` at `/opt/pvdg-edge-local/app`.

```bash
cd /opt/pvdg-edge-local/app
git pull --ff-only origin main
./deploy/scripts/deploy_linux_pc.sh
```

Initial Phase 3 deployment exposed a stale Nginx upstream cache after the API container was recreated. Fix committed:

- `deploy/scripts/deploy_linux_pc.sh` now force-recreates `nginx` after service updates.
- `deploy/scripts/health_check.sh` retries health checks briefly.

Verified after redeploy:

```bash
docker compose --env-file .env -f deploy/docker-compose.local.yml exec api pnpm --filter @pvdg/db status
curl -sS http://192.168.0.188/api/v1/system/health
curl -sS -i http://localhost/api/v1/sites
```

Results:

- `000003_phase3_api_foundation.up.sql` applied.
- API health works from localhost and LAN.
- Protected routes return `401 AUTH_REQUIRED` without a bearer token.
- Overall health remains `degraded` because MQTT health is intentionally `not_configured` until Phase 4.

## Known Limitations

- Logout does not revoke stateless refresh tokens server-side.
- Device connection tests and register reads are placeholders until acquisition/driver phases.
- Driver validation only validates stored metadata shape; it does not verify device register semantics.
- User management endpoints beyond first-run setup are not implemented yet.

## Next Step

Deploy Phase 3 to the Linux PC, apply migration `000003_phase3_api_foundation.up.sql`, and smoke-test setup/login/CRUD against the running stack.
