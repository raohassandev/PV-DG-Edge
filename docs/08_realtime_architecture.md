# Realtime Architecture

## Goal

Live screens should update quickly without constantly querying historical DB.

## Flow

```mermaid
sequenceDiagram
    participant Device
    participant Worker as Acquisition Worker
    participant MQTT as Mosquitto
    participant API
    participant Redis
    participant UI as Browser

    Device->>Worker: Modbus response
    Worker->>Worker: decode + quality
    Worker->>MQTT: canonical telemetry
    MQTT->>API: telemetry message
    API->>Redis: update latest snapshot
    API->>UI: Socket.IO site:telemetry
    UI->>API: fetch snapshot when needed
    API->>Redis: read latest
    Redis-->>API: latest
    API-->>UI: data
```

## Socket.IO rooms

| Room | Use |
|---|---|
| site:{siteId} | live site updates |
| device:{deviceId} | engineering diagnostics |
| alarms:{siteId} | alarm changes |
| system | service health |

## Events

| Event | Direction |
|---|---|
| site:join | client to server |
| site:leave | client to server |
| site:telemetry | server to client |
| device:status | server to client |
| alarm:changed | server to client |
| system:health | server to client |

## Redis keys

```text
live:site:{siteId}
live:device:{deviceId}
health:device:{deviceId}
alarms:active:{siteId}
service:health:{serviceName}
```

## Payload rule

Send compact Socket.IO hints, not huge full payloads.

Example:

```json
{
  "siteId": "uuid",
  "deviceId": "uuid",
  "ts": "2026-05-09T10:00:00Z",
  "changed": ["ac.power.total_kw"],
  "quality": 192
}
```
