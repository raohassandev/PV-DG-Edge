# Phase 2 Database and Deployment Report

## Implemented

- Production-oriented PostgreSQL and TimescaleDB schema migrations.
- Plain SQL migration runner with status, migrate, rollback, and seed commands.
- Minimal local seed for Demo Site, roles, permissions, and admin role permissions.
- API health endpoint with DB and Redis health checks.
- Local Docker Compose stack for Nginx, web, API, workers, TimescaleDB, Redis, and Mosquitto.
- Linux PC deployment, inventory, backup, restore, and health-check scripts.
- Phase 2B deployment hardening: `deploy_linux_pc.sh` can clone/pull the GitHub repo into `/opt/pvdg-edge-local/app`, and backup/restore scripts source target `.env` for database names without committing or printing secrets.

## Verified

Local verification completed from repo root:

- `npx pnpm@9.15.4 lint`: passed
- `npx pnpm@9.15.4 typecheck`: passed
- `npx pnpm@9.15.4 test`: passed, 3 test files and 6 tests
- `npx pnpm@9.15.4 build`: passed

## Pending Target Verification

Target deployment to `192.168.0.188` was attempted with key-based SSH.

Results:

- `ssh -o StrictHostKeyChecking=accept-new -o BatchMode=yes root@192.168.0.188 "hostname"` failed: `root@192.168.0.188: Permission denied (publickey,password).`
- `ssh -o StrictHostKeyChecking=accept-new -o BatchMode=yes amx-dev@192.168.0.188 "hostname"` succeeded and returned `site-gatway`.
- `ssh -o BatchMode=yes amx-dev@192.168.0.188 "sudo -n true && echo sudo-ok || echo sudo-needs-password"` returned `sudo-needs-password` and `sudo: a password is required`.
- `ssh -o BatchMode=yes amx-dev@192.168.0.188 "command -v docker || true; docker compose version 2>&1 || true; ls -ld /opt /opt/pvdg-edge-local 2>&1 || true"` returned `docker: command not found`, `/opt/pvdg-edge-local` missing, and `/opt` owned by root.
- `git push origin main` returned `Everything up-to-date` before Phase 2B hardening. The Phase 2B hardening commit must be pushed after local gates pass.
- Phase 2C attempted `ssh -tt amx-dev@192.168.0.188 "sudo -v"` and it timed out waiting for interactive password entry. No password was written to commands, files, logs, or docs.

Because the brief forbids writing the password into commands, files, logs, screenshots, or config, target install/deploy could not proceed non-interactively from this session.

Required target checks:

```bash
docker compose -f deploy/docker-compose.local.yml ps
docker compose -f deploy/docker-compose.local.yml logs --tail=100
curl http://localhost/api/v1/system/health
curl http://192.168.0.188/api/v1/system/health
```

## Local Workstation Limitation

`docker compose -f deploy/docker-compose.local.yml config` could not run on the Windows workstation because Docker is not installed or not on PATH:

```text
docker : The term 'docker' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

## Pending Work

- Phase 3 API auth/RBAC/site/device/driver endpoints.
- Phase 4 MQTT security and telemetry subscription.
- Integration database verification on a running TimescaleDB container.
- On-site deployment requires a real interactive terminal session for sudo, or an operator to run the documented sudo commands on the Linux PC.
