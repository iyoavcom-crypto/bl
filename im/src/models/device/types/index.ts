/**
 * @module types/models/device
 * @description 设备模型类型统一导出
 */

// ==================== 常量枚举 ====================
export { DevicePlatform, PushProvider } from "./const.js";

// ==================== 类型接口 ====================
export type { DeviceAttributes } from "./device.js";

// ==================== 字段配置常量 ====================
export {
  DEVICE_LIST,
  DEVICE_DETAIL,
  DEVICE_CREATABLE,
  DEVICE_UPDATABLE,
  DEVICE_FILTERABLE,
  DEVICE_SORTABLE,
} from "./device.js";
