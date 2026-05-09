#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/opt/pvdg-edge-local"
APP_PATH="$PROJECT_ROOT/app"

if ! command -v git >/dev/null 2>&1 || ! command -v curl >/dev/null 2>&1 || ! command -v openssl >/dev/null 2>&1; then
  apt-get update
  apt-get install -y ca-certificates curl git gnupg lsb-release openssl
fi

if ! command -v docker >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL "https://download.docker.com/linux/ubuntu/gpg" -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc

  . /etc/os-release
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    ${VERSION_CODENAME} stable" > /etc/apt/sources.list.d/docker.list

  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose plugin is required but was not found after Docker installation" >&2
  exit 1
fi

mkdir -p "$APP_PATH" "$PROJECT_ROOT/backups" "$PROJECT_ROOT/logs" "$PROJECT_ROOT/data"
echo "installed prerequisites and created $PROJECT_ROOT"
