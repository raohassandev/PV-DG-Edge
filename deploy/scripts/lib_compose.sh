#!/usr/bin/env bash

compose_app_dir() {
  local script_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  cd "$script_dir/../.."
  pwd
}

compose_bin() {
  if docker ps >/dev/null 2>&1; then
    printf '%s\n' "docker compose"
    return 0
  fi

  if command -v sudo >/dev/null 2>&1 && sudo -n docker ps >/dev/null 2>&1; then
    printf '%s\n' "sudo docker compose"
    return 0
  fi

  echo "Docker is not available for this user and sudo docker is not available without an interactive password." >&2
  return 1
}

compose_run() {
  local app_dir compose
  app_dir="$(compose_app_dir)"
  cd "$app_dir"

  if [ ! -f "$app_dir/.env" ]; then
    echo "Missing $app_dir/.env. Create it on the target machine before running compose commands." >&2
    return 1
  fi

  compose="$(compose_bin)"
  # shellcheck disable=SC2086
  $compose --env-file "$app_dir/.env" -f "$app_dir/deploy/docker-compose.local.yml" "$@"
}
