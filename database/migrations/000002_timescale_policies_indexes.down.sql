do $$
begin
  perform remove_retention_policy('telemetry_raw', if_exists => true);
exception
  when undefined_function then
    null;
end $$;

drop index if exists audit_log_created_at_idx;
drop index if exists alarms_site_status_severity_idx;
drop index if exists telemetry_daily_site_parameter_bucket_idx;
drop index if exists telemetry_hourly_site_parameter_bucket_idx;
drop index if exists telemetry_5min_site_parameter_bucket_idx;
drop index if exists telemetry_latest_device_parameter_idx;
drop index if exists telemetry_latest_site_idx;
drop index if exists telemetry_raw_device_time_idx;
drop index if exists telemetry_raw_site_time_idx;
