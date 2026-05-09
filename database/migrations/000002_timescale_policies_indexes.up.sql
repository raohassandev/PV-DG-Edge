create index if not exists telemetry_raw_site_time_idx on telemetry_raw (site_id, time desc);
create index if not exists telemetry_raw_device_time_idx on telemetry_raw (device_id, time desc);
create index if not exists telemetry_latest_site_idx on telemetry_latest (site_id);
create index if not exists telemetry_latest_device_parameter_idx on telemetry_latest (device_id, parameter_key);
create index if not exists telemetry_5min_site_parameter_bucket_idx on telemetry_5min (site_id, parameter_key, bucket desc);
create index if not exists telemetry_hourly_site_parameter_bucket_idx on telemetry_hourly (site_id, parameter_key, bucket desc);
create index if not exists telemetry_daily_site_parameter_bucket_idx on telemetry_daily (site_id, parameter_key, bucket desc);
create index if not exists alarms_site_status_severity_idx on alarms (site_id, status, severity);
create index if not exists audit_log_created_at_idx on audit_log (created_at desc);

do $$
begin
  if current_setting('pvdg.telemetry_raw_retention_days', true) is not null then
    perform add_retention_policy(
      'telemetry_raw',
      (current_setting('pvdg.telemetry_raw_retention_days') || ' days')::interval,
      if_not_exists => true
    );
  end if;
end $$;
