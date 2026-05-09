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
docker compose -f deploy/docker-compose.local.yml exec -T postgres pg_dump -U "${POSTGRES_USER:-pvdg}" -d "${POSTGRES_DB:-pvdg_edge}" -Fc > "$BACKUP_FILE"
echo "database backup written to $BACKUP_FILE"
