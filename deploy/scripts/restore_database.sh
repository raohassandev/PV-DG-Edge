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
set -a
source .env
set +a

source deploy/scripts/lib_compose.sh
cat "$BACKUP_FILE" | compose_run exec -T postgres pg_restore -U "${POSTGRES_USER:-pvdg}" -d "${POSTGRES_DB:-pvdg_edge}" --clean --if-exists
