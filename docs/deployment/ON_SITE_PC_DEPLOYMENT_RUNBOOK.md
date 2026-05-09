# On-Site PC Deployment Runbook

Target path: `/opt/pvdg-edge-local/app`

Verified SSH user in this session: `amx-dev`.

Current blocker: `amx-dev` can SSH, but this automation environment cannot accept typed input at the interactive `sudo -v` prompt. Docker is not installed and `/opt` is root-owned, so deployment needs an operator to run the sudo-protected commands in a real terminal session.

Verified Phase 2C SSH command:

```bash
ssh amx-dev@192.168.0.188 "hostname && whoami && pwd"
```

Result:

```text
site-gatway
amx-dev
/home/amx-dev
```

Interactive sudo attempt:

```bash
ssh -tt amx-dev@192.168.0.188 "sudo -v"
```

Result: command timed out waiting for password entry in this non-interactive tool environment.

## Local Repo Commands

```bash
npx pnpm@9.15.4 install
npx pnpm@9.15.4 lint
npx pnpm@9.15.4 typecheck
npx pnpm@9.15.4 test
npx pnpm@9.15.4 build
```

## Target Commands

Run inventory before cleanup:

```bash
bash deploy/scripts/inventory_linux_pc.sh
```

Install prerequisites and directories:

```bash
sudo bash deploy/scripts/install_linux_pc.sh
```

Deploy:

```bash
sudo bash deploy/scripts/deploy_linux_pc.sh
```

Verify:

```bash
docker compose -f deploy/docker-compose.local.yml ps
docker compose -f deploy/docker-compose.local.yml logs --tail=100
curl http://localhost/api/v1/system/health
curl http://192.168.0.188/api/v1/system/health
```

The web UI should be available at `http://192.168.0.188`.

## Secrets

Do not commit `.env`. The deployment script creates `.env` from `.env.example` and generates a local database password if `.env` is absent.
