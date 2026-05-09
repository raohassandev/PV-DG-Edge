#!/usr/bin/env bash
set -euo pipefail

OUTPUT="${1:-docs/deployment/ON_SITE_PC_INVENTORY_192_168_0_188.md}"
mkdir -p "$(dirname "$OUTPUT")"

{
  echo "# On-Site PC Inventory 192.168.0.188"
  echo
  echo "Generated at: $(date -Is)"
  echo
  echo "## OS and Host"
  hostnamectl 2>/dev/null || true
  uname -a
  echo
  echo "## Disk"
  df -h
  echo
  echo "## Memory"
  free -h
  echo
  echo "## Users"
  cut -d: -f1,3,6 /etc/passwd
  echo
  echo "## Listening Ports"
  ss -tulpn 2>/dev/null || netstat -tulpn 2>/dev/null || true
  echo
  echo "## Services"
  systemctl --type=service --state=running --no-pager 2>/dev/null || true
  echo
  echo "## Docker Containers"
  docker ps -a 2>/dev/null || true
  echo
  echo "## Docker Images"
  docker images 2>/dev/null || true
  echo
  echo "## Docker Volumes"
  docker volume ls 2>/dev/null || true
  echo
  echo "## Project Paths"
  ls -la /opt 2>/dev/null || true
  ls -la /opt/pvdg-edge-local 2>/dev/null || true
  ls -la /opt/pvdg-edge-local/app 2>/dev/null || true
} > "$OUTPUT"

echo "inventory written to $OUTPUT"
