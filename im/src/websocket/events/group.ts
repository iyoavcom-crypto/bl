/**
 * @packageDocumentation
 * @module websocket/events/group
 * @description 群组相关 WebSocket 事件
 */

import { WsEventType, createWsEvent, type WsEvent } from "./types.js";

/**
 * @interface GroupInvitedPayload
 * @description 被邀请入群事件载荷
 */
export interface GroupInvitedPayload {
  groupId: string;
  groupName: string;
  groupAvatar: string | null;
  inviter: {
    id: string;
    name: string;
    avatar: string | null;
    gender: "male" | "female" | "unknown";
  };
  invitedAt: number;
}

/**
 * @interface GroupKickedPayload
 * @description 被踢出群事件载荷
 */
export interface GroupKickedPayload {
  groupId: string;
  groupName: string;
  operatorId: string;
  kickedAt: number;
}

/**
 * @interface GroupMemberJoinedPayload
 * @description 成员入群事件载荷
 */
export interface GroupMemberJoinedPayload {
  groupId: string;
  member: {
    id: string;
    name: string;
    avatar: string | null;
    gender: "male" | "female" | "unknown";
  };
  inviterId: string | null;
  joinedAt: number;
}

/**
 * @interface GroupMemberLeftPayload
 * @description 成员退群事件载荷
 */
export interface GroupMemberLeftPayload {
  groupId: string;
  userId: string;
  leftAt: number;
}

/**
 * @interface GroupUpdatedPayload
 * @description 群信息更新事件载荷
 */
export interface GroupUpdatedPayload {
  groupId: string;
  changes: {
    name?: string;
    avatar?: string | null;
    description?: string | null;
    announcement?: string | null;
    muteAll?: boolean;
  };
  operatorId: string;
  updatedAt: number;
}

/**
 * @interface GroupMutedPayload
 * @description 被禁言事件载荷
 */
export interface GroupMutedPayload {
  groupId: string;
  groupName: string;
  operatorId: string;
  duration: number | null;
  muteEndAt: string | null;
  mutedAt: number;
}

/**
 * @interface GroupUnmutedPayload
 * @description 被解禁事件载荷
 */
export interface GroupUnmutedPayload {
  groupId: string;
  groupName: string;
  operatorId: string;
  unmutedAt: number;
}

/**
 * @interface GroupDissolvedPayload
 * @description 群组解散事件载荷
 */
export interface GroupDissolvedPayload {
  groupId: string;
  groupName: string;
  dissolvedAt: number;
}

/**
 * @function createGroupInvitedEvent
 * @description 创建被邀请入群事件
 */
export function createGroupInvitedEvent(
  groupId: string,
  groupName: string,
  groupAvatar: string | null,
  inviter: { id: string; name: string; avatar: string | null; gender: "male" | "female" | "unknown" }
): WsEvent<GroupInvitedPayload> {
  return createWsEvent(WsEventType.GROUP_INVITED, {
    groupId,
    groupName,
    groupAvatar,
    inviter,
    invitedAt: Date.now(),
  });
}

/**
 * @function createGroupKickedEvent
 * @description 创建被踢出群事件
 */
export function createGroupKickedEvent(
  groupId: string,
  groupName: string,
  operatorId: string
): WsEvent<GroupKickedPayload> {
  return createWsEvent(WsEventType.GROUP_KICKED, {
    groupId,
    groupName,
    operatorId,
    kickedAt: Date.now(),
  });
}

/**
 * @function createGroupMemberJoinedEvent
 * @description 创建成员入群事件
 */
export function createGroupMemberJoinedEvent(
  groupId: string,
  member: { id: string; name: string; avatar: string | null; gender: "male" | "female" | "unknown" },
  inviterId: string | null
): WsEvent<GroupMemberJoinedPayload> {
  return createWsEvent(WsEventType.GROUP_MEMBER_JOINED, {
    groupId,
    member,
    inviterId,
    joinedAt: Date.now(),
  });
}

/**
 * @function createGroupMemberLeftEvent
 * @description 创建成员退群事件
 */
export function createGroupMemberLeftEvent(
  groupId: string,
  userId: string
): WsEvent<GroupMemberLeftPayload> {
  return createWsEvent(WsEventType.GROUP_MEMBER_LEFT, {
    groupId,
    userId,
    leftAt: Date.now(),
  });
}

/**
 * @function createGroupUpdatedEvent
 * @description 创建群信息更新事件
 */
export function createGroupUpdatedEvent(
  groupId: string,
  changes: GroupUpdatedPayload["changes"],
  operatorId: string
): WsEvent<GroupUpdatedPayload> {
  return createWsEvent(WsEventType.GROUP_UPDATED, {
    groupId,
    changes,
    operatorId,
    updatedAt: Date.now(),
  });
}

/**
 * @function createGroupMutedEvent
 * @description 创建被禁言事件
 */
export function createGroupMutedEvent(
  groupId: string,
  groupName: string,
  operatorId: string,
  duration: number | null,
  muteEndAt: string | null
): WsEvent<GroupMutedPayload> {
  return createWsEvent(WsEventType.GROUP_MUTED, {
    groupId,
    groupName,
    operatorId,
    duration,
    muteEndAt,
    mutedAt: Date.now(),
  });
}

/**
 * @function createGroupUnmutedEvent
 * @description 创建被解禁事件
 */
export function createGroupUnmutedEvent(
  groupId: string,
  groupName: string,
  operatorId: string
): WsEvent<GroupUnmutedPayload> {
  return createWsEvent(WsEventType.GROUP_UNMUTED, {
    groupId,
    groupName,
    operatorId,
    unmutedAt: Date.now(),
  });
}

/**
 * @function createGroupDissolvedEvent
 * @description 创建群组解散事件
 */
export function createGroupDissolvedEvent(
  groupId: string,
  groupName: string
): WsEvent<GroupDissolvedPayload> {
  return createWsEvent(WsEventType.GROUP_DISSOLVED, {
    groupId,
    groupName,
    dissolvedAt: Date.now(),
  });
}
