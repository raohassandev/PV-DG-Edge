# Architecture Decision Record

## ADR-001 — New clean project

Build from scratch. Use old repos only as reference. Do not merge old code blindly.

## ADR-002 — PostgreSQL + TimescaleDB

Use PostgreSQL for configuration, RBAC, alarms, audit, and reports. Use TimescaleDB for telemetry history, compression, retention, and rollups.

Rejected:
- SQLite only: not enough for long-term multi-service history/reporting.
- MongoDB only: less ideal for SQL reports and time-series rollups.
- InfluxDB only: still needs relational DB for users/config/audit.

## ADR-003 — Local MQTT broker

Use Mosquitto locally. Acquisition workers publish canonical telemetry. API, aggregation, and alarms consume from MQTT.

## ADR-004 — Redis live cache

Use Redis for latest site/device snapshots, service health, Socket.IO support, and job state.

## ADR-005 — Fastify API

Use Fastify + TypeScript for a typed, fast, schema-friendly backend.

## ADR-006 — Socket.IO realtime

Use Socket.IO for browser realtime. Rooms:
- `site:{siteId}`
- `device:{deviceId}`
- `alarms:{siteId}`
- `system`

## ADR-007 — Docker Compose deployment

Use Docker Compose with systemd wrapper for simple industrial deployment and support.

## ADR-008 — Monorepo

Use a TypeScript monorepo:
- `apps/api`
- `apps/acquisition-worker`
- `apps/aggregation-worker`
- `apps/rules-worker`
- `apps/web`
- `packages/*`
