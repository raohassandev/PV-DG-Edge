# Implementation Roadmap

## Phase 01 Bootstrap
Monorepo, TypeScript, lint/test, Docker skeleton, health endpoints.

## Phase 02 Database
PostgreSQL/TimescaleDB, migrations, seed roles/permissions, DB health.

## Phase 03 API
Fastify, auth, RBAC, site/device/driver CRUD, audit.

## Phase 04 MQTT/realtime
Mosquitto client, Redis live cache, Socket.IO, live endpoints.

## Phase 05 Acquisition
Driver loader, Modbus TCP/RTU, decoder, polling, telemetry publish.

## Phase 06 History/KPI
Raw telemetry, normalized measurements, rollups, energy calculations.

## Phase 07 Frontend
Login, role dashboards, device config, driver config, alarms, reports.

## Phase 08 Alarms/commands
Rules engine, alarm lifecycle, safe commands, audit.

## Phase 09 Deployment
Nginx, Compose, systemd, install, backup/restore, support bundle.

## Phase 10 Hardening/SAT
Load tests, security checks, reboot tests, SAT, release docs.
