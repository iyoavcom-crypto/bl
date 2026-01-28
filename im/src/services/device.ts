/**
 * @packageDocumentation
 * @module services/Device
 * @tag [设备服务] [CRUD服务] [设备管理]
 * @since 1.0.0
 * @author Z-kali
 * @description 设备服务：使用 CRUD 服务处理设备相关业务逻辑
 * @path src/services/device.ts
 * @see src/models/device/index.ts
 */

import { Device } from "@/models/index.js";
import { createCrudService } from "@/repo/index.js";
import type { CrudConfig } from "@/repo/index.js";
import {
  DEVICE_LIST,
  DEVICE_DETAIL,
  DEVICE_CREATABLE,
  DEVICE_UPDATABLE,
  DEVICE_FILTERABLE,
  DEVICE_SORTABLE,
} from "@/models/device/index.js";

/**
 * @constant deviceCrudConfig
 * @description 设备 CRUD 配置
 */
const deviceCrudConfig: CrudConfig<Device> = {
  listFields: [...DEVICE_LIST],
  detailFields: [...DEVICE_DETAIL],
  creatableFields: [...DEVICE_CREATABLE],
  updatableFields: [...DEVICE_UPDATABLE],
  searchFields: ["id", "deviceId", "deviceName"],
  filterableFields: [...DEVICE_FILTERABLE],
  defaultOrder: [[DEVICE_SORTABLE[0], "DESC"]],
};

const BaseService = createCrudService(Device, deviceCrudConfig);

const DeviceService = {
  ...BaseService,
};

export default DeviceService;
