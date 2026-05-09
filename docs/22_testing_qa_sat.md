# Testing, QA, and SAT

## Test layers

| Layer | Tool |
|---|---|
| unit | Vitest/Jest |
| API | Fastify inject/Supertest |
| DB | test database |
| worker | simulated Modbus server |
| UI | Playwright |
| load | k6/autocannon |
| field | SAT checklist |

## Required tests

### API
- auth
- RBAC
- site CRUD
- device CRUD
- driver import/validation
- live telemetry
- history
- alarms
- commands

### Worker
- Modbus TCP read
- RTU config validation
- retry/reconnect
- register decoding
- scale/offset
- byte order
- stale/bad quality
- MQTT publish

### Aggregation
- raw write
- normalized write
- rollups
- counter reset handling
- stale data

### UI
- login
- role navigation
- operator dashboard
- engineer diagnostics
- alarm acknowledgement

## Simulators

Build:
- grid meter simulator
- solar inverter simulator
- generator simulator
- offline device simulator
- timeout/error simulator
