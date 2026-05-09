#!/usr/bin/env bash
set -euo pipefail

APP_PATH="${APP_PATH:-/opt/pvdg-edge-local/app}"
cd "$APP_PATH"

source deploy/scripts/lib_compose.sh

compose_run ps
compose_run logs --tail=100
curl -fsS http://localhost/api/v1/system/health
echo
