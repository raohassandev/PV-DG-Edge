#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "usage: $0 /path/to/backup.dump" >&2
  exit 1
fi

BACKUP_FILE="$1"
APP_PATH="/opt/pvdg-edge-local/app"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

cd "$APP_PATH"
cat "$BACKUP_FILE" | docker compose -f deploy/docker-compose.local.yml exec -T postgres pg_restore -U "${POSTGRES_USER:-pvdg}" -d "${POSTGRES_DB:-pvdg_edge}" --clean --if-exists
