/**
 * @packageDocumentation
 * @module websocket/integration/group
 * @description 群组推送集成钩子
 */

import { messageRouter } from "../router/index.js";
import {
  createGroupInvitedEvent,
  createGroupKickedEvent,
  createGroupMemberJoinedEvent,
  createGroupMemberLeftEvent,
  createGroupUpdatedEvent,
  createGroupMutedEvent,
  createGroupUnmutedEvent,
  createGroupDissolvedEvent,
  type GroupUpdatedPayload,
} from "../events/index.js";
import { connectionManager } from "../connection/index.js";
import ExpoPushService from "@/services/push/expo.js";
import { GroupMember } from "@/models/index.js";

/**
 * @interface GroupInviteData
 * @description 群组邀请数据
 */
interface GroupInviteData {
  groupId: string;
  groupName: string;
  groupAvatar: string | null;
  inviter: {
    id: string;
    name: string;
    avatar: string | null;
    gender: "male" | "female" | "unknown";
  };
}

/**
 * @interface GroupMemberInfo
 * @description 群成员信息
 */
interface GroupMemberInfo {
  id: string;
  name: string;
  avatar: string | null;
  gender: "male" | "female" | "unknown";
}

/**
 * @class GroupPushHook
 * @description 群组推送钩子
 */
class GroupPushHook {
  /**
   * @method onGroupInvited
   * @description 被邀请入群通知推送
   */
  async onGroupInvited(
    targetUserId: string,
    data: GroupInviteData
  ): Promise<void> {
    const event = createGroupInvitedEvent(
      data.groupId,
      data.groupName,
      data.groupAvatar,
      data.inviter
    );

    // WebSocket 在线推送
    await messageRouter.sendToUser(targetUserId, event);

    // 如果用户离线，发送离线推送
    if (!connectionManager.isUserOnline(targetUserId)) {
      await this.sendGroupInvitePush(targetUserId, data);
    }
  }

  /**
   * @method sendGroupInvitePush
   * @description 发送入群邀请离线推送
   */
  private async sendGroupInvitePush(
    targetUserId: string,
    data: GroupInviteData
  ): Promise<void> {
    try {
      await ExpoPushService.sendGroupInvitePush(
        targetUserId,
        data.groupName,
        data.inviter.name,
        data.groupId
      );
    } catch (err) {
      console.error("[GroupPushHook] 入群邀请离线推送失败:", err);
    }
  }

  /**
   * @method onGroupKicked
   * @description 被踢出群通知推送
   */
  async onGroupKicked(
    targetUserId: string,
    groupId: string,
    groupName: string,
    operatorId: string
  ): Promise<void> {
    const event = createGroupKickedEvent(groupId, groupName, operatorId);

    // WebSocket 在线推送
    await messageRouter.sendToUser(targetUserId, event);

    // 如果用户离线，发送离线推送
    if (!connectionManager.isUserOnline(targetUserId)) {
      try {
        await ExpoPushService.sendToUser(targetUserId, {
          title: "已被移出群组",
          body: `你已被移出群组「${groupName}」`,
          data: {
            type: "group_kicked",
            groupId,
          },
          channelId: "social",
        });
      } catch (err) {
        console.error("[GroupPushHook] 被踢离线推送失败:", err);
      }
    }
  }

  /**
   * @method onMemberJoined
   * @description 成员入群通知推送（推送给群内其他成员）
   */
  async onMemberJoined(
    groupId: string,
    newMember: GroupMemberInfo,
    inviterId: string | null
  ): Promise<void> {
    const event = createGroupMemberJoinedEvent(groupId, newMember, inviterId);

    // 获取群内所有成员（排除新加入的成员）
    const memberIds = await this.getGroupMemberIds(groupId, [newMember.id]);

    // WebSocket 在线推送给群内所有成员
    await messageRouter.sendToUsers(memberIds, event);
  }

  /**
   * @method onMemberLeft
   * @description 成员退群通知推送（推送给群内其他成员）
   */
  async onMemberLeft(groupId: string, userId: string): Promise<void> {
    const event = createGroupMemberLeftEvent(groupId, userId);

    // 获取群内所有成员（排除退出的成员）
    const memberIds = await this.getGroupMemberIds(groupId, [userId]);

    // WebSocket 在线推送给群内所有成员
    await messageRouter.sendToUsers(memberIds, event);
  }

  /**
   * @method onGroupUpdated
   * @description 群信息更新通知推送（推送给群内所有成员）
   */
  async onGroupUpdated(
    groupId: string,
    changes: GroupUpdatedPayload["changes"],
    operatorId: string
  ): Promise<void> {
    const event = createGroupUpdatedEvent(groupId, changes, operatorId);

    // 获取群内所有成员
    const memberIds = await this.getGroupMemberIds(groupId);

    // WebSocket 在线推送给群内所有成员
    await messageRouter.sendToUsers(memberIds, event);
  }

  /**
   * @method onMemberMuted
   * @description 成员被禁言通知推送
   */
  async onMemberMuted(
    targetUserId: string,
    groupId: string,
    groupName: string,
    operatorId: string,
    duration: number | null,
    muteEndAt: string | null
  ): Promise<void> {
    const event = createGroupMutedEvent(
      groupId,
      groupName,
      operatorId,
      duration,
      muteEndAt
    );

    // WebSocket 在线推送
    await messageRouter.sendToUser(targetUserId, event);

    // 如果用户离线，发送离线推送
    if (!connectionManager.isUserOnline(targetUserId)) {
      const durationText = duration ? `${Math.floor(duration / 60)} 分钟` : "永久";
      try {
        await ExpoPushService.sendToUser(targetUserId, {
          title: "群组禁言",
          body: `你在群组「${groupName}」被禁言 ${durationText}`,
          data: {
            type: "group_muted",
            groupId,
            duration,
          },
          channelId: "social",
        });
      } catch (err) {
        console.error("[GroupPushHook] 禁言离线推送失败:", err);
      }
    }
  }

  /**
   * @method onMemberUnmuted
   * @description 成员被解禁通知推送
   */
  async onMemberUnmuted(
    targetUserId: string,
    groupId: string,
    groupName: string,
    operatorId: string
  ): Promise<void> {
    const event = createGroupUnmutedEvent(groupId, groupName, operatorId);

    // WebSocket 在线推送
    await messageRouter.sendToUser(targetUserId, event);
  }

  /**
   * @method onGroupDissolved
   * @description 群组解散通知推送（推送给所有成员）
   */
  async onGroupDissolved(
    memberIds: string[],
    groupId: string,
    groupName: string
  ): Promise<void> {
    const event = createGroupDissolvedEvent(groupId, groupName);

    // WebSocket 在线推送给所有成员
    await messageRouter.sendToUsers(memberIds, event);

    // 给离线用户发送推送
    const offlineUserIds = memberIds.filter(
      (id) => !connectionManager.isUserOnline(id)
    );

    if (offlineUserIds.length > 0) {
      try {
        await ExpoPushService.sendToUsers(offlineUserIds, {
          title: "群组已解散",
          body: `群组「${groupName}」已被解散`,
          data: {
            type: "group_dissolved",
            groupId,
          },
          channelId: "social",
        });
      } catch (err) {
        console.error("[GroupPushHook] 群解散离线推送失败:", err);
      }
    }
  }

  /**
   * @method getGroupMemberIds
   * @description 获取群成员 ID 列表
   */
  private async getGroupMemberIds(
    groupId: string,
    excludeUserIds: string[] = []
  ): Promise<string[]> {
    const members = await GroupMember.findAll({
      where: { groupId },
      attributes: ["userId"],
    });

    const excludeSet = new Set(excludeUserIds);
    return members
      .map((m) => m.userId)
      .filter((id) => !excludeSet.has(id));
  }
}

export const groupPushHook = new GroupPushHook();
export type { GroupPushHook, GroupInviteData, GroupMemberInfo };
