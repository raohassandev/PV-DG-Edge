# MQTT Topic Contract

## Broker

Local broker:

```text
mqtt://mosquitto:1883
```

## Topics

```text
pvdg/{siteSlug}/{deviceSlug}/telemetry
pvdg/{siteSlug}/{deviceSlug}/status
pvdg/{siteSlug}/{deviceSlug}/command/request
pvdg/{siteSlug}/{deviceSlug}/command/result
pvdg/{siteSlug}/alarm
pvdg/system/health
```

## Telemetry payload

```json
{
  "schemaVersion": "1.0",
  "ts": "2026-05-09T10:00:00.000Z",
  "siteId": "uuid",
  "siteSlug": "site-001",
  "deviceId": "uuid",
  "deviceSlug": "grid-meter-01",
  "deviceType": "grid_meter",
  "source": "modbus_tcp",
  "quality": 192,
  "metrics": {
    "ac.power.total_kw": { "value": 120.5, "unit": "kW", "quality": 192 }
  },
  "rawRef": {
    "pollId": "uuid",
    "driverId": "driver-id"
  }
}
```

## Command request

```json
{
  "commandId": "uuid",
  "ts": "2026-05-09T10:00:00Z",
  "siteId": "uuid",
  "deviceId": "uuid",
  "point": "command.generator.start",
  "value": 1,
  "requestedBy": "user uuid",
  "requiresReadback": true
}
```

## Command result

```json
{
  "commandId": "uuid",
  "ts": "2026-05-09T10:00:02Z",
  "status": "success",
  "message": "Write completed and readback verified"
}
```

## Rules

- Validate every MQTT payload.
- Reject telemetry without site/device identity.
- MQTT should be internal-only by default.
- External MQTT requires username/password and explicit config.
