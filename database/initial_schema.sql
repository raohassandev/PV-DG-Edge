CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  timezone text NOT NULL DEFAULT 'Asia/Karachi',
  capacity_kw numeric,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  password_hash text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text
);

CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text
);

CREATE TABLE user_roles (
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE site_access (
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  access_level text NOT NULL DEFAULT 'view',
  PRIMARY KEY (user_id, site_id)
);

CREATE TABLE device_drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id text UNIQUE NOT NULL,
  vendor text NOT NULL,
  model text NOT NULL,
  device_type text NOT NULL,
  version text NOT NULL,
  spec jsonb NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES device_drivers(id),
  name text NOT NULL,
  slug text NOT NULL,
  device_type text NOT NULL,
  protocol text NOT NULL,
  connection jsonb NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(site_id, slug)
);

CREATE TABLE telemetry_raw (
  ts timestamptz NOT NULL,
  site_id uuid NOT NULL,
  device_id uuid NOT NULL,
  topic text,
  payload jsonb NOT NULL,
  quality smallint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
SELECT create_hypertable('telemetry_raw', 'ts', if_not_exists => TRUE);

CREATE TABLE telemetry_measurements (
  ts timestamptz NOT NULL,
  site_id uuid NOT NULL,
  device_id uuid NOT NULL,
  metric text NOT NULL,
  value_double double precision,
  value_text text,
  value_bool boolean,
  unit text,
  quality smallint NOT NULL,
  source text NOT NULL,
  tags jsonb NOT NULL DEFAULT '{}'
);
SELECT create_hypertable('telemetry_measurements', 'ts', if_not_exists => TRUE);

CREATE INDEX ON telemetry_measurements (site_id, metric, ts DESC);
CREATE INDEX ON telemetry_measurements (device_id, metric, ts DESC);

CREATE TABLE alarms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id),
  device_id uuid REFERENCES devices(id),
  severity text NOT NULL,
  status text NOT NULL,
  message text NOT NULL,
  source_metric text,
  source_value text,
  first_seen_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL,
  acknowledged_by uuid REFERENCES users(id),
  acknowledged_at timestamptz,
  cleared_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'
);

CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ts timestamptz NOT NULL DEFAULT now(),
  actor_user_id uuid REFERENCES users(id),
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}',
  ip_address inet
);

CREATE TABLE command_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id),
  device_id uuid NOT NULL REFERENCES devices(id),
  point text NOT NULL,
  value jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  requested_by uuid NOT NULL REFERENCES users(id),
  requested_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE command_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  command_id uuid NOT NULL REFERENCES command_requests(id),
  status text NOT NULL,
  message text,
  result jsonb NOT NULL DEFAULT '{}',
  completed_at timestamptz NOT NULL DEFAULT now()
);
