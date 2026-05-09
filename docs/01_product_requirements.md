# Product Requirements Document

## Product goal

Build an on-site Linux PC PV-DG edge platform for monitoring, control, analytics, alarms, reporting, and optional cloud synchronization.

The system must work locally without internet.

## Target users

| User | Need |
|---|---|
| Operator | live plant status, alarms, quick response |
| Engineer | device setup, Modbus diagnostics, register maps, trends |
| Manager | energy reports, uptime, generator dependency, alarms |
| CEO / Executive | high-level KPIs, savings, availability, risk summary |

## Required features

### Local monitoring
- Grid status and measurements
- Solar/inverter status and measurements
- Generator status and measurements
- Load/consumption measurements
- Active alarms
- Communication health
- Plant one-line overview

### Device acquisition
Phase 1:
- Modbus TCP
- Modbus RTU over RS485

Future:
- OPC UA
- MQTT devices
- vendor APIs
- IEC 61850 if needed

### Historical analytics
- raw telemetry
- normalized measurement telemetry
- 1-minute, 15-minute, hourly, daily rollups
- solar generation
- grid import/export
- generator energy/runtime
- alarms/events
- communication quality
- reports

### Safe control writes
Control writes are allowed only when:
- write point is explicitly enabled
- user has permission
- value is validated
- confirmation is completed
- action is audited
- feedback/readback is verified where possible

## Performance targets

| Item | Target |
|---|---|
| live dashboard latency | less than 2 seconds after poll |
| critical polling | configurable 1s to 5s |
| UI response | less than 300ms for common actions |
| reboot recovery | services auto-start |
| offline operation | full local monitoring without internet |
| data quality | visible good/stale/bad status |

## Phase 1 acceptance

- Docker Compose deployment works
- local login works
- site/device/driver setup works
- Modbus TCP test works
- Modbus RTU settings supported
- MQTT telemetry flow works
- live dashboards work
- historical telemetry and rollups work
- alarms work
- backup/restore scripts exist
