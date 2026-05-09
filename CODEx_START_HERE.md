# Codex Start Here

You are building a new project from scratch: **PV-DG Edge Local Platform**.

## Non-negotiable rules

1. Do not copy old repo code blindly.
2. Use these docs as source of truth.
3. Implement phase by phase.
4. Do not make false claims.
5. Do not say done unless code compiles, lint/typecheck pass, tests pass, and docs are updated.
6. No default production credentials.
7. No unsafe control writes without RBAC, validation, confirmation, and audit.
8. Do not invent device registers. Registers must come from driver files or manuals.
9. Update OpenAPI for every API endpoint.
10. Update `docs/29_known_limitations_template.md` if anything is incomplete.

## Implementation phases

1. Bootstrap monorepo
2. Database/migrations
3. API auth/RBAC/site/device/driver
4. MQTT + realtime
5. Modbus acquisition worker
6. Historical aggregation/KPIs
7. Frontend dashboards
8. Alarms/events/commands/audit
9. Deployment/backup/restore
10. Hardening/SAT/docs

## Required result

A Linux PC platform that can run locally without internet and serve:
- Operator live monitoring
- Engineer commissioning/diagnostics
- Manager reports/KPIs
- CEO executive summary
