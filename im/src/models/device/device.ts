import { DataTypes, Model, Sequelize, type Optional } from "sequelize";
import type { DeviceAttributes, DevicePlatform, PushProvider } from "./types/index.js";
import { deviceBeforeCreateHook } from "./hook.js";
import { randomUUID } from "crypto";

/**
 * @type DeviceCreationAttributes
 * @description 创建时可省略部分字段
 */
export type DeviceCreationAttributes = Optional<
  DeviceAttributes,
  | "id"
  | "deviceName"
  | "pushToken"
  | "pushProvider"
  | "appVersion"
  | "osVersion"
  | "isOnline"
  | "doNotDisturb"
  | "lastActiveAt"
  | "lastIp"
  | "createdAt"
  | "updatedAt"
>;

/**
 * @class Device
 * @description 设备模型
 */
export class Device extends Model<DeviceAttributes, DeviceCreationAttributes> implements DeviceAttributes {
  declare id: string;
  declare userId: string;
  declare platform: DevicePlatform;
  declare deviceId: string;
  declare deviceName: string | null;
  declare pushToken: string | null;
  declare pushProvider: PushProvider | null;
  declare appVersion: string | null;
  declare osVersion: string | null;
  declare isOnline: boolean;
  declare doNotDisturb: boolean;
  declare lastActiveAt: Date | null;
  declare lastIp: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;
}

/**
 * @function initDevice
 * @description 初始化 Device 模型定义
 * @param {Sequelize} sequelize Sequelize 实例
 * @returns {typeof Device} 模型类
 */
export function initDevice(sequelize: Sequelize): typeof Device {
  Device.init(
    {
      id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        primaryKey: true,
        defaultValue: () => randomUUID(),
        comment: "主键（UUID）",
      },
      userId: {
        type: DataTypes.STRING(7),
        allowNull: false,
        comment: "用户 ID",
        references: { model: "user", key: "id" },
      },
      platform: {
        type: DataTypes.ENUM("ios", "android", "web", "macos", "windows"),
        allowNull: false,
        comment: "设备平台",
      },
      deviceId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "设备硬件标识",
      },
      deviceName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "设备名称",
      },
      pushToken: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "推送令牌",
      },
      pushProvider: {
        type: DataTypes.ENUM("apns", "expo", "fcm"),
        allowNull: true,
        comment: "推送提供商",
      },
      appVersion: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: "应用版本",
      },
      osVersion: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "系统版本",
      },
      isOnline: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "是否在线",
      },
      doNotDisturb: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "勿扰模式",
      },
      lastActiveAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "最后活跃时间",
      },
      lastIp: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "最后登录 IP",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "创建时间",
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "更新时间",
      },
    },
    {
      sequelize,
      modelName: "Device",
      tableName: "device",
      timestamps: true,
      paranoid: true,
      underscored: false,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      indexes: [
        {
          name: "device_userId_platform_unique",
          unique: true,
          fields: ["userId", "platform"],
        },
        { fields: ["userId", "isOnline"] },
        { fields: ["pushToken"] },
        { fields: ["lastActiveAt"] },
      ],
      comment: "设备表",
    }
  );

  Device.beforeCreate(deviceBeforeCreateHook);

  return Device;
}
