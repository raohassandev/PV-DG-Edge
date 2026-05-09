export interface DeviceDriverManifest {
  id: string;
  name: string;
  version: string;
  protocol: "modbus-tcp" | "modbus-rtu";
}
