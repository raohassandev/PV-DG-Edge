# Phase 5B Modbus Acquisition

## Status

Implemented locally in this repository.

## Completed

- Added read-only Modbus TCP and RTU polling foundation using `modbus-serial`.
- Loaded enabled devices and register maps from PostgreSQL.
- Supported function codes `3` and `4`.
- Supported `uint16`, `int16`, `uint32`, `int32`, and `float32`.
- Added byte and word order normalization for `ABCD`, `BADC`, `CDAB`, and `DCBA`.
- Published canonical MQTT telemetry only after validation.
- Added unit tests for decoding, payload creation, failed reads, no-map devices, and publish validation.

## Verification

Local gates passed:

- `npx.cmd pnpm@9.15.4 lint`
- `npx.cmd pnpm@9.15.4 typecheck`
- `npx.cmd pnpm@9.15.4 test`
- `npx.cmd pnpm@9.15.4 build`

## Limitations

- No Modbus simulator is committed in Phase 5B.
- The worker currently reads each register map independently. Contiguous read grouping is documented as a later performance improvement.
- Real device acquisition must be verified against configured on-site devices or a documented simulator before claiming production telemetry.
