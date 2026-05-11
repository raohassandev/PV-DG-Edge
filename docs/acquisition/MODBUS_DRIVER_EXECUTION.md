# Modbus Driver Execution

The acquisition worker uses configured database records rather than hardcoded devices.

## Inputs

- `devices`
- `device_register_maps`

Only enabled devices using `modbus_tcp` or `modbus_rtu` are considered. Only readable maps with function code `3` or `4` and a numeric address are polled.

## Output

The worker publishes validated canonical telemetry to:

```text
pvdg/{siteId}/{deviceId}/telemetry
```

Payload source is `acquisition-worker`. Per-metric quality is `192` for successful reads and `0` for failed reads. Payload quality is `192`, `64`, or `0` based on the metric set.

## Failure Handling

Device connection and read errors are logged safely and do not stop other devices from being polled.
