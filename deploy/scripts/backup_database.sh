#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/opt/pvdg-edge-local"
APP_PATH="$PROJECT_ROOT/app"
BACKUP_DIR="$PROJECT_ROOT/backups"
mkdir -p "$BACKUP_DIR"

cd "$APP_PATH"
set -a
source .env
set +a

BACKUP_FILE="$BACKUP_DIR/pvdg_edge_$(date +%Y%m%d_%H%M%S).dump"
source deploy/scripts/lib_compose.sh
compose_run exec -T postgres pg_dump -U "${POSTGRES_USER:-pvdg}" -d "${POSTGRES_DB:-pvdg_edge}" -Fc > "$BACKUP_FILE"
echo "database backup written to $BACKUP_FILE"
