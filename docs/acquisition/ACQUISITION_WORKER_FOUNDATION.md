# Acquisition Worker Foundation

The acquisition worker loads enabled Modbus devices from PostgreSQL and publishes validated canonical telemetry to MQTT.

## Runtime

- `ACQUISITION_REFRESH_INTERVAL_MS` controls how often the worker refreshes polling jobs. Default: `10000`.
- Devices are read only when `devices.enabled = true`.
- Devices are polled no more often than `devices.polling_interval_ms`.
- Devices without enabled register maps do not publish telemetry.
- Read failures are captured as bad-quality metrics and do not crash the worker.

## No Control Path

Phase 5 implements read-only acquisition. It does not implement Modbus writes or any control commands.
