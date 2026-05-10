import { getDatabasePool } from "@pvdg/db";
import type pg from "pg";

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  permissions: string[];
}

export interface SiteRecord {
  id: string;
  name: string;
  code: string;
  locationName: string | null;
  timezone: string;
  capacityKw: string | null;
}

export interface DeviceRecord {
  id: string;
  siteId: string;
  name: string;
  deviceKey: string;
  deviceType: string;
  protocol: string;
  enabled: boolean;
  connectionConfig: unknown;
  pollingIntervalMs: number;
}

export interface DriverRecord {
  id: string;
  name: string;
  version: string;
  protocol: string;
  manifest: unknown;
}

export interface ApiStore {
  hasUsers(): Promise<boolean>;
  createAdmin(input: { fullName: string; email: string; passwordHash: string }): Promise<UserRecord>;
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  listRoles(): Promise<Array<{ name: string; permissions: string[] }>>;
  listSites(): Promise<SiteRecord[]>;
  createSite(input: Omit<SiteRecord, "id">): Promise<SiteRecord>;
  getSite(id: string): Promise<SiteRecord | null>;
  updateSite(id: string, input: Partial<Omit<SiteRecord, "id">>): Promise<SiteRecord | null>;
  deleteSite(id: string): Promise<boolean>;
  listDevices(): Promise<DeviceRecord[]>;
  createDevice(input: Omit<DeviceRecord, "id">): Promise<DeviceRecord>;
  getDevice(id: string): Promise<DeviceRecord | null>;
  updateDevice(id: string, input: Partial<Omit<DeviceRecord, "id">>): Promise<DeviceRecord | null>;
  deleteDevice(id: string): Promise<boolean>;
  listDrivers(): Promise<DriverRecord[]>;
  createDriver(input: Omit<DriverRecord, "id">): Promise<DriverRecord>;
  getDriver(id: string): Promise<DriverRecord | null>;
  audit(input: { actorUserId: string | null; action: string; entityType: string; entityId?: string; after?: unknown }): Promise<void>;
}

function userFromRow(row: Record<string, unknown>): UserRecord {
  return {
    id: String(row.id),
    fullName: String(row.full_name),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    isActive: Boolean(row.is_active),
    permissions: Array.isArray(row.permissions) ? (row.permissions as string[]) : []
  };
}

function siteFromRow(row: Record<string, unknown>): SiteRecord {
  return {
    id: String(row.id),
    name: String(row.name),
    code: String(row.code),
    locationName: row.location_name ? String(row.location_name) : null,
    timezone: String(row.timezone),
    capacityKw: row.capacity_kw ? String(row.capacity_kw) : null
  };
}

function deviceFromRow(row: Record<string, unknown>): DeviceRecord {
  return {
    id: String(row.id),
    siteId: String(row.site_id),
    name: String(row.name),
    deviceKey: String(row.device_key),
    deviceType: String(row.device_type),
    protocol: String(row.protocol),
    enabled: Boolean(row.enabled),
    connectionConfig: row.connection_config,
    pollingIntervalMs: Number(row.polling_interval_ms)
  };
}

function driverFromRow(row: Record<string, unknown>): DriverRecord {
  return {
    id: String(row.id),
    name: String(row.name),
    version: String(row.version),
    protocol: String(row.protocol),
    manifest: row.manifest
  };
}

export class PostgresApiStore implements ApiStore {
  constructor(private readonly pool: pg.Pool = getDatabasePool() as pg.Pool) {}

  async hasUsers(): Promise<boolean> {
    const result = await this.pool.query<{ exists: boolean }>("select exists(select 1 from users) as exists");
    return result.rows[0]?.exists ?? false;
  }

  async createAdmin(input: { fullName: string; email: string; passwordHash: string }): Promise<UserRecord> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const user = await client.query(
        "insert into users (full_name, email, password_hash) values ($1, $2, $3) returning *",
        [input.fullName, input.email.toLowerCase(), input.passwordHash]
      );
      await client.query(
        "insert into user_roles (user_id, role_id) select $1, id from roles where name = 'admin' on conflict do nothing",
        [user.rows[0].id]
      );
      await client.query("commit");
      return (await this.findUserById(user.rows[0].id)) as UserRecord;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.findUser("u.email = $1", [email.toLowerCase()]);
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    return this.findUser("u.id = $1", [id]);
  }

  private async findUser(where: string, values: unknown[]): Promise<UserRecord | null> {
    const result = await this.pool.query(
      `select u.*, coalesce(array_agg(distinct p.code) filter (where p.code is not null), '{}') as permissions
       from users u
       left join user_roles ur on ur.user_id = u.id
       left join role_permissions rp on rp.role_id = ur.role_id
       left join permissions p on p.id = rp.permission_id
       where ${where}
       group by u.id`,
      values
    );
    return result.rows[0] ? userFromRow(result.rows[0]) : null;
  }

  async listRoles(): Promise<Array<{ name: string; permissions: string[] }>> {
    const result = await this.pool.query(
      `select r.name, coalesce(array_agg(p.code order by p.code) filter (where p.code is not null), '{}') as permissions
       from roles r
       left join role_permissions rp on rp.role_id = r.id
       left join permissions p on p.id = rp.permission_id
       group by r.id
       order by r.name`
    );
    return result.rows.map((row: { name: string; permissions: string[] }) => ({ name: row.name, permissions: row.permissions }));
  }

  async listSites(): Promise<SiteRecord[]> {
    const result = await this.pool.query("select * from sites order by name");
    return result.rows.map(siteFromRow);
  }

  async createSite(input: Omit<SiteRecord, "id">): Promise<SiteRecord> {
    const result = await this.pool.query(
      "insert into sites (name, code, location_name, timezone, capacity_kw) values ($1, $2, $3, $4, $5) returning *",
      [input.name, input.code, input.locationName, input.timezone, input.capacityKw]
    );
    return siteFromRow(result.rows[0]);
  }

  async getSite(id: string): Promise<SiteRecord | null> {
    const result = await this.pool.query("select * from sites where id = $1", [id]);
    return result.rows[0] ? siteFromRow(result.rows[0]) : null;
  }

  async updateSite(id: string, input: Partial<Omit<SiteRecord, "id">>): Promise<SiteRecord | null> {
    const current = await this.getSite(id);
    if (!current) return null;
    const next = { ...current, ...input };
    const result = await this.pool.query(
      "update sites set name=$2, code=$3, location_name=$4, timezone=$5, capacity_kw=$6, updated_at=now() where id=$1 returning *",
      [id, next.name, next.code, next.locationName, next.timezone, next.capacityKw]
    );
    return siteFromRow(result.rows[0]);
  }

  async deleteSite(id: string): Promise<boolean> {
    const result = await this.pool.query("delete from sites where id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async listDevices(): Promise<DeviceRecord[]> {
    const result = await this.pool.query("select * from devices order by name");
    return result.rows.map(deviceFromRow);
  }

  async createDevice(input: Omit<DeviceRecord, "id">): Promise<DeviceRecord> {
    const result = await this.pool.query(
      `insert into devices (site_id, name, device_key, device_type, protocol, enabled, connection_config, polling_interval_ms)
       values ($1, $2, $3, $4, $5, $6, $7, $8) returning *`,
      [
        input.siteId,
        input.name,
        input.deviceKey,
        input.deviceType,
        input.protocol,
        input.enabled,
        input.connectionConfig,
        input.pollingIntervalMs
      ]
    );
    return deviceFromRow(result.rows[0]);
  }

  async getDevice(id: string): Promise<DeviceRecord | null> {
    const result = await this.pool.query("select * from devices where id = $1", [id]);
    return result.rows[0] ? deviceFromRow(result.rows[0]) : null;
  }

  async updateDevice(id: string, input: Partial<Omit<DeviceRecord, "id">>): Promise<DeviceRecord | null> {
    const current = await this.getDevice(id);
    if (!current) return null;
    const next = { ...current, ...input };
    const result = await this.pool.query(
      `update devices set site_id=$2, name=$3, device_key=$4, device_type=$5, protocol=$6, enabled=$7,
       connection_config=$8, polling_interval_ms=$9, updated_at=now() where id=$1 returning *`,
      [
        id,
        next.siteId,
        next.name,
        next.deviceKey,
        next.deviceType,
        next.protocol,
        next.enabled,
        next.connectionConfig,
        next.pollingIntervalMs
      ]
    );
    return deviceFromRow(result.rows[0]);
  }

  async deleteDevice(id: string): Promise<boolean> {
    const result = await this.pool.query("delete from devices where id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async listDrivers(): Promise<DriverRecord[]> {
    const result = await this.pool.query("select * from drivers order by name, version");
    return result.rows.map(driverFromRow);
  }

  async createDriver(input: Omit<DriverRecord, "id">): Promise<DriverRecord> {
    const result = await this.pool.query(
      "insert into drivers (name, version, protocol, manifest) values ($1, $2, $3, $4) returning *",
      [input.name, input.version, input.protocol, input.manifest]
    );
    return driverFromRow(result.rows[0]);
  }

  async getDriver(id: string): Promise<DriverRecord | null> {
    const result = await this.pool.query("select * from drivers where id = $1", [id]);
    return result.rows[0] ? driverFromRow(result.rows[0]) : null;
  }

  async audit(input: { actorUserId: string | null; action: string; entityType: string; entityId?: string; after?: unknown }): Promise<void> {
    await this.pool.query(
      "insert into audit_log (actor_user_id, action, entity_type, entity_id, after_json) values ($1, $2, $3, $4, $5)",
      [input.actorUserId, input.action, input.entityType, input.entityId ?? null, input.after ?? null]
    );
  }
}

export class MemoryApiStore implements ApiStore {
  users = new Map<string, UserRecord>();
  sites = new Map<string, SiteRecord>();
  devices = new Map<string, DeviceRecord>();
  drivers = new Map<string, DriverRecord>();
  audits: unknown[] = [];

  async hasUsers() { return this.users.size > 0; }
  async createAdmin(input: { fullName: string; email: string; passwordHash: string }) {
    const user = { id: crypto.randomUUID(), fullName: input.fullName, email: input.email.toLowerCase(), passwordHash: input.passwordHash, isActive: true, permissions: ["admin.manage", "site.view", "site.manage", "device.view", "device.manage", "telemetry.view", "system.view"] };
    this.users.set(user.id, user);
    return user;
  }
  async findUserByEmail(email: string) { return [...this.users.values()].find((user) => user.email === email.toLowerCase()) ?? null; }
  async findUserById(id: string) { return this.users.get(id) ?? null; }
  async listRoles() { return [{ name: "admin", permissions: ["admin.manage", "site.manage", "device.manage"] }]; }
  async listSites() { return [...this.sites.values()]; }
  async createSite(input: Omit<SiteRecord, "id">) { const row = { id: crypto.randomUUID(), ...input }; this.sites.set(row.id, row); return row; }
  async getSite(id: string) { return this.sites.get(id) ?? null; }
  async updateSite(id: string, input: Partial<Omit<SiteRecord, "id">>) { const row = this.sites.get(id); if (!row) return null; const next = { ...row, ...input }; this.sites.set(id, next); return next; }
  async deleteSite(id: string) { return this.sites.delete(id); }
  async listDevices() { return [...this.devices.values()]; }
  async createDevice(input: Omit<DeviceRecord, "id">) { const row = { id: crypto.randomUUID(), ...input }; this.devices.set(row.id, row); return row; }
  async getDevice(id: string) { return this.devices.get(id) ?? null; }
  async updateDevice(id: string, input: Partial<Omit<DeviceRecord, "id">>) { const row = this.devices.get(id); if (!row) return null; const next = { ...row, ...input }; this.devices.set(id, next); return next; }
  async deleteDevice(id: string) { return this.devices.delete(id); }
  async listDrivers() { return [...this.drivers.values()]; }
  async createDriver(input: Omit<DriverRecord, "id">) { const row = { id: crypto.randomUUID(), ...input }; this.drivers.set(row.id, row); return row; }
  async getDriver(id: string) { return this.drivers.get(id) ?? null; }
  async audit(input: unknown) { this.audits.push(input); }
}
