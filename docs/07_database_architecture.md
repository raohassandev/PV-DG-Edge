# Database Architecture

## Decision

Use PostgreSQL with TimescaleDB.

## Core tables

### Configuration
- organizations
- sites
- users
- roles
- permissions
- user_roles
- site_access
- devices
- device_connections
- device_drivers
- driver_registers
- control_points
- system_settings

### Historical/time-series
- telemetry_raw
- telemetry_measurements
- telemetry_rollup_1m
- telemetry_rollup_15m
- telemetry_rollup_1h
- energy_daily
- kpi_daily
- device_comm_stats

### Operations
- alarms
- alarm_events
- audit_log
- command_requests
- command_results
- backup_jobs
- sync_queue

## Normalized measurement model

| Column | Type | Example |
|---|---|---|
| ts | timestamptz | 2026-05-09T10:00:00Z |
| site_id | uuid | site |
| device_id | uuid | device |
| metric | text | ac.power.total_kw |
| value_double | double | 123.4 |
| value_text | text | optional |
| value_bool | boolean | optional |
| unit | text | kW |
| quality | smallint | 192 |
| source | text | modbus_tcp |
| tags | jsonb | phase/device type |

## Quality codes

| Code | Meaning |
|---:|---|
| 0 | bad |
| 64 | uncertain |
| 128 | stale |
| 192 | good |

## Retention defaults

| Data | Retention |
|---|---:|
| raw telemetry | 30 days |
| normalized samples | 90 days |
| 1-minute rollups | 1 year |
| 15-minute rollups | 3 years |
| hourly/daily rollups | 10 years |
| alarms/events | 5 years |
| audit | 5 years |

## Compression

- raw telemetry after 7 days
- normalized after 14 days
- rollups after 30 days

## Backup

Back up:
- database
- driver files
- site config
- deployment version
- settings
- report templates
