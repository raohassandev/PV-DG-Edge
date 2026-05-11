# Historical Telemetry Persistence

Phase 5A persists validated canonical MQTT telemetry after the Redis live cache accepts it.

## Flow

1. API subscribes to `pvdg/+/+/telemetry`.
2. Incoming JSON is validated with `@pvdg/telemetry`.
3. Valid payloads update Redis live keys.
4. The API inserts the full payload into `telemetry_raw`.
5. Each metric is upserted into `telemetry_latest`.
6. Socket.IO emits compact hints for subscribed rooms.

Invalid payloads do not update Redis, PostgreSQL, or Socket.IO. PostgreSQL persistence failures are logged without secrets and do not crash MQTT processing.

## Quality Mapping

| Numeric quality | Stored text |
|---|---|
| `192..255` | `ok` |
| `64..191` | `degraded` |
| `0..63` | `bad` |

## Tables

- `telemetry_raw` stores the source MQTT topic, full canonical payload JSON, and source timestamp.
- `telemetry_latest` stores the latest numeric value per device and parameter.
