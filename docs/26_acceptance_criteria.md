# Acceptance Criteria

## Platform
- [ ] Docker Compose starts all services
- [ ] services auto-start after reboot
- [ ] health page works
- [ ] no default production credentials
- [ ] first-run setup works

## Auth/RBAC
- [ ] login works
- [ ] permissions enforced
- [ ] unauthorized requests blocked
- [ ] audit records security events

## Devices
- [ ] Modbus TCP device works
- [ ] Modbus RTU settings supported
- [ ] driver import validates
- [ ] register read test works
- [ ] telemetry publishes to MQTT
- [ ] offline device shows bad/stale quality

## Realtime
- [ ] live dashboard updates
- [ ] Socket.IO reconnect works
- [ ] stale indicator works
- [ ] alarms update live

## Historical
- [ ] raw telemetry stored
- [ ] normalized telemetry stored
- [ ] rollups work
- [ ] energy reset handling works

## UI
- [ ] operator dashboard readable
- [ ] engineer dashboard useful
- [ ] manager dashboard has KPIs
- [ ] executive dashboard is simple

## Backup
- [ ] manual backup works
- [ ] scheduled backup works
- [ ] restore test documented
