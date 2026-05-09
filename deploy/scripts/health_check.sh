#!/usr/bin/env bash
set -euo pipefail

APP_PATH="${APP_PATH:-/opt/pvdg-edge-local/app}"
cd "$APP_PATH"

docker compose -f deploy/docker-compose.local.yml ps
docker compose -f deploy/docker-compose.local.yml logs --tail=100
curl -fsS http://localhost/api/v1/system/health
echo
