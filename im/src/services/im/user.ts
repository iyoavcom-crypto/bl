/**
 * @packageDocumentation
 * @module services/im/user
 * @since 1.0.0
 * @author Z-kali
 * @description IM 用户服务：资料管理、搜索、密码修改等业务逻辑
 * @path src/services/im/user.ts
 */

import { Op } from "sequelize";
import { User, Friend, FriendRequest } from "@/models/index.js";
import { hashPassword, verifyPassword } from "@/tools/crypto/password.js";
import { encryptPin, decryptPin } from "@/tools/crypto/pin.js";
import { env } from "@/config/index.js";
import type { UserLocation, UserAttributes } from "@/models/user/types/index.js";

/**
 * @interface UpdateProfileInput
 * @description 更新资料输入
 */
export interface UpdateProfileInput {
  name?: string;
  avatar?: string;
  gender?: "male" | "female" | "unknown";
  location?: UserLocation | null;
  searchable?: boolean;
}

/**
 * @interface ChangePasswordInput
 * @description 修改密码输入
 */
export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

/**
 * @interface ChangePinInput
 * @description 修改 PIN 输入
 */
export interface ChangePinInput {
  password: string;
  newPin: string;
}

/**
 * @interface SearchUserQuery
 * @description 搜索用户参数
 */
export interface SearchUserQuery {
  keyword: string;
  limit?: number;
}

/**
 * @interface SearchUserResult
 * @description 搜索用户结果
 */
export interface SearchUserResult {
  id: string;
  name: string;
  avatar: string | null;
  gender: "male" | "female" | "unknown";
  isFriend: boolean;
  hasPendingRequest: boolean;
}

/**
 * @interface UserPublicInfo
 * @description 用户公开信息（不含好友关系）
 */
export interface UserPublicInfo {
  id: string;
  name: string;
  avatar: string | null;
  gender: "male" | "female" | "unknown";
}

/**
 * @class IMUserService
 * @description IM 用户业务服务
 */
class IMUserService {
  /**
   * 获取用户资料
   * @param userId 用户 ID
   */
  async getProfile(userId: string): Promise<Omit<UserAttributes, "password" | "pin">> {
    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error("用户不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }
    return user.toJSON();
  }

  /**
   * 更新用户资料
   * @param userId 用户 ID
   * @param input 更新数据
   */
  async updateProfile(userId: string, input: UpdateProfileInput): Promise<Omit<UserAttributes, "password" | "pin">> {
    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error("用户不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 昵称校验
    if (input.name !== undefined) {
      if (input.name && input.name.length > 20) {
        const error = new Error("昵称不能超过20个字符") as Error & { status?: number };
        error.status = 400;
        throw error;
      }
    }

    // 更新字段
    const updateData: Partial<UpdateProfileInput> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.avatar !== undefined) updateData.avatar = input.avatar;
    if (input.gender !== undefined) updateData.gender = input.gender;
    if (input.location !== undefined) updateData.location = input.location;
    if (input.searchable !== undefined) updateData.searchable = input.searchable;

    await user.update(updateData);
    return user.toJSON();
  }

  /**
   * 修改密码
   * @param userId 用户 ID
   * @param input 修改密码数据
   */
  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const { oldPassword, newPassword } = input;

    // 获取用户（包含密码）
    const user = await User.scope("withSecret").findByPk(userId);
    if (!user) {
      const error = new Error("用户不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 验证旧密码
    const isValid = await verifyPassword(oldPassword, user.password);
    if (!isValid) {
      const error = new Error("原密码错误") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    // 密码强度校验
    if (newPassword.length < 6) {
      const error = new Error("新密码长度不能少于6位") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    // 更新密码（hash 在 beforeSave 钩子中处理）
    const hashedPassword = await hashPassword(newPassword);
    await User.update(
      { password: hashedPassword },
      { where: { id: userId }, hooks: false }
    );
  }

  /**
   * 修改 PIN（二级密码）
   * @param userId 用户 ID
   * @param input 修改 PIN 数据
   */
  async changePin(userId: string, input: ChangePinInput): Promise<void> {
    const { password, newPin } = input;

    // 获取用户（包含密码）
    const user = await User.scope("withSecret").findByPk(userId);
    if (!user) {
      const error = new Error("用户不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      const error = new Error("密码错误") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    // PIN 格式校验（6位数字）
    if (!/^\d{6}$/.test(newPin)) {
      const error = new Error("二级密码必须是6位数字") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    // 更新 PIN（加密存储）
    const encryptedPin = await encryptPin(newPin, env.PIN_SECRET);
    await User.update(
      { pin: encryptedPin },
      { where: { id: userId }, hooks: false }
    );
  }

  /**
   * 验证 PIN
   * @param userId 用户 ID
   * @param pin PIN 码
   */
  async verifyUserPin(userId: string, pin: string): Promise<boolean> {
    const user = await User.scope("withSecret").findByPk(userId);
    if (!user) {
      const error = new Error("用户不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    try {
      const storedPin = await decryptPin(user.pin, env.PIN_SECRET);
      return storedPin === pin;
    } catch {
      return false;
    }
  }

  /**
   * 搜索用户（精准匹配）
   * @param userId 当前用户 ID（排除自己）
   * @param query 搜索参数
   */
  async searchUsers(userId: string, query: SearchUserQuery): Promise<SearchUserResult[]> {
    const { keyword, limit = 20 } = query;

    if (!keyword || keyword.trim().length === 0) {
      return [];
    }

    const trimmedKeyword = keyword.trim();

    // 搜索条件：手机号或ID精确匹配
    // 只搜索 searchable=true 的用户，排除自己
    const users = await User.findAll({
      where: {
        id: { [Op.ne]: userId },
        searchable: true,
        [Op.or]: [
          { id: trimmedKeyword },    // ID 精确匹配
          { phone: trimmedKeyword }, // 手机号精确匹配
        ],
      },
      attributes: ["id", "name", "avatar", "gender"],
      limit: Math.min(limit, 50),
    });

    if (users.length === 0) {
      return [];
    }

    const targetUserIds = users.map((u) => u.id);

    // 批量查询好友关系
    const friendships = await Friend.findAll({
      where: {
        userId,
        friendId: { [Op.in]: targetUserIds },
      },
      attributes: ["friendId"],
    });
    const friendIdSet = new Set(friendships.map((f) => f.friendId));

    // 批量查询待处理的好友申请（双向：我发的 或 对方发的）
    const pendingRequests = await FriendRequest.findAll({
      where: {
        status: "pending",
        [Op.or]: [
          { fromUserId: userId, toUserId: { [Op.in]: targetUserIds } },
          { fromUserId: { [Op.in]: targetUserIds }, toUserId: userId },
        ],
      },
      attributes: ["fromUserId", "toUserId"],
    });
    const pendingUserIdSet = new Set<string>();
    for (const req of pendingRequests) {
      if (req.fromUserId === userId) {
        pendingUserIdSet.add(req.toUserId);
      } else {
        pendingUserIdSet.add(req.fromUserId);
      }
    }

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      gender: u.gender,
      isFriend: friendIdSet.has(u.id),
      hasPendingRequest: pendingUserIdSet.has(u.id),
    }));
  }

  /**
   * 根据 ID 获取用户公开信息
   * @param targetUserId 目标用户 ID
   */
  async getPublicProfile(targetUserId: string): Promise<UserPublicInfo | null> {
    const user = await User.findByPk(targetUserId, {
      attributes: ["id", "name", "avatar", "gender"],
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      gender: user.gender,
    };
  }

  /**
   * 批量获取用户公开信息
   * @param userIds 用户 ID 列表
   */
  async getPublicProfiles(userIds: string[]): Promise<UserPublicInfo[]> {
    if (userIds.length === 0) {
      return [];
    }

    const users = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ["id", "name", "avatar", "gender"],
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      gender: u.gender,
    }));
  }
}

export default new IMUserService();
