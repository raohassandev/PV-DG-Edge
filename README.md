# PV-DG Edge Local Platform — Documentation Package

This package is for a new repo that will be implemented from scratch for an on-site Linux PC.

The system will combine the best ideas from:
- AMX PV-DG: local device-driver, Modbus, edge monitoring concepts.
- PV Dashboard Oracle: MQTT ingestion, live dashboard, API, telemetry, alerts, user/admin concepts.

This new project must be local-first, offline-capable, production-ready, and useful for operators, engineers, managers, and CEOs.

## Final architecture decision

| Area | Decision |
|---|---|
| Runtime | Docker Compose on Linux PC |
| Backend API | Node.js + TypeScript + Fastify |
| Frontend | React + TypeScript + Vite |
| Realtime | Socket.IO + Redis latest-value cache |
| Device acquisition | Modbus TCP/RTU worker service |
| Message bus | Local Mosquitto MQTT |
| Database | PostgreSQL + TimescaleDB |
| Jobs/cache | Redis |
| Proxy | Nginx |
| Deployment | systemd wrapper + Docker Compose |
| Cloud | optional store-and-forward only |

## Use this package

1. Create a new repo.
2. Copy this package into the repo root.
3. Give `CODEx_START_HERE.md` to Codex first.
4. Then use `.codex/phase_01_bootstrap_prompt.md`.
5. After each phase, test, commit, and ask ChatGPT for the next prompt/review.
