# Stakeholders and Roles

## Role matrix

| Role | View live | Configure devices | Edit drivers | Acknowledge alarms | Control write | Reports | User management |
|---|---:|---:|---:|---:|---:|---:|---:|
| Super Admin | yes | yes | yes | yes | yes | yes | yes |
| Engineer | yes | yes | yes | yes | optional | yes | no |
| Operator | yes | no | no | yes | limited | no | no |
| Manager | yes | no | no | view | no | yes | no |
| Executive | summary | no | no | no | no | yes | no |
| Viewer | limited | no | no | no | no | optional | no |

## Operator needs
- Is the plant normal?
- Is grid available?
- Is generator running?
- Is solar producing?
- Is load being supplied?
- Which alarm is active?
- Which device is offline?
- Are values stale?

## Engineer needs
- Add devices
- Configure Modbus TCP/RTU
- Import/export drivers
- Test register reads
- See raw and decoded values
- See communication errors
- Check CPU/RAM/disk/service status
- Backup/restore config

## Manager needs
- daily/monthly energy
- solar contribution
- grid/generator usage
- downtime
- alarms by severity
- exportable reports

## CEO needs
- plant health
- savings
- availability
- generator dependency
- top risks
- month trend
