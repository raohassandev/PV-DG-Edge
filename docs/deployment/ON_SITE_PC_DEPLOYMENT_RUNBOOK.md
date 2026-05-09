# On-Site PC Deployment Runbook

Target path: `/opt/pvdg-edge-local/app`

Verified SSH user in this session: `amx-dev`.

Current blocker: `amx-dev` can SSH by key, but `sudo -n true` reports that a sudo password is required. Docker is not installed and `/opt` is root-owned, so deployment needs an interactive administrator step or a temporary safe sudo setup.

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
