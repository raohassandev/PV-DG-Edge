# Phase 5A Telemetry Persistence and Acquisition Foundation

## Status

Implemented locally in this repository.

## Completed

- Added `persistCanonicalTelemetry` in `@pvdg/db`.
- Persisted accepted canonical MQTT payloads into `telemetry_raw`.
- Upserted metric values into `telemetry_latest`.
- Kept Redis live cache and Socket.IO hint behavior active.
- Added `ACQUISITION_REFRESH_INTERVAL_MS`.
- Added acquisition-worker database/MQTT foundation without fake telemetry.
- Added unit coverage for valid persistence calls and invalid payload rejection.

## Verification

Local gates passed:

- `npx.cmd pnpm@9.15.4 lint`
- `npx.cmd pnpm@9.15.4 typecheck`
- `npx.cmd pnpm@9.15.4 test`
- `npx.cmd pnpm@9.15.4 build`
