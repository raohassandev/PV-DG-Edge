# Device Connection Config

`devices.connection_config` stores protocol-specific connection details as JSON.

## Modbus TCP

```json
{
  "host": "192.168.0.50",
  "port": 502,
  "unitId": 1,
  "timeoutMs": 2000
}
```

## Modbus RTU

```json
{
  "path": "/dev/ttyUSB0",
  "baudRate": 9600,
  "dataBits": 8,
  "stopBits": 1,
  "parity": "none",
  "unitId": 1,
  "timeoutMs": 2000
}
```

Unset values use conservative defaults: TCP port `502`, RTU baud `9600`, unit id `1`, and timeout `2000`.
