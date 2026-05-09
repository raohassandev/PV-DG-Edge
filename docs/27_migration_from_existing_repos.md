# Migration / Reuse Plan from Existing Repositories

## Reuse from AMX PV-DG

Use concepts:
- local-first monitoring
- Modbus TCP/RTU
- driver wizard
- device management
- system monitoring
- resource-aware edge deployment

## Reuse from PV Dashboard Oracle

Use concepts:
- MQTT ingestion
- canonical mapping
- Socket.IO site rooms
- dashboard API
- admin/user separation
- telemetry/history/alert concepts

## Do not copy blindly

- default credentials
- unverified registers
- old VPS deployment scripts
- cloud-only assumptions
- MongoDB-only model
- SQLite-only limitation
- UI that does not match operator/manager/executive needs

## New source of truth

This docs package is the source of truth for the new repo.
