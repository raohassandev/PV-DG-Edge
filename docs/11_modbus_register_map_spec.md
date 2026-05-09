# Modbus Register Map Specification

## Required table

| Decimal Address | Hex Address | Parameter Name | Description | Function Code | Data Type | Scale Factor | Offset | Unit | No. of Registers | Byte Order | Access | Poll Group | Min | Max | Example Raw | Example Value | Source |
|---:|---|---|---|---:|---|---:|---:|---|---:|---|---|---|---:|---:|---|---|---|

Example:

| 30001 | 0x7531 | Grid Voltage L1-N | Line 1 to neutral voltage | 4 | uint16 | 0.1 | 0 | V | 1 | ABCD | R | fast | 0 | 300 | 2301 | 230.1 | manual p15 |

## Rules

- Always show decimal and hex address.
- Clearly state 0-based or 1-based addressing.
- Do not use ambiguous high/low wording in user docs.
- Use byte order/word order explicitly.
- Include source/manual reference.
- Do not claim a register exists unless verified.

## Supported data types

| Type | Registers |
|---|---:|
| bool | 1 |
| uint16 | 1 |
| int16 | 1 |
| uint32 | 2 |
| int32 | 2 |
| float32 | 2 |
| uint64 | 4 |
| int64 | 4 |
| string | variable |

## Byte order

Support:
- ABCD
- BADC
- CDAB
- DCBA

## Modbus TCP settings

- IP
- port
- unit ID
- timeout
- retry count

## Modbus RTU settings

- serial port
- baudrate
- parity
- data bits
- stop bits
- unit ID
- timeout
- inter-frame delay
