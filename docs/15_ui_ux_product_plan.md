# UI/UX Product Plan

## Design goal

Do not show the same dashboard to every role. Separate operator, engineer, manager, and executive needs.

## Global layout

- Top bar: site selector, connection status, active alarm count, user menu.
- Left nav: Overview, Operator, Engineering, Reports, Alarms, Devices, Drivers, System, Settings.
- Alarm banner must always be visible when critical/high alarms exist.

## Operator dashboard

For 40-inch LED and local monitoring.

Must show:
- plant status: Normal / Warning / Alarm / Offline
- energy flow diagram
- grid available
- solar kW
- generator running/kW
- load kW
- frequency
- active alarms
- offline devices
- last update time
- stale data indicator

Rules:
- large values
- high contrast
- simple
- no engineering clutter

## Engineer dashboard

Must show:
- device list
- protocol status
- poll success %
- response time
- last error
- register test tool
- raw/decoded values
- driver version
- logs
- CPU/RAM/disk
- service status

## Manager dashboard

Must show:
- today/month energy
- solar contribution %
- generator runtime
- grid import/export
- downtime
- alarms by severity
- trends
- exports

## Executive dashboard

Must show:
- plant health score
- solar generation
- estimated savings
- generator dependency
- availability
- top 3 issues
- monthly trend

## Device wizard

Steps:
1. select site
2. device type
3. vendor/model/driver
4. protocol
5. connection settings
6. test connection
7. select poll groups
8. save
9. verify live values

## Driver wizard

Steps:
1. metadata
2. protocol
3. register groups
4. register table
5. canonical mapping
6. validation rules
7. write points
8. test
9. export/import
