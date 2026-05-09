# System Architecture

## Architecture diagram

```mermaid
flowchart LR
    subgraph Field["Field Devices"]
      Grid["Grid Meter"]
      Load["Load Meter"]
      Solar["Solar Inverter/Meter"]
      DG["Generator Controller/Meter"]
      PLC["PLC / HMI"]
    end

    subgraph Edge["On-Site Linux PC"]
      Acq["Acquisition Worker\nModbus TCP/RTU"]
      MQTT["Mosquitto MQTT"]
      API["API Service\nFastify + Socket.IO"]
      Agg["Aggregation Worker"]
      Rules["Rules/Alarm Worker"]
      Redis["Redis Live Cache"]
      DB["PostgreSQL + TimescaleDB"]
      Web["React Web"]
      Nginx["Nginx"]
    end

    Grid -->|Modbus| Acq
    Load -->|Modbus| Acq
    Solar -->|Modbus| Acq
    DG -->|Modbus| Acq
    PLC -->|Modbus/MQTT later| Acq

    Acq -->|canonical telemetry| MQTT
    MQTT --> API
    MQTT --> Agg
    MQTT --> Rules
    API <--> Redis
    API --> DB
    Agg --> DB
    Rules --> DB
    Nginx <--> Web
    Nginx <--> API
```

## Services

| Service | Responsibility |
|---|---|
| api | REST API, auth, RBAC, Socket.IO, live/history endpoints |
| acquisition-worker | poll devices, decode registers, publish telemetry |
| aggregation-worker | write raw/normalized telemetry and rollups |
| rules-worker | alarms, events, notifications later |
| web | React dashboard |
| postgres-timescale | config + historical data |
| redis | live cache + health state |
| mosquitto | local MQTT |
| nginx | reverse proxy and static web serving |

## Design principles

- local-first
- offline-capable
- driver-based
- canonical telemetry contract
- separated raw/live/history/alarms/audit data
- strict RBAC
- no unsafe writes
- visible service/device health
