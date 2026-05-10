create table drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  version text not null,
  protocol text not null check (protocol in ('modbus_tcp', 'modbus_rtu', 'mqtt', 'manual')),
  manifest jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, version)
);

create index drivers_protocol_idx on drivers (protocol);
create index audit_log_actor_created_at_idx on audit_log (actor_user_id, created_at desc);
