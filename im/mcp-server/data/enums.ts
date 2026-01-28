/**
 * @packageDocumentation
 * @module mcp-server/data/enums
 * @description 枚举常量定义
 */

/** 枚举常量 */
export const ENUMS: Record<string, string[]> = {
  DevicePlatform: ["ios", "android", "web", "macos", "windows"],
  PushProvider: ["apns", "expo", "fcm"],
  FriendSource: ["search", "qr", "phone", "invite"],
  FriendRequestStatus: ["pending", "accepted", "rejected", "ignored"],
  MessageType: ["text", "image", "voice"],
  GroupJoinMode: ["open", "approval", "invite"],
  GroupMemberRole: ["owner", "admin", "member"],
  ConversationType: ["private", "group"],
  CallStatus: ["initiated", "ringing", "connected", "ended", "missed", "rejected", "busy"],
  CallEndReason: ["caller_hangup", "callee_hangup", "timeout", "network_error"],
  Gender: ["male", "female", "unknown"],
  SignalType: ["offer", "answer", "ice-candidate"],
  UserState: ["normal", "muted", "banned", "canceled", "risk_controlled"],
};
