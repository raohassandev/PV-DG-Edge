insert into sites (name, code, timezone)
values ('Demo Site', 'DEMO', 'Asia/Karachi')
on conflict (code) do update set
  name = excluded.name,
  timezone = excluded.timezone,
  updated_at = now();

insert into roles (name, description)
values
  ('operator', 'Operator live monitoring role'),
  ('engineer', 'Engineer commissioning and diagnostics role'),
  ('manager', 'Manager reporting and KPI role'),
  ('ceo', 'Executive summary role'),
  ('admin', 'Local platform administration role')
on conflict (name) do update set description = excluded.description;

insert into permissions (code, description)
values
  ('system.view', 'View system health and status'),
  ('site.view', 'View site configuration'),
  ('site.manage', 'Manage site configuration'),
  ('device.view', 'View devices'),
  ('device.manage', 'Manage devices'),
  ('telemetry.view', 'View telemetry'),
  ('alarms.view', 'View alarms'),
  ('alarms.ack', 'Acknowledge alarms'),
  ('reports.view', 'View reports'),
  ('commands.request', 'Request control commands'),
  ('commands.approve', 'Approve control commands'),
  ('admin.manage', 'Manage local administration')
on conflict (code) do update set description = excluded.description;

insert into role_permissions (role_id, permission_id)
select roles.id, permissions.id
from roles
cross join permissions
where roles.name = 'admin'
on conflict do nothing;
