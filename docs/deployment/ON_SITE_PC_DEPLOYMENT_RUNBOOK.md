# On-Site PC Deployment Runbook

Target path: `/opt/pvdg-edge-local/app`

Verified SSH user in this session: `amx-dev`.

Current status: Phase 2D Docker deployment is running on `site-gatway`.

Verified:

- Docker group access works for `amx-dev`.
- Project path is `/opt/pvdg-edge-local/app`.
- Compose stack is started with `deploy/docker-compose.local.yml`.
- API health works from both `localhost` and `192.168.0.188`.
- Web responds on port 80.

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

Historical note: Phase 2C was blocked by interactive sudo. The operator later completed Docker installation and Docker group setup.

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

After Docker group membership is active, deployment can run without sudo:

```bash
cd /opt/pvdg-edge-local/app
./deploy/scripts/deploy_linux_pc.sh
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
