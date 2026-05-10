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
  JWT_SECRET_VALUE="$(openssl rand -base64 32 | tr -d '\n')"
  SESSION_SECRET_VALUE="$(openssl rand -base64 32 | tr -d '\n')"
  POSTGRES_PASSWORD_KEY="POSTGRES_PASSWORD"
  JWT_SECRET_KEY="JWT_SECRET"
  SESSION_SECRET_KEY="SESSION_SECRET"
  tmp_env="$(mktemp)"
  while IFS= read -r line; do
    case "$line" in
      NODE_ENV=*) printf '%s\n' "NODE_ENV=production" ;;
      "${POSTGRES_PASSWORD_KEY}="*) printf '%s=%s\n' "$POSTGRES_PASSWORD_KEY" "$DB_PASSWORD_VALUE" ;;
      "${JWT_SECRET_KEY}="*) printf '%s=%s\n' "$JWT_SECRET_KEY" "$JWT_SECRET_VALUE" ;;
      "${SESSION_SECRET_KEY}="*) printf '%s=%s\n' "$SESSION_SECRET_KEY" "$SESSION_SECRET_VALUE" ;;
      *) printf '%s\n' "$line" ;;
    esac
  done < .env.example > "$tmp_env"
  mv "$tmp_env" .env
  chmod 600 .env
fi

required_envs=(
  POSTGRES_PASSWORD
  POSTGRES_DB
  POSTGRES_USER
  POSTGRES_HOST
  REDIS_URL
  MQTT_URL
  JWT_SECRET
  SESSION_SECRET
)

for key in "${required_envs[@]}"; do
  if ! grep -Eq "^${key}=.+" .env; then
    echo "Required environment value $key is missing or empty in .env" >&2
    exit 1
  fi
done

source deploy/scripts/lib_compose.sh
compose_run build
compose_run up -d
compose_run up -d --force-recreate nginx
compose_run exec -T api pnpm --filter @pvdg/db migrate
compose_run exec -T api pnpm --filter @pvdg/db seed
deploy/scripts/health_check.sh
