#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/opt/pvdg-edge-local"
APP_PATH="$PROJECT_ROOT/app"
REPO_URL="${REPO_URL:-https://github.com/raohassandev/PV-DG-Edge.git}"
BRANCH="${BRANCH:-main}"

mkdir -p "$PROJECT_ROOT"

if [ ! -d "$APP_PATH/.git" ]; then
  if [ -e "$APP_PATH" ] && [ -n "$(find "$APP_PATH" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null)" ]; then
    echo "$APP_PATH exists and is not a git repository or empty directory; leaving it untouched" >&2
    exit 1
  fi
  rm -d "$APP_PATH" 2>/dev/null || true
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_PATH"
fi

cd "$APP_PATH"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

if [ ! -f .env ]; then
  DB_PASSWORD_VALUE="$(openssl rand -base64 32 | tr -d '\n')"
  POSTGRES_PASSWORD_KEY="POSTGRES_PASSWORD"
  tmp_env="$(mktemp)"
  while IFS= read -r line; do
    case "$line" in
      NODE_ENV=*) printf '%s\n' "NODE_ENV=production" ;;
      "${POSTGRES_PASSWORD_KEY}="*) printf '%s=%s\n' "$POSTGRES_PASSWORD_KEY" "$DB_PASSWORD_VALUE" ;;
      *) printf '%s\n' "$line" ;;
    esac
  done < .env.example > "$tmp_env"
  mv "$tmp_env" .env
  chmod 600 .env
fi

docker compose -f deploy/docker-compose.local.yml up -d --build
docker compose -f deploy/docker-compose.local.yml exec -T api pnpm --filter @pvdg/db migrate
docker compose -f deploy/docker-compose.local.yml exec -T api pnpm --filter @pvdg/db seed
deploy/scripts/health_check.sh
