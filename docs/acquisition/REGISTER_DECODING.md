# Register Decoding

Phase 5B supports read-only Modbus function codes:

| Function code | Meaning |
|---|---|
| `3` | Holding registers |
| `4` | Input registers |

Supported data types:

- `uint16`
- `int16`
- `uint32`
- `int32`
- `float32`

Supported byte and word order combinations are normalized to:

- `ABCD`
- `BADC`
- `CDAB`
- `DCBA`

`scale_factor` is applied after decoding. Phase 5B currently reads each register map independently for correctness; contiguous read grouping is a future performance improvement.
