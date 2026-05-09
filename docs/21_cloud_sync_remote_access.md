# Cloud Sync and Remote Access

## Principle

Local system is source of truth. Cloud is optional.

## Store-and-forward

If internet is available:
- sync selected rollups
- sync alarms/events
- sync site health
- sync reports if enabled

If internet is unavailable:
- queue sync jobs
- retry later
- continue local operation

## Sync levels

| Level | Data |
|---|---|
| none | no cloud |
| summary | daily KPIs |
| operational | 15-min rollups + alarms |
| full | selected telemetry |

## Remote support

Enable only by admin.

Recommended:
- WireGuard/Tailscale VPN
- time-limited support access
- audit all remote sessions
- read-only support mode where possible
