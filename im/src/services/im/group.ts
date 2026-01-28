/**
 * @packageDocumentation
 * @module services/im/group
 * @since 1.0.0
 * @author Z-kali
 * @description IM 群组服务：创建、邀请、踢人、禁言、转让、解散等业务逻辑
 * @path src/services/im/group.ts
 */

import { Op, Transaction } from "sequelize";
import { sequelize } from "@/config/index.js";
import { Group, GroupMember, User } from "@/models/index.js";
import { GroupMemberRole } from "@/models/group-member/index.js";
import type { GroupJoinMode } from "@/models/group/index.js";
import { groupPushHook } from "@/websocket/integration/index.js";

/** 群组最大成员数 */
const MAX_GROUP_MEMBERS = 500;

/**
 * @interface CreateGroupInput
 * @description 创建群组输入
 */
export interface CreateGroupInput {
  name: string;
  avatar?: string;
  description?: string;
  joinMode?: GroupJoinMode;
  memberIds?: string[];
}

/**
 * @interface UpdateGroupInput
 * @description 更新群组输入
 */
export interface UpdateGroupInput {
  name?: string;
  avatar?: string;
  description?: string;
  joinMode?: GroupJoinMode;
  muteAll?: boolean;
}

/**
 * @interface MuteMemberInput
 * @description 禁言成员输入
 */
export interface MuteMemberInput {
  duration?: number; // 禁言时长（秒），不传或为 0 表示永久禁言
}

/**
 * @class IMGroupService
 * @description IM 群组业务服务
 */
class IMGroupService {
  /**
   * 创建群组
   * @param ownerId 群主用户 ID
   * @param input 创建参数
   */
  async createGroup(ownerId: string, input: CreateGroupInput): Promise<Group> {
    const { name, avatar, description, joinMode = "open", memberIds = [] } = input;

    // 验证群名
    if (!name || name.trim().length === 0) {
      const error = new Error("群名称不能为空") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    // 过滤掉群主自己，并去重
    const validMemberIds = [...new Set(memberIds)].filter((id) => id !== ownerId);

    // 验证邀请的用户是否存在
    if (validMemberIds.length > 0) {
      const users = await User.findAll({
        where: { id: { [Op.in]: validMemberIds } },
        attributes: ["id"],
      });
      if (users.length !== validMemberIds.length) {
        const error = new Error("部分用户不存在") as Error & { status?: number };
        error.status = 400;
        throw error;
      }
    }

    // 检查初始成员数量
    if (validMemberIds.length + 1 > MAX_GROUP_MEMBERS) {
      const error = new Error(`群成员数量不能超过 ${MAX_GROUP_MEMBERS}`) as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    // 事务创建群组和成员
    const group = await sequelize.transaction(async (t: Transaction) => {
      // 创建群组
      const newGroup = await Group.create(
        {
          name: name.trim(),
          avatar: avatar || null,
          description: description || null,
          ownerId,
          joinMode,
          maxMembers: MAX_GROUP_MEMBERS,
          memberCount: 1 + validMemberIds.length,
        },
        { transaction: t }
      );

      // 添加群主
      await GroupMember.create(
        {
          groupId: newGroup.id,
          userId: ownerId,
          role: GroupMemberRole.OWNER,
        },
        { transaction: t }
      );

      // 添加初始成员
      if (validMemberIds.length > 0) {
        await GroupMember.bulkCreate(
          validMemberIds.map((userId) => ({
            groupId: newGroup.id,
            userId,
            role: GroupMemberRole.MEMBER,
          })),
          { transaction: t }
        );
      }

      return newGroup;
    });

    // 获取群主信息用于推送
    const owner = await User.findByPk(ownerId, {
      attributes: ["id", "name", "avatar", "gender"],
    });

    // 给被邀请的成员发送入群通知
    if (validMemberIds.length > 0 && owner) {
      const inviteData = {
        groupId: group.id,
        groupName: group.name,
        groupAvatar: group.avatar,
        inviter: {
          id: owner.id,
          name: owner.name || "",
          avatar: owner.avatar,
          gender: owner.gender,
        },
      };

      for (const userId of validMemberIds) {
        await groupPushHook.onGroupInvited(userId, inviteData).catch((err) => {
          console.error("[IMGroupService] 发送入群邀请通知失败:", err);
        });
      }
    }

    return group;
  }

  /**
   * 邀请成员加入群组
   * @param operatorId 操作者用户 ID
   * @param groupId 群组 ID
   * @param userIds 被邀请的用户 ID 列表
   */
  async inviteMembers(operatorId: string, groupId: string, userIds: string[]): Promise<GroupMember[]> {
    const group = await this.getGroupWithPermissionCheck(groupId, operatorId, ["owner", "admin"]);

    // 去重
    const uniqueUserIds = [...new Set(userIds)];

    // 验证用户是否存在
    const users = await User.findAll({
      where: { id: { [Op.in]: uniqueUserIds } },
      attributes: ["id"],
    });
    if (users.length !== uniqueUserIds.length) {
      const error = new Error("部分用户不存在") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    // 检查是否已经是群成员
    const existingMembers = await GroupMember.findAll({
      where: { groupId, userId: { [Op.in]: uniqueUserIds } },
      attributes: ["userId"],
    });
    const existingIds = new Set(existingMembers.map((m) => m.userId));
    const newUserIds = uniqueUserIds.filter((id) => !existingIds.has(id));

    if (newUserIds.length === 0) {
      const error = new Error("所有用户都已是群成员") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    // 检查成员数量限制
    if (group.memberCount + newUserIds.length > group.maxMembers) {
      const error = new Error(`群成员数量超过上限 ${group.maxMembers}`) as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    // 事务添加成员
    const members = await sequelize.transaction(async (t: Transaction) => {
      const newMembers = await GroupMember.bulkCreate(
        newUserIds.map((userId) => ({
          groupId,
          userId,
          role: GroupMemberRole.MEMBER,
        })),
        { transaction: t }
      );

      await group.increment("memberCount", { by: newUserIds.length, transaction: t });
      return newMembers;
    });

    // 获取邀请者和新成员信息用于推送
    const [inviter, newUsers] = await Promise.all([
      User.findByPk(operatorId, { attributes: ["id", "name", "avatar", "gender"] }),
      User.findAll({
        where: { id: { [Op.in]: newUserIds } },
        attributes: ["id", "name", "avatar", "gender"],
      }),
    ]);

    // 给被邀请的成员发送入群通知
    if (inviter) {
      const inviteData = {
        groupId,
        groupName: group.name,
        groupAvatar: group.avatar,
        inviter: {
          id: inviter.id,
          name: inviter.name || "",
          avatar: inviter.avatar,
          gender: inviter.gender,
        },
      };

      for (const userId of newUserIds) {
        await groupPushHook.onGroupInvited(userId, inviteData).catch((err) => {
          console.error("[IMGroupService] 发送入群邀请通知失败:", err);
        });
      }
    }

    // 给群内其他成员发送新成员入群通知
    for (const newUser of newUsers) {
      await groupPushHook.onMemberJoined(
        groupId,
        {
          id: newUser.id,
          name: newUser.name || "",
          avatar: newUser.avatar,
          gender: newUser.gender,
        },
        operatorId
      ).catch((err) => {
        console.error("[IMGroupService] 发送成员入群通知失败:", err);
      });
    }

    return members;
  }

  /**
   * 踢出成员
   * @param operatorId 操作者用户 ID
   * @param groupId 群组 ID
   * @param targetUserId 被踢的用户 ID
   */
  async kickMember(operatorId: string, groupId: string, targetUserId: string): Promise<void> {
    const group = await this.getGroupWithPermissionCheck(groupId, operatorId, ["owner", "admin"]);

    // 不能踢自己
    if (operatorId === targetUserId) {
      const error = new Error("不能踢出自己") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    // 不能踢群主
    if (group.ownerId === targetUserId) {
      const error = new Error("不能踢出群主") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    // 查找目标成员
    const targetMember = await GroupMember.findOne({
      where: { groupId, userId: targetUserId },
    });
    if (!targetMember) {
      const error = new Error("该用户不是群成员") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 管理员不能踢管理员
    const operatorMember = await GroupMember.findOne({
      where: { groupId, userId: operatorId },
    });
    if (operatorMember?.role === GroupMemberRole.ADMIN && targetMember.role === GroupMemberRole.ADMIN) {
      const error = new Error("管理员不能踢出其他管理员") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    // 事务删除成员
    await sequelize.transaction(async (t: Transaction) => {
      await targetMember.destroy({ transaction: t });
      await group.decrement("memberCount", { by: 1, transaction: t });
    });

    // 发送被踢出群通知
    await groupPushHook.onGroupKicked(targetUserId, groupId, group.name, operatorId).catch((err) => {
      console.error("[IMGroupService] 发送被踢通知失败:", err);
    });
  }

  /**
   * 退出群组
   * @param userId 用户 ID
   * @param groupId 群组 ID
   */
  async leaveGroup(userId: string, groupId: string): Promise<void> {
    const group = await Group.findByPk(groupId);
    if (!group) {
      const error = new Error("群组不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 群主不能直接退出，需要先转让
    if (group.ownerId === userId) {
      const error = new Error("群主不能直接退出，请先转让群主") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    const member = await GroupMember.findOne({
      where: { groupId, userId },
    });
    if (!member) {
      const error = new Error("你不是该群成员") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    await sequelize.transaction(async (t: Transaction) => {
      await member.destroy({ transaction: t });
      await group.decrement("memberCount", { by: 1, transaction: t });
    });

    // 发送成员退群通知给群内其他成员
    await groupPushHook.onMemberLeft(groupId, userId).catch((err) => {
      console.error("[IMGroupService] 发送退群通知失败:", err);
    });
  }

  /**
   * 转让群主
   * @param ownerId 当前群主用户 ID
   * @param groupId 群组 ID
   * @param newOwnerId 新群主用户 ID
   */
  async transferOwnership(ownerId: string, groupId: string, newOwnerId: string): Promise<void> {
    const group = await Group.findByPk(groupId);
    if (!group) {
      const error = new Error("群组不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    if (group.ownerId !== ownerId) {
      const error = new Error("只有群主可以转让群") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    if (ownerId === newOwnerId) {
      const error = new Error("不能转让给自己") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    const newOwnerMember = await GroupMember.findOne({
      where: { groupId, userId: newOwnerId },
    });
    if (!newOwnerMember) {
      const error = new Error("目标用户不是群成员") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    await sequelize.transaction(async (t: Transaction) => {
      // 更新群主
      await group.update({ ownerId: newOwnerId }, { transaction: t });

      // 更新原群主角色为普通成员
      await GroupMember.update(
        { role: GroupMemberRole.MEMBER },
        { where: { groupId, userId: ownerId }, transaction: t }
      );

      // 更新新群主角色
      await newOwnerMember.update({ role: GroupMemberRole.OWNER }, { transaction: t });
    });
  }

  /**
   * 设置/取消管理员
   * @param ownerId 群主用户 ID
   * @param groupId 群组 ID
   * @param targetUserId 目标用户 ID
   * @param isAdmin 是否设置为管理员
   */
  async setAdmin(ownerId: string, groupId: string, targetUserId: string, isAdmin: boolean): Promise<void> {
    const group = await Group.findByPk(groupId);
    if (!group) {
      const error = new Error("群组不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    if (group.ownerId !== ownerId) {
      const error = new Error("只有群主可以设置管理员") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    if (ownerId === targetUserId) {
      const error = new Error("不能操作群主自己") as Error & { status?: number };
      error.status = 400;
      throw error;
    }

    const member = await GroupMember.findOne({
      where: { groupId, userId: targetUserId },
    });
    if (!member) {
      const error = new Error("目标用户不是群成员") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    await member.update({
      role: isAdmin ? GroupMemberRole.ADMIN : GroupMemberRole.MEMBER,
    });
  }

  /**
   * 禁言成员
   * @param operatorId 操作者用户 ID
   * @param groupId 群组 ID
   * @param targetUserId 目标用户 ID
   * @param input 禁言参数
   */
  async muteMember(
    operatorId: string,
    groupId: string,
    targetUserId: string,
    input: MuteMemberInput
  ): Promise<void> {
    await this.getGroupWithPermissionCheck(groupId, operatorId, ["owner", "admin"]);

    const member = await GroupMember.findOne({
      where: { groupId, userId: targetUserId },
    });
    if (!member) {
      const error = new Error("目标用户不是群成员") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 不能禁言群主
    if (member.role === GroupMemberRole.OWNER) {
      const error = new Error("不能禁言群主") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    // 管理员不能禁言管理员
    const operatorMember = await GroupMember.findOne({
      where: { groupId, userId: operatorId },
    });
    if (operatorMember?.role === GroupMemberRole.ADMIN && member.role === GroupMemberRole.ADMIN) {
      const error = new Error("管理员不能禁言其他管理员") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    const { duration } = input;
    const muteUntil = duration && duration > 0 ? new Date(Date.now() + duration * 1000) : null;

    await member.update({ isMuted: true, muteUntil });

    // 获取群组信息用于推送
    const group = await Group.findByPk(groupId, { attributes: ["name"] });

    // 发送被禁言通知
    if (group) {
      await groupPushHook.onMemberMuted(
        targetUserId,
        groupId,
        group.name,
        operatorId,
        duration || null,
        muteUntil ? muteUntil.toISOString() : null
      ).catch((err) => {
        console.error("[IMGroupService] 发送禁言通知失败:", err);
      });
    }
  }

  /**
   * 解除禁言
   * @param operatorId 操作者用户 ID
   * @param groupId 群组 ID
   * @param targetUserId 目标用户 ID
   */
  async unmuteMember(operatorId: string, groupId: string, targetUserId: string): Promise<void> {
    await this.getGroupWithPermissionCheck(groupId, operatorId, ["owner", "admin"]);

    const member = await GroupMember.findOne({
      where: { groupId, userId: targetUserId },
    });
    if (!member) {
      const error = new Error("目标用户不是群成员") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    await member.update({ isMuted: false, muteUntil: null });

    // 获取群组信息用于推送
    const group = await Group.findByPk(groupId, { attributes: ["name"] });

    // 发送被解禁通知
    if (group) {
      await groupPushHook.onMemberUnmuted(targetUserId, groupId, group.name, operatorId).catch((err) => {
        console.error("[IMGroupService] 发送解禁通知失败:", err);
      });
    }
  }

  /**
   * 更新群信息
   * @param operatorId 操作者用户 ID
   * @param groupId 群组 ID
   * @param input 更新数据
   */
  async updateGroup(operatorId: string, groupId: string, input: UpdateGroupInput): Promise<Group> {
    const group = await this.getGroupWithPermissionCheck(groupId, operatorId, ["owner", "admin"]);
    await group.update(input);

    // 发送群信息更新通知
    const changes: Record<string, unknown> = {};
    if (input.name !== undefined) changes.name = input.name;
    if (input.avatar !== undefined) changes.avatar = input.avatar;
    if (input.description !== undefined) changes.description = input.description;
    if (input.muteAll !== undefined) changes.muteAll = input.muteAll;

    if (Object.keys(changes).length > 0) {
      await groupPushHook.onGroupUpdated(groupId, changes, operatorId).catch((err) => {
        console.error("[IMGroupService] 发送群信息更新通知失败:", err);
      });
    }

    return group;
  }

  /**
   * 解散群组
   * @param ownerId 群主用户 ID
   * @param groupId 群组 ID
   */
  async dissolveGroup(ownerId: string, groupId: string): Promise<void> {
    const group = await Group.findByPk(groupId);
    if (!group) {
      const error = new Error("群组不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    if (group.ownerId !== ownerId) {
      const error = new Error("只有群主可以解散群组") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    // 获取所有成员 ID 用于推送
    const members = await GroupMember.findAll({
      where: { groupId },
      attributes: ["userId"],
    });
    const memberIds = members.map((m) => m.userId).filter((id) => id !== ownerId);
    const groupName = group.name;

    await sequelize.transaction(async (t: Transaction) => {
      // 删除所有成员
      await GroupMember.destroy({ where: { groupId }, transaction: t });
      // 删除群组
      await group.destroy({ transaction: t });
    });

    // 发送群组解散通知给所有成员（排除群主）
    if (memberIds.length > 0) {
      await groupPushHook.onGroupDissolved(memberIds, groupId, groupName).catch((err) => {
        console.error("[IMGroupService] 发送群解散通知失败:", err);
      });
    }
  }

  /**
   * 获取我加入的群组列表
   * @param userId 用户 ID
   */
  async getMyGroups(userId: string): Promise<Group[]> {
    const members = await GroupMember.findAll({
      where: { userId },
      attributes: ["groupId"],
    });

    const groupIds = members.map((m) => m.groupId);
    if (groupIds.length === 0) return [];

    return await Group.findAll({
      where: { id: { [Op.in]: groupIds } },
      order: [["createdAt", "DESC"]],
    });
  }

  /**
   * 获取群组详情
   * @param userId 用户 ID
   * @param groupId 群组 ID
   */
  async getGroupDetail(userId: string, groupId: string): Promise<Group> {
    const group = await Group.findByPk(groupId);
    if (!group) {
      const error = new Error("群组不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    // 检查是否是群成员
    const member = await GroupMember.findOne({
      where: { groupId, userId },
    });
    if (!member) {
      const error = new Error("你不是该群成员") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    return group;
  }

  /**
   * 获取群成员列表
   * @param userId 用户 ID
   * @param groupId 群组 ID
   */
  async getGroupMembers(userId: string, groupId: string): Promise<GroupMember[]> {
    // 检查是否是群成员
    const isMember = await GroupMember.findOne({
      where: { groupId, userId },
    });
    if (!isMember) {
      const error = new Error("你不是该群成员") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    return await GroupMember.findAll({
      where: { groupId },
      order: [
        ["role", "ASC"], // owner -> admin -> member
        ["joinedAt", "ASC"],
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "avatar", "lastOnlineAt"],
        },
      ],
    });
  }

  /**
   * 检查群组权限
   */
  private async getGroupWithPermissionCheck(
    groupId: string,
    userId: string,
    allowedRoles: string[]
  ): Promise<Group> {
    const group = await Group.findByPk(groupId);
    if (!group) {
      const error = new Error("群组不存在") as Error & { status?: number };
      error.status = 404;
      throw error;
    }

    const member = await GroupMember.findOne({
      where: { groupId, userId },
    });
    if (!member) {
      const error = new Error("你不是该群成员") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    if (!allowedRoles.includes(member.role)) {
      const error = new Error("权限不足") as Error & { status?: number };
      error.status = 403;
      throw error;
    }

    return group;
  }
}

export default new IMGroupService();
