/**
 * @packageDocumentation
 * @module services/im/device
 * @since 1.0.0
 * @author Z-kali
 * @description IM 设备服务：设备注册、更新、在线状态、推送令牌等业务逻辑
 * @path src/services/im/device.ts
 */

import { Device } from "@/models/index.js";
import type { DevicePlatform, PushProvider } from "@/models/device/index.js";

/**
 * @interface RegisterDeviceInput
 * @description 注册设备输入
 */
export interface RegisterDeviceInput {
  platform: DevicePlatform;
  deviceId: string;
  deviceName?: string;
  pushToken?: string;
  pushProvider?: PushProvider;
  appVersion?: string;
  osVersion?: string;
}

/**
 * @interface UpdateDeviceInput
 * @description 更新设备输入
 */
export interface UpdateDeviceInput {
  deviceName?: string;
  pushToken?: string;
  pushProvider?: PushProvider;
  appVersion?: string;
  osVersion?: string;
  doNotDisturb?: boolean;
}

/**
 * @class IMDeviceService
 * @description IM 设备业务服务
 */
class IMDeviceService {
  /**
   * 注册或更新设备
   * @param userId 用户 ID
   * @param input 设备信息
   * @param ip 客户端 IP
   */
  async registerDevice(userId: string, input: RegisterDeviceInput, ip?: string): Promise<Device> {
    const { platform, deviceId, deviceName, pushToken, pushProvider, appVersion, osVersion } = input;

    // 查找已有设备
    let device = await Device.findOne({
      where: { userId, deviceId },
    });

    if (device) {
      // 更新设备信息
      await device.update({
        platform,
        deviceName: deviceName || device.deviceName,
        pushToken: pushToken || device.pushToken,
        pushProvider: pushProvider || device.pushProvider,
        appVersion: appVersion || device.appVersion,
        osVersion: osVersion || device.osVersion,
        isOnline: true,
        lastActiveAt: new Date(),
        lastIp: ip || device.lastIp,
      });
    } else {
      // 创建新设备
      device = await Device.create({
        userId,
        platform,
        deviceId,
        deviceName: deviceName || null,
        pushToken: pushToken || null,
        pushProvider: pushProvider || null,
        appVersion: appVersion || null,
        osVersion: osVersion || null,
        isOnline: true,
        lastActiveAt: new Date(),
        lastIp: ip || null,
      });
    }

    return device;
  }

  /**
   * 获取我的设备列表
   * @param userId 用户 ID
   */
  async getMyDevices(userId: string): Promise<Device[]> {
    return await Device.findAll({
      where: { userId },
      order: [["lastActiveAt", "DESC"]],
    });
  }

  /**
   * 获取设备详情
   * @param userId 用户 ID
   * @param deviceId 设备硬件标识符
   */
  async getDeviceDetail(userId: string, deviceId: string): Promise<Device> {
    const device = await Device.findOne({
      where: { deviceId, userId },
    });

    if (!device) {
      const error = new Error("设备不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    return device;
  }

  /**
   * 更新设备信息
   * @param userId 用户 ID
   * @param deviceId 设备硬件标识符
   * @param input 更新数据
   */
  async updateDevice(userId: string, deviceId: string, input: UpdateDeviceInput): Promise<Device> {
    const device = await Device.findOne({
      where: { deviceId, userId },
    });

    if (!device) {
      const error = new Error("设备不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    await device.update(input);
    return device;
  }

  /**
   * 删除设备（退出登录）
   * @param userId 用户 ID
   * @param deviceId 设备硬件标识符
   */
  async removeDevice(userId: string, deviceId: string): Promise<void> {
    const device = await Device.findOne({
      where: { deviceId, userId },
    });

    if (!device) {
      const error = new Error("设备不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    await device.destroy();
  }

  /**
   * 更新推送令牌
   * @param userId 用户 ID
   * @param deviceId 设备硬件标识符
   * @param pushToken 推送令牌
   * @param pushProvider 推送提供商
   */
  async updatePushToken(
    userId: string,
    deviceId: string,
    pushToken: string,
    pushProvider: PushProvider
  ): Promise<Device> {
    const device = await Device.findOne({
      where: { deviceId, userId },
    });

    if (!device) {
      const error = new Error("设备不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    await device.update({ pushToken, pushProvider });
    return device;
  }

  /**
   * 设备心跳（优化：使用条件更新减少查询）
   * @param userId 用户 ID
   * @param deviceId 设备硬件标识符
   * @param ip 客户端 IP
   */
  async heartbeat(userId: string, deviceId: string, ip?: string): Promise<Device> {
    const updateData: Record<string, unknown> = {
      isOnline: true,
      lastActiveAt: new Date(),
    };
    if (ip) {
      updateData.lastIp = ip;
    }

    const [affectedCount] = await Device.update(updateData, {
      where: { deviceId, userId },
    });

    if (affectedCount === 0) {
      const error = new Error("设备不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 返回更新后的设备（需要时才查询）
    const device = await Device.findOne({ where: { deviceId, userId } });
    return device!;
  }

  /**
   * 设备下线（优化：使用条件更新减少查询）
   * @param userId 用户 ID
   * @param deviceId 设备硬件标识符
   */
  async goOffline(userId: string, deviceId: string): Promise<Device> {
    const [affectedCount] = await Device.update(
      { isOnline: false },
      { where: { deviceId, userId } }
    );

    if (affectedCount === 0) {
      const error = new Error("设备不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 返回更新后的设备（需要时才查询）
    const device = await Device.findOne({ where: { deviceId, userId } });
    return device!;
  }

  /**
   * 获取用户在线设备（用于推送）
   * @param userId 用户 ID
   */
  async getOnlineDevices(userId: string): Promise<Device[]> {
    return await Device.findAll({
      where: { userId, isOnline: true },
    });
  }

  /**
   * 获取可推送设备（有推送令牌的设备）
   * @param userId 用户 ID
   */
  async getPushableDevices(userId: string): Promise<Device[]> {
    const { Op } = await import("sequelize");
    return await Device.findAll({
      where: {
        userId,
        pushToken: { [Op.ne]: null },
        doNotDisturb: false,
      },
    });
  }
}

export default new IMDeviceService();
