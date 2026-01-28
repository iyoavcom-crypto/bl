/**
 * @packageDocumentation
 * @module mcp-server/data/ws-events
 * @description WebSocket 事件数据定义
 */

import type { WsEventDef } from "./types.js";

/** WebSocket 事件数据 */
export const WS_EVENTS: WsEventDef[] = [
  // 连接事件
  { type: "connected", description: "连接成功", payload: "{ userId: string, deviceId: string, serverTime: number }" },
  { type: "message:new", description: "新消息", payload: "{ conversationId: string, message: Message }" },
  { type: "message:recalled", description: "消息撤回", payload: "{ conversationId: string, messageId: string, recalledBy: string, recalledAt: number }" },
  { type: "message:read", description: "消息已读", payload: "{ conversationId: string, userId: string, lastReadMessageId: string, readAt: number }" },
  { type: "message:delivered", description: "消息送达", payload: "{ conversationId: string, messageId: string, deliveredTo: string, deliveredAt: number }" },
  { type: "typing:start", description: "开始输入", payload: "{ conversationId: string, userId: string, startedAt: number }" },
  { type: "typing:stop", description: "停止输入", payload: "{ conversationId: string, userId: string, stoppedAt: number }" },
  { type: "call:invite", description: "来电邀请", payload: "{ callId: string, callerId: string, calleeId: string, conversationId: string, createdAt: number }" },
  { type: "call:ring", description: "响铃", payload: "{ callId: string, calleeId: string, ringAt: number }" },
  { type: "call:answer", description: "接听", payload: "{ callId: string, answeredBy: string, startedAt: number }" },
  { type: "call:reject", description: "拒绝", payload: "{ callId: string, rejectedBy: string }" },
  { type: "call:end", description: "通话结束", payload: "{ callId: string, endedBy: string, status: CallStatus, endReason: CallEndReason | null, duration: number | null, endedAt: number }" },
  { type: "call:signal", description: "WebRTC 信令", payload: "{ callId: string, fromUserId: string, signalType: SignalType, signalData: SignalData, sentAt: number }" },
  { type: "presence:online", description: "用户上线", payload: "{ userId: string, deviceId: string, onlineAt: number }" },
  { type: "presence:offline", description: "用户下线", payload: "{ userId: string, deviceId: string, offlineAt: number }" },
  { type: "friend:request", description: "好友申请", payload: "{ requestId: string, fromUser: UserPublic, message: string | null, source: FriendSource, createdAt: number }" },
  { type: "friend:accepted", description: "好友申请被接受", payload: "{ requestId: string, friendUser: UserPublic, conversationId: string, acceptedAt: number }" },
  { type: "group:invited", description: "被邀请入群", payload: "{ groupId: string, groupName: string, groupAvatar: string | null, inviter: UserPublic, invitedAt: number }" },
  { type: "group:kicked", description: "被踢出群", payload: "{ groupId: string, groupName: string, operatorId: string, kickedAt: number }" },
  { type: "group:member_joined", description: "成员入群", payload: "{ groupId: string, member: UserPublic, inviterId: string | null, joinedAt: number }" },
  { type: "group:member_left", description: "成员退群", payload: "{ groupId: string, userId: string, leftAt: number }" },
  { type: "group:updated", description: "群信息更新", payload: "{ groupId: string, changes: GroupChanges, operatorId: string, updatedAt: number }" },
  { type: "group:muted", description: "被禁言", payload: "{ groupId: string, groupName: string, operatorId: string, duration: number | null, muteEndAt: string | null, mutedAt: number }" },
  { type: "group:unmuted", description: "被解禁", payload: "{ groupId: string, groupName: string, operatorId: string, unmutedAt: number }" },
  { type: "group:dissolved", description: "群组解散", payload: "{ groupId: string, groupName: string, dissolvedAt: number }" },
  { type: "heartbeat:ack", description: "心跳响应", payload: "{ serverTime: number }" },
  { type: "kick", description: "被踢下线", payload: "{ reason: string, newDeviceId?: string }" },
  { type: "error", description: "错误", payload: "{ code: number, message: string, details?: unknown }" },
];
