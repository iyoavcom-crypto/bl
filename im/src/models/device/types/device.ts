/**
 * @module types/models/device
 * @description 设备模型类型定义：属性接口、字段配置常量
 */

import type { DevicePlatform, PushProvider } from "./const.js";

/**
 * @interface DeviceAttributes
 * @description 设备模型完整属性接口
 */
export interface DeviceAttributes {
  id: string;
  userId: string;
  platform: DevicePlatform;
  deviceId: string;
  deviceName: string | null;
  pushToken: string | null;
  pushProvider: PushProvider | null;
  appVersion: string | null;
  osVersion: string | null;
  isOnline: boolean;
  doNotDisturb: boolean;
  lastActiveAt: Date | null;
  lastIp: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * @const DEVICE_LIST
 * @description 列表查询字段
 */
export const DEVICE_LIST = [
  "id",
  "userId",
  "platform",
  "deviceName",
  "isOnline",
  "lastActiveAt",
  "createdAt",
] as const;

/**
 * @const DEVICE_DETAIL
 * @description 详情查询字段
 */
export const DEVICE_DETAIL = [
  "id",
  "userId",
  "platform",
  "deviceId",
  "deviceName",
  "pushProvider",
  "appVersion",
  "osVersion",
  "isOnline",
  "doNotDisturb",
  "lastActiveAt",
  "lastIp",
  "createdAt",
  "updatedAt",
] as const;

/**
 * @const DEVICE_CREATABLE
 * @description 创建时允许写入字段
 */
export const DEVICE_CREATABLE = [
  "userId",
  "platform",
  "deviceId",
  "deviceName",
  "pushToken",
  "pushProvider",
  "appVersion",
  "osVersion",
] as const;

/**
 * @const DEVICE_UPDATABLE
 * @description 更新时允许写入字段
 */
export const DEVICE_UPDATABLE = [
  "deviceName",
  "pushToken",
  "pushProvider",
  "appVersion",
  "osVersion",
  "isOnline",
  "doNotDisturb",
  "lastActiveAt",
  "lastIp",
] as const;

/**
 * @const DEVICE_FILTERABLE
 * @description 可筛选字段
 */
export const DEVICE_FILTERABLE = [
  "userId",
  "platform",
  "isOnline",
  "pushProvider",
] as const;

/**
 * @const DEVICE_SORTABLE
 * @description 可排序字段
 */
export const DEVICE_SORTABLE = [
  "lastActiveAt",
  "createdAt",
] as const;
