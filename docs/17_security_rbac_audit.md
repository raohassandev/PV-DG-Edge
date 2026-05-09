# Security, RBAC, and Audit

## Goals

- prevent unauthorized access
- protect control writes
- keep audit trail
- avoid default production credentials
- keep database/MQTT/Redis internal by default

## Authentication

- JWT access token
- refresh token
- password hashing with Argon2 or bcrypt
- first-run super admin setup
- no default admin password in production

## Permissions

Examples:
```text
site.view
site.manage
device.view
device.manage
driver.view
driver.manage
telemetry.view
alarm.view
alarm.acknowledge
command.request
command.approve
system.view
system.manage
backup.create
backup.restore
user.manage
audit.view
```

## Control write protection

Every command requires:
- authenticated user
- permission
- enabled write point
- allowed value/range
- confirmation for high-risk write
- audit record
- command result
- readback verification if configured

## Audit log

Audit:
- login/logout
- failed login
- user/role changes
- device changes
- driver changes
- alarm actions
- commands
- backup/restore
- system settings

Audit records must be append-only.
