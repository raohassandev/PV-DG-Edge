#!/usr/bin/env bash
set -euo pipefail

APP_PATH="${APP_PATH:-/opt/pvdg-edge-local/app}"
cd "$APP_PATH"

source deploy/scripts/lib_compose.sh

compose_run ps
compose_run logs --tail=100

for attempt in 1 2 3 4 5; do
  if curl -fsS http://localhost/api/v1/system/health; then
    echo
    exit 0
  fi
  echo "health check attempt $attempt failed; retrying" >&2
  sleep 3
done

curl -fsS http://localhost/api/v1/system/health
echo
