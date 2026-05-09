# API Contract

OpenAPI draft: `openapi/openapi.yaml`

## Base URL

```text
/api/v1
```

## API groups

| Group | Purpose |
|---|---|
| /auth | login, refresh, logout, me |
| /users | user management |
| /roles | roles/permissions |
| /sites | site CRUD |
| /devices | device CRUD/testing |
| /drivers | driver import/export/validation |
| /telemetry | live/history telemetry |
| /dashboard | role dashboard APIs |
| /alarms | alarms |
| /commands | control commands |
| /reports | report export |
| /system | health, backup, restore |
| /audit | audit trail |

## Standard response

Success:

```json
{
  "success": true,
  "data": {},
  "meta": { "requestId": "uuid" }
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  },
  "meta": { "requestId": "uuid" }
}
```

## Required endpoints

```text
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/me

GET    /sites
POST   /sites
GET    /sites/{siteId}
PATCH  /sites/{siteId}
DELETE /sites/{siteId}

GET    /devices
POST   /devices
GET    /devices/{deviceId}
PATCH  /devices/{deviceId}
DELETE /devices/{deviceId}
POST   /devices/{deviceId}/test-connection
POST   /devices/{deviceId}/read-register

GET    /drivers
POST   /drivers/import
GET    /drivers/{driverId}
POST   /drivers/{driverId}/validate
GET    /drivers/{driverId}/export

GET /telemetry/live/site/{siteId}
GET /telemetry/live/device/{deviceId}
GET /telemetry/history

GET /dashboard/operator/{siteId}
GET /dashboard/engineer/{siteId}
GET /dashboard/manager/{siteId}
GET /dashboard/executive/{siteId}

GET  /alarms
POST /alarms/{alarmId}/acknowledge

POST /commands
GET  /commands/{commandId}
```

## API rule

Every endpoint needs validation, auth/permission check, OpenAPI docs, and tests.
