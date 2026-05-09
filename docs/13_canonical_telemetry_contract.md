# Canonical Telemetry Contract

## Purpose

Convert all device-specific values into common semantic metrics.

## Payload

```json
{
  "schemaVersion": "1.0",
  "ts": "2026-05-09T10:00:00Z",
  "siteId": "uuid",
  "deviceId": "uuid",
  "deviceType": "energy_meter",
  "source": "modbus_tcp",
  "quality": 192,
  "metrics": {
    "ac.voltage.l1n_v": {
      "value": 230.1,
      "unit": "V",
      "quality": 192,
      "sourceAddress": "0x7531",
      "scale": 0.1
    }
  }
}
```

## Device types

- grid_meter
- load_meter
- solar_inverter
- solar_meter
- generator_meter
- generator_controller
- plc
- weather_station
- system

## Common metrics

### AC
```text
ac.voltage.l1n_v
ac.voltage.l2n_v
ac.voltage.l3n_v
ac.voltage.l12_v
ac.voltage.l23_v
ac.voltage.l31_v
ac.current.l1_a
ac.current.l2_a
ac.current.l3_a
ac.power.total_kw
ac.reactive_power.total_kvar
ac.apparent_power.total_kva
ac.power_factor.total
ac.frequency_hz
```

### Energy
```text
energy.import_kwh
energy.export_kwh
energy.generation_kwh
energy.consumption_kwh
```

### Solar
```text
solar.power_kw
solar.energy_today_kwh
solar.energy_total_kwh
solar.inverter_temperature_c
```

### Generator
```text
generator.power_kw
generator.energy_kwh
generator.runtime_s
generator.frequency_hz
generator.fuel_level_percent
generator.coolant_temperature_c
```

### Status and communication
```text
status.running
status.available
status.alarm
status.trip
comm.online
comm.response_time_ms
```

## Rules

- Do not rename metrics without migration.
- Numeric metrics must be numbers, not strings.
- Preserve raw payload separately.
- Use quality codes for bad/stale/uncertain values.
