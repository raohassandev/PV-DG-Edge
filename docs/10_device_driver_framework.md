# Device Driver Framework

## Goal

Support new field devices using driver JSON/YAML files without code changes.

## Required driver sections

- metadata
- protocol support
- connection defaults
- register groups
- register definitions
- semantic metric mapping
- write/control points
- test examples

## Driver metadata example

```json
{
  "driverId": "vendor-model-v1",
  "vendor": "Vendor",
  "model": "Model",
  "deviceType": "energy_meter",
  "version": "1.0.0",
  "protocols": ["modbus_tcp", "modbus_rtu"],
  "sourceManual": "manual.pdf",
  "verified": false
}
```

## Register fields

| Field | Required |
|---|---:|
| name | yes |
| metric | yes |
| addressDec | yes |
| addressHex | yes |
| functionCode | yes |
| dataType | yes |
| registerCount | yes |
| byteOrder | yes |
| scale | yes |
| offset | yes |
| unit | yes |
| access | yes |
| description | yes |
| pollGroup | yes |
| enabledByDefault | yes |
| min/max | recommended |
| source | recommended |

## Poll groups

| Group | Interval |
|---|---:|
| critical | 1s |
| fast | 2s-5s |
| normal | 10s-30s |
| slow | 60s-300s |
| manual | on demand |

## Validation

Codex must implement:
- schema validation
- duplicate register/address detection
- data type/register count validation
- missing metric detection
- scale/offset validation
- write point safety validation

## Engineer test tool

Must allow:
- test connection
- read single register
- read group
- show raw response
- show decoded value
- show quality/response time
