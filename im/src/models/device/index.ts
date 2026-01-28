/**
 * @module models-device
 * @description Device 模型统一导出
 */

// ==================== 模型类 ====================
export { Device, initDevice } from "./device.js";
export type { DeviceCreationAttributes } from "./device.js";

// ==================== 类型定义 ====================
export type { DeviceAttributes } from "./types/index.js";
export { DevicePlatform, PushProvider } from "./types/index.js";

// ==================== 字段配置常量 ====================
export {
  DEVICE_LIST,
  DEVICE_DETAIL,
  DEVICE_CREATABLE,
  DEVICE_UPDATABLE,
  DEVICE_FILTERABLE,
  DEVICE_SORTABLE,
} from "./types/index.js";

// ==================== 关联函数 ====================
export { associateDevice } from "./association.js";

// ==================== 钩子函数 ====================
export { deviceBeforeCreateHook } from "./hook.js";
