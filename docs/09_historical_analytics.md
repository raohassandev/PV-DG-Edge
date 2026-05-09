# Historical Analytics

## Layers

| Layer | Purpose |
|---|---|
| Raw payload | troubleshooting |
| Normalized measurements | trends and analytics |
| Rollups | fast reports |
| KPI tables | manager/executive dashboards |

## Metric naming

Use stable semantic names:

```text
ac.voltage.l1n_v
ac.current.l1_a
ac.power.total_kw
ac.frequency_hz
energy.import_kwh
energy.export_kwh
solar.power_kw
solar.energy_today_kwh
generator.power_kw
generator.runtime_s
load.power_kw
status.running
status.alarm
comm.online
comm.response_time_ms
```

## Energy calculation rules

1. Prefer trusted cumulative counters when available.
2. Detect resets, rollovers, negative deltas, and impossible jumps.
3. Never directly sum lifetime counters into period totals.
4. If counters are unavailable, integrate power over time.
5. Store calculation source and quality.

## Aggregation windows

| Window | Use |
|---|---|
| raw | engineering |
| 1 minute | live trends |
| 15 minute | operations |
| 1 hour | reports |
| 1 day | executive/manager |
| 1 month | long reports |

## KPIs

### Operator
- grid status
- solar kW
- generator kW
- load kW
- active alarms
- offline devices

### Engineer
- poll success %
- response time
- timeout/CRC count
- stale metrics
- raw decoded values

### Manager
- solar generation
- grid import/export
- generator runtime
- downtime
- alarm summary
- availability

### Executive
- energy summary
- estimated savings
- generator dependency
- site health
- top issues
