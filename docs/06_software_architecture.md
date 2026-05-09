# Software Architecture

## Suggested repo structure

```text
apps/
  api/
  acquisition-worker/
  aggregation-worker/
  rules-worker/
  web/

packages/
  shared/
  config/
  logger/
  auth/
  db/
  telemetry/
  drivers/
  ui/

database/
  migrations/
  seeds/

deploy/
  nginx/
  systemd/
  install.sh
```

## API service

Responsibilities:
- REST API
- authentication
- RBAC
- user/site/device/driver CRUD
- telemetry live/history endpoints
- command endpoints
- audit
- Socket.IO

Recommended:
- Fastify
- Zod or TypeBox validation
- Pino logging
- typed database access
- OpenAPI generation

## Acquisition worker

Responsibilities:
- load site/device/driver config
- manage Modbus TCP/RTU connections
- poll by priority group
- decode registers
- apply quality codes
- publish canonical MQTT telemetry
- execute approved commands

## Aggregation worker

Responsibilities:
- subscribe MQTT telemetry
- store raw payload
- store normalized measurements
- create rollups
- compute KPIs

## Rules worker

Responsibilities:
- threshold alarms
- communication alarms
- alarm lifecycle
- event generation
- notification hooks later

## Web app

Responsibilities:
- login
- role navigation
- operator dashboard
- engineer dashboard
- manager dashboard
- executive dashboard
- alarms
- device/driver configuration
- reports

## Coding standards

- TypeScript strict mode
- shared schemas for API and telemetry
- structured logging
- explicit error codes
- tests for every core service
- no secrets in code
