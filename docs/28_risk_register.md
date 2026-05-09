# Risk Register

| Risk | Impact | Probability | Mitigation |
|---|---|---:|---|
| wrong register mapping | wrong values | medium | source manuals, test tool, commissioning evidence |
| communication instability | missing data | high | retry, reconnect, quality codes |
| power failure | data loss | medium | UPS, WAL, backups |
| SSD failure | data loss | medium | external backups |
| UI too complex | poor adoption | medium | role-specific dashboards |
| database too large | slow system | medium | retention/compression/rollups |
| unsafe control write | equipment risk | low/critical | disabled by default, RBAC, audit |
| internet unavailable | cloud sync fail | high | local-first store-forward |
| engineer misconfiguration | bad data | medium | validation and test mode |
| Codex assumptions | delays | medium | phase prompts and review loop |
