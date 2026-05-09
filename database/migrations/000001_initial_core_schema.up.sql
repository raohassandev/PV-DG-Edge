create extension if not exists pgcrypto;
create extension if not exists timescaledb;

create table if not exists schema_migrations (
  filename text primary key,
  checksum text not null,
  applied_at timestamptz not null default now()
);

create table sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  location_name text,
  timezone text not null default 'Asia/Karachi',
  capacity_kw numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text
);

create table permissions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text
);

create table role_permissions (
  role_id uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table user_roles (
  user_id uuid not null references users(id) on delete cascade,
  role_id uuid not null references roles(id) on delete cascade,
  primary key (user_id, role_id)
);

create table devices (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  name text not null,
  device_key text unique not null,
  device_type text not null check (device_type in ('grid_meter', 'generator_meter', 'solar_inverter', 'load_meter', 'weather_station', 'plc', 'gateway', 'other')),
  protocol text not null check (protocol in ('modbus_tcp', 'modbus_rtu', 'mqtt', 'manual')),
  enabled boolean not null default true,
  connection_config jsonb not null default '{}',
  polling_interval_ms integer not null default 1000 check (polling_interval_ms > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table device_register_maps (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references devices(id) on delete cascade,
  parameter_key text not null,
  display_name text not null,
  unit text,
  data_type text not null,
  address_decimal integer,
  address_hex text,
  function_code integer,
  scale_factor numeric not null default 1,
  register_count integer not null check (register_count > 0),
  access text not null check (access in ('R', 'RW', 'W')),
  byte_order text,
  word_order text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (device_id, parameter_key)
);

create table telemetry_raw (
  time timestamptz not null,
  site_id uuid not null references sites(id),
  device_id uuid references devices(id),
  source_topic text,
  payload jsonb not null,
  quality text not null default 'unknown',
  created_at timestamptz not null default now()
);

create table telemetry_latest (
  site_id uuid not null references sites(id) on delete cascade,
  device_id uuid not null references devices(id) on delete cascade,
  parameter_key text not null,
  value_numeric double precision,
  value_text text,
  unit text,
  quality text not null default 'unknown',
  source_time timestamptz not null,
  updated_at timestamptz not null default now(),
  unique (device_id, parameter_key)
);

create table telemetry_5min (
  bucket timestamptz not null,
  site_id uuid not null references sites(id),
  device_id uuid references devices(id),
  parameter_key text not null,
  avg_value double precision,
  min_value double precision,
  max_value double precision,
  last_value double precision,
  sample_count integer not null default 0,
  quality text not null default 'unknown'
);

create table telemetry_hourly (like telemetry_5min including all);
create table telemetry_daily (like telemetry_5min including all);

create table alarms (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  device_id uuid references devices(id) on delete set null,
  severity text not null check (severity in ('info', 'warning', 'critical')),
  status text not null check (status in ('active', 'acknowledged', 'cleared')),
  alarm_key text not null,
  title text not null,
  description text,
  first_seen_at timestamptz not null,
  last_seen_at timestamptz not null,
  acknowledged_at timestamptz,
  acknowledged_by uuid references users(id) on delete set null,
  cleared_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_json jsonb,
  after_json jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create table system_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  severity text not null check (severity in ('info', 'warning', 'critical')),
  message text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

select create_hypertable('telemetry_raw', 'time', if_not_exists => true);
select create_hypertable('telemetry_5min', 'bucket', if_not_exists => true);
select create_hypertable('telemetry_hourly', 'bucket', if_not_exists => true);
select create_hypertable('telemetry_daily', 'bucket', if_not_exists => true);
