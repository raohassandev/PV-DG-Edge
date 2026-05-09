# Phase 2C Interactive On-Site Deployment

Deployment date/time: 2026-05-09, Asia/Karachi local development session.

## Summary

Phase 2C deployment was attempted but was blocked at interactive sudo during that session. No password was written to commands, files, docs, logs, scripts, or `.env`.

Phase 2D later completed actual Docker deployment after Docker was installed and Docker group membership became active for `amx-dev`.

## SSH and Sudo

SSH user used: `amx-dev`

Verified command:

```bash
ssh amx-dev@192.168.0.188 "hostname && whoami && pwd"
```

Result:

```text
site-gatway
amx-dev
/home/amx-dev
```

Interactive sudo command attempted:

```bash
ssh -tt amx-dev@192.168.0.188 "sudo -v"
```

Result:

```text
command timed out waiting for interactive password input
```

## Inventory

Inventory was refreshed in `docs/deployment/ON_SITE_PC_INVENTORY_192_168_0_188.md`.

Observed target state:

- Hostname: `site-gatway`
- OS: Ubuntu 22.04.5 LTS
- SSH user: `amx-dev`
- Docker: not installed
- `/opt/pvdg-edge-local`: not present
- Listening ports before deployment: SSH and local DNS only

## Docker Install Status

Docker was not installed because `sudo` could not be completed in this non-interactive tool environment.

## Project Path

Expected project path: `/opt/pvdg-edge-local/app`

Current Phase 2D status: path exists at `/opt/pvdg-edge-local/app`.

## Services Running

No PV-DG Edge Docker services are running on the target yet.

## Database Verification Summary

Not run. TimescaleDB container is not deployed yet.

Pending checks after successful sudo deployment:

```bash
docker compose -f deploy/docker-compose.local.yml exec postgres psql -U pvdg -d pvdg_edge -c "\dx"
docker compose -f deploy/docker-compose.local.yml exec postgres psql -U pvdg -d pvdg_edge -c "\dt"
docker compose -f deploy/docker-compose.local.yml exec postgres psql -U pvdg -d pvdg_edge -c "select * from schema_migrations order by applied_at;"
docker compose -f deploy/docker-compose.local.yml exec postgres psql -U pvdg -d pvdg_edge -c "select code, name, timezone from sites;"
docker compose -f deploy/docker-compose.local.yml exec postgres psql -U pvdg -d pvdg_edge -c "select name from roles order by name;"
```

## API and Web Verification

API health localhost result: not run.

API health LAN result: not run.

Web URL result: not run.

These are blocked until Docker is installed and the compose stack is started.

## Cleanup Performed

Removed: nothing.

Left untouched: all target files, user home directories, databases, services, packages, and `/opt`.

Reason: no clearly related stale PV-DG Edge artifacts were found, and sudo access was not available.

## Exact Commands Run

```bash
git status
git branch --show-current
git remote -v
git fetch origin
git pull --ff-only origin main
git log --oneline --decorate -5
git status --short
npx pnpm@9.15.4 lint
npx pnpm@9.15.4 typecheck
npx pnpm@9.15.4 test
npx pnpm@9.15.4 build
ssh amx-dev@192.168.0.188 "hostname && whoami && pwd"
ssh -tt amx-dev@192.168.0.188 "sudo -v"
```

## Failures and Fixes

Failure: `ssh -tt amx-dev@192.168.0.188 "sudo -v"` timed out waiting for interactive password entry.

Fix applied: stopped deployment and documented the blocker. The password was not placed in any command or file.

## Remaining Limitations

- Docker is not installed on the Linux PC.
- `/opt/pvdg-edge-local/app` is not created.
- `.env` has not been generated on the target.
- Compose stack is not started.
- Migrations and seed have not run on the target.
- Health checks and web verification are pending.

## Exact Unblock Step

Use a real interactive terminal and run:

```bash
ssh -tt amx-dev@192.168.0.188
sudo -v
```

When prompted, the operator must type the sudo password manually. Then continue with the runbook in `docs/deployment/ON_SITE_PC_DEPLOYMENT_RUNBOOK.md`.
