# Deployment Plan for On-Site Linux PC

## Target

Ubuntu/Debian-based Linux PC with Docker Compose.

Recommended hardware:
- 4-core CPU
- 8 GB RAM
- 256 GB SSD
- dual Ethernet preferred
- UPS power

## Services

- nginx
- api
- web
- acquisition-worker
- aggregation-worker
- rules-worker
- postgres-timescale
- redis
- mosquitto

## Ports

| Port | Service | Exposure |
|---:|---|---|
| 80 | Nginx HTTP | LAN |
| 443 | Nginx HTTPS | LAN optional |
| 1883 | MQTT | internal by default |
| 5432 | Postgres | internal |
| 6379 | Redis | internal |

## Install flow

1. install Docker
2. clone repo
3. copy `.env.example` to `.env`
4. run `deploy/install.sh`
5. run `docker compose up -d`
6. open UI
7. complete first-run setup
8. add site/devices
9. test devices
10. configure backup

## Systemd wrapper

```ini
[Unit]
Description=PV-DG Edge Local Platform
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
WorkingDirectory=/opt/pvdg-edge-local
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

## Volumes

- Postgres data
- Redis data
- Mosquitto data/log
- driver files
- backups
- logs

## Update process

1. create backup
2. pull/update code
3. run migrations
4. restart services
5. verify health
6. rollback if failed
