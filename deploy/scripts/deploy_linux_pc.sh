#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/opt/pvdg-edge-local"
APP_PATH="$PROJECT_ROOT/app"
REPO_URL="${REPO_URL:-https://github.com/raohassandev/PV-DG-Edge.git}"
BRANCH="${BRANCH:-main}"

mkdir -p "$PROJECT_ROOT"

if [ ! -d "$APP_PATH/.git" ]; then
  rm -rf "$APP_PATH"
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_PATH"
fi

cd "$APP_PATH"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

if [ ! -f .env ]; then
  cp .env.example .env
  POSTGRES_PASSWORD="$(openssl rand -hex 32)"
  sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$POSTGRES_PASSWORD|" .env
fi

docker compose -f deploy/docker-compose.local.yml up -d --build
docker compose -f deploy/docker-compose.local.yml exec -T api pnpm --filter @pvdg/db migrate
docker compose -f deploy/docker-compose.local.yml exec -T api pnpm --filter @pvdg/db seed
deploy/scripts/health_check.sh
