#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/opt/pvdg-edge-local"
APP_PATH="$PROJECT_ROOT/app"

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose plugin is required but was not found after Docker installation" >&2
  exit 1
fi

mkdir -p "$APP_PATH" "$PROJECT_ROOT/backups" "$PROJECT_ROOT/logs" "$PROJECT_ROOT/data"
echo "installed prerequisites and created $PROJECT_ROOT"
