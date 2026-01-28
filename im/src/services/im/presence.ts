/**
 * @packageDocumentation
 * @module services/im/presence
 * @description 在线状态服务
 * @path src/services/im/presence.ts
 */

import { Op } from "sequelize";
import { connectionManager } from "@/websocket/index.js";
import { redisAdapter } from "@/websocket/router/index.js";
import { Device, Friend, User } from "@/models/index.js";

/**
 * @interface OnlineStatus
 * @description 用户在线状态
 */
export interface OnlineStatus {
  userId: string;
  isOnline: boolean;
  lastOnlineAt: Date | null;
  onlineDeviceCount: number;
}

/**
 * @class PresenceService
 * @description 在线状态服务
 */
class PresenceService {
  /**
   * 检查单个用户是否在线
   * @param userId 用户 ID
   */
  async isUserOnline(userId: string): Promise<boolean> {
    // 先检查本地连接
    if (connectionManager.isUserOnline(userId)) {
      return true;
    }

    // 检查 Redis（跨实例）
    if (redisAdapter.isEnabled) {
      const devices = await redisAdapter.getOnlineDevices(userId);
      return devices.length > 0;
    }

    // 检查数据库中的设备在线状态
    const onlineDevice = await Device.findOne({
      where: { userId, isOnline: true },
    });

    return !!onlineDevice;
  }

  /**
   * 获取单个用户的在线状态
   * @param userId 用户 ID
   */
  async getUserOnlineStatus(userId: string): Promise<OnlineStatus> {
    const user = await User.findByPk(userId, {
      attributes: ["id", "lastOnlineAt"],
    });

    if (!user) {
      return {
        userId,
        isOnline: false,
        lastOnlineAt: null,
        onlineDeviceCount: 0,
      };
    }

    // 计算在线设备数
    let onlineDeviceCount = 0;

    // 本地连接
    const localDevices = connectionManager.getUserDeviceIds(userId);
    onlineDeviceCount += localDevices.length;

    // Redis（如果启用且本地没有连接）
    if (redisAdapter.isEnabled && onlineDeviceCount === 0) {
      const redisDevices = await redisAdapter.getOnlineDevices(userId);
      onlineDeviceCount = redisDevices.length;
    }

    // 如果 WebSocket 没有连接，检查数据库
    if (onlineDeviceCount === 0) {
      const dbOnlineCount = await Device.count({
        where: { userId, isOnline: true },
      });
      onlineDeviceCount = dbOnlineCount;
    }

    return {
      userId,
      isOnline: onlineDeviceCount > 0,
      lastOnlineAt: user.lastOnlineAt,
      onlineDeviceCount,
    };
  }

  /**
   * 批量获取用户在线状态
   * @param userIds 用户 ID 列表
   */
  async getUsersOnlineStatus(userIds: string[]): Promise<OnlineStatus[]> {
    if (userIds.length === 0) {
      return [];
    }

    const results: OnlineStatus[] = [];

    // 批量获取用户信息
    const users = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ["id", "lastOnlineAt"],
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    // 批量获取设备在线状态
    const onlineDevices = await Device.findAll({
      where: { userId: { [Op.in]: userIds }, isOnline: true },
      attributes: ["userId"],
    });

    // 统计每个用户的在线设备数
    const deviceCountMap = new Map<string, number>();
    for (const device of onlineDevices) {
      const count = deviceCountMap.get(device.userId) || 0;
      deviceCountMap.set(device.userId, count + 1);
    }

    // 补充本地 WebSocket 连接
    for (const userId of userIds) {
      const localCount = connectionManager.getUserDeviceIds(userId).length;
      if (localCount > 0) {
        const dbCount = deviceCountMap.get(userId) || 0;
        deviceCountMap.set(userId, Math.max(dbCount, localCount));
      }
    }

    // 构建结果
    for (const userId of userIds) {
      const user = userMap.get(userId);
      const onlineCount = deviceCountMap.get(userId) || 0;

      results.push({
        userId,
        isOnline: onlineCount > 0,
        lastOnlineAt: user?.lastOnlineAt || null,
        onlineDeviceCount: onlineCount,
      });
    }

    return results;
  }

  /**
   * 获取好友的在线状态
   * @param userId 当前用户 ID
   */
  async getFriendsOnlineStatus(userId: string): Promise<OnlineStatus[]> {
    // 获取好友列表
    const friends = await Friend.findAll({
      where: { userId },
      attributes: ["friendId"],
    });

    const friendIds = friends.map((f) => f.friendId);

    if (friendIds.length === 0) {
      return [];
    }

    return this.getUsersOnlineStatus(friendIds);
  }

  /**
   * 更新用户最后在线时间
   * @param userId 用户 ID
   */
  async updateLastOnline(userId: string): Promise<void> {
    await User.update(
      { lastOnlineAt: new Date() },
      { where: { id: userId } }
    );
  }
}

export default new PresenceService();
