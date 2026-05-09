# Backup, Restore, and Retention

## Backup content

Mandatory:
- PostgreSQL dump
- driver files
- site/device configuration
- system settings
- deployment version
- report templates
- custom assets

## Schedule

| Backup | Frequency | Retention |
|---|---:|---:|
| config | daily | 30 copies |
| DB full | daily | 14 copies |
| weekly | weekly | 12 copies |
| monthly | monthly | 24 copies |

## Locations

- local disk
- external USB
- NAS
- cloud later

## Restore process

1. stop services
2. verify backup checksum
3. restore database
4. restore driver/config files
5. start services
6. run health checks
7. verify dashboard/devices

## Data retention

Default:
- raw telemetry: 30 days
- normalized: 90 days
- rollups: 10 years
- alarms/events: 5 years
- audit: 5 years
