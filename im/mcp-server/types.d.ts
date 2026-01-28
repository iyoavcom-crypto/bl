/**
 * IM-API TypeScript 类型定义
 * 供 Expo/React Native 前端使用
 */

// ============================================================
// 通用类型（与后端 src/middleware/request/index.ts 保持一致）
// ============================================================

/** 业务响应码 */
export type ApiCode = "OK" | "Created" | "BadRequest" | "Unauthorized" | "Forbidden" | "NotFound" | "ServerError";

/** 成功响应结构 */
export interface ApiOk<T> {
  code: ApiCode;
  data: T;
  message?: string;
}

/** 错误响应结构 */
export interface ApiError<TDetails = unknown> {
  code: ApiCode;
  message: string;
  details?: TDetails;
}

/** 分页元信息 */
export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

/** 分页参数 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/** 分页响应结构 */
export interface PagedResponse<T> {
  code: ApiCode;
  data: T[];
  meta: Pagination;
  message?: string;
}

// ============================================================
// 枚举常量
// ============================================================

export type DevicePlatform = "ios" | "android" | "web" | "macos" | "windows";
export type PushProvider = "apns" | "expo" | "fcm";
export type FriendSource = "search" | "qr" | "phone" | "invite";
export type FriendRequestStatus = "pending" | "accepted" | "rejected" | "ignored";
export type MessageType = "text" | "image" | "voice";
export type GroupJoinMode = "open" | "approval" | "invite";
export type GroupMemberRole = "owner" | "admin" | "member";
export type ConversationType = "private" | "group";
export type CallStatus = "initiated" | "ringing" | "connected" | "ended" | "missed" | "rejected" | "busy";
export type CallEndReason = "caller_hangup" | "callee_hangup" | "timeout" | "network_error";
export type Gender = "male" | "female" | "unknown";
export type UserState = "normal" | "muted" | "banned" | "canceled" | "risk_controlled";
export type SignalType = "offer" | "answer" | "ice-candidate";

// ============================================================
// 用户模型
// ============================================================

export interface User {
  id: string;
  phone: string;
  name: string;
  avatar: string | null;
  gender: Gender;
  vip: boolean;
  state: UserState;
  searchable: boolean;
  location: UserLocation | null;
  lastOnlineAt: string | null;
  createdAt: string;
}

export interface UserLocation {
  country: string;
  province: string;
  city: string;
}

export interface UserPublic {
  id: string;
  name: string;
  avatar: string | null;
  gender: Gender;
}

export interface UserSearchResult {
  id: string;
  name: string;
  avatar: string | null;
  gender: Gender;
  isFriend: boolean;
  hasPendingRequest: boolean;
}

// ============================================================
// 认证模型
// ============================================================

export interface AuthPayload {
  sub: string;
  vip: boolean;
  roleId: string;
  teamId: string | null;
  teamRoleId: string | null;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
  payload: AuthPayload;
}

export interface RegisterRequest {
  phone: string;
  password: string;
  pin: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

// ============================================================
// 设备模型
// ============================================================

export interface Device {
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
  lastActiveAt: string | null;
  createdAt: string;
}

export interface DeviceRegisterRequest {
  platform: DevicePlatform;
  deviceId: string;
  deviceName?: string;
  pushToken?: string;
  pushProvider?: PushProvider;
  appVersion?: string;
  osVersion?: string;
}

// ============================================================
// 好友模型
// ============================================================

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  alias: string | null;
  isBlocked: boolean;
  doNotDisturb: boolean;
  isPinned: boolean;
  source: FriendSource;
  createdAt: string;
  friend?: UserPublic;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string | null;
  source: FriendSource;
  status: FriendRequestStatus;
  createdAt: string;
  fromUser?: UserPublic;
  toUser?: UserPublic;
}

export interface SendFriendRequestBody {
  toUserId: string;
  message?: string;
  source: FriendSource;
}

// ============================================================
// 群组模型
// ============================================================

export interface Group {
  id: string;
  name: string;
  avatar: string | null;
  description: string | null;
  ownerId: string;
  joinMode: GroupJoinMode;
  muteAll: boolean;
  memberCount: number;
  createdAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  nickname: string | null;
  muteEndAt: string | null;
  joinedAt: string;
  user?: UserPublic;
}

export interface CreateGroupRequest {
  name: string;
  avatar?: string;
  description?: string;
  joinMode?: GroupJoinMode;
  memberIds?: string[];
}

// ============================================================
// 会话模型
// ============================================================

export interface Conversation {
  id: string;
  type: ConversationType;
  targetUserId: string | null;
  groupId: string | null;
  unreadCount: number;
  lastMessageId: string | null;
  lastMessageAt: string | null;
  isPinned: boolean;
  isMuted: boolean;
  createdAt: string;
  lastMessage?: Message;
  targetUser?: UserPublic;
  group?: Group;
}

// ============================================================
// 消息模型
// ============================================================

export interface Message {
  id: string;
  conversationId: string;
  senderId: string | null;  // 可为 null（用户被删除时）
  type: MessageType;
  content: string | null;
  mediaUrl: string | null;
  mediaDuration: number | null;
  replyToId: string | null;
  isRecalled: boolean;
  recalledAt: string | null;
  createdAt: string;
  sender?: UserPublic;
  replyTo?: Message;
}

export interface SendMessageRequest {
  conversationId: string;
  type: MessageType;
  content?: string;
  mediaUrl?: string;
  mediaDuration?: number;
  replyToId?: string;
}

// ============================================================
// 通话模型
// ============================================================

export interface Call {
  id: string;
  conversationId: string;
  callerId: string;
  calleeId: string;
  status: CallStatus;
  startedAt: string | null;
  endedAt: string | null;
  duration: number | null;
  endReason: CallEndReason | null;
  createdAt: string;
  caller?: UserPublic;
  callee?: UserPublic;
}

export interface SignalData {
  sdp?: string;
  candidate?: string;
  sdpMid?: string;
  sdpMLineIndex?: number;
}

export interface SendSignalRequest {
  signalType: SignalType;
  signalData: SignalData;
}

// ============================================================
// 媒体上传
// ============================================================

export interface MediaUploadResult {
  type: "image" | "audio" | "video" | "file";
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface MediaLimits {
  allowedTypes: string[];
  sizeLimits: {
    image: number;
    audio: number;
    video: number;
    file: number;
  };
  maxFiles: number;
}

// ============================================================
// 在线状态
// ============================================================

export interface PresenceStatus {
  userId: string;
  isOnline: boolean;
  lastOnlineAt?: string;
  onlineDeviceCount?: number;
}

// ============================================================
// WebSocket 连接配置
// ============================================================

/** WebSocket 连接数限制 */
export interface ConnectionLimits {
  /** 单用户最大设备连接数（默认：5） */
  maxDevicesPerUser: number;
  /** 全局最大连接数（默认：10000） */
  maxTotalConnections: number;
}

/** WebSocket 连接拒绝原因 */
export type ConnectionRejectReason =
  | "USER_DEVICE_LIMIT"    // 用户设备数超限
  | "GLOBAL_CONNECTION_LIMIT";  // 全局连接数超限

/** WebSocket 关闭码 */
export enum WsCloseCode {
  NORMAL = 1000,           // 正常关闭
  GOING_AWAY = 1001,       // 服务器关闭
  NO_TOKEN = 4001,         // 缺少认证令牌
  AUTH_FAILED = 4002,      // 认证失败
  USER_DEVICE_LIMIT = 4003,    // 用户设备数量超过限制
  GLOBAL_CONN_LIMIT = 4004,    // 服务器连接数已满
}

export type WsCloseCodeValue = (typeof WsCloseCode)[keyof typeof WsCloseCode];

// ============================================================
// WebSocket 事件类型
// ============================================================

export enum WsEventType {
  // 消息
  MESSAGE_NEW = "message:new",
  MESSAGE_RECALLED = "message:recalled",
  MESSAGE_READ = "message:read",
  MESSAGE_DELIVERED = "message:delivered",

  // 输入状态
  TYPING_START = "typing:start",
  TYPING_STOP = "typing:stop",

  // 通话
  CALL_INVITE = "call:invite",
  CALL_RING = "call:ring",
  CALL_ANSWER = "call:answer",
  CALL_REJECT = "call:reject",
  CALL_END = "call:end",
  CALL_SIGNAL = "call:signal",

  // 在线状态
  PRESENCE_ONLINE = "presence:online",
  PRESENCE_OFFLINE = "presence:offline",

  // 好友
  FRIEND_REQUEST = "friend:request",
  FRIEND_ACCEPTED = "friend:accepted",

  // 群组
  GROUP_INVITED = "group:invited",
  GROUP_KICKED = "group:kicked",
  GROUP_MEMBER_JOINED = "group:member_joined",
  GROUP_MEMBER_LEFT = "group:member_left",
  GROUP_UPDATED = "group:updated",
  GROUP_MUTED = "group:muted",
  GROUP_UNMUTED = "group:unmuted",
  GROUP_DISSOLVED = "group:dissolved",

  // 系统
  CONNECTED = "connected",
  ERROR = "error",
  KICK = "kick",
  HEARTBEAT_ACK = "heartbeat:ack",
}

export type WsEventTypeValue = (typeof WsEventType)[keyof typeof WsEventType];

/** WebSocket 事件基础结构 */
export interface WsEvent<T = unknown> {
  type: WsEventTypeValue;
  timestamp: number;
  payload: T;
}

// ============================================================
// WebSocket 事件载荷类型
// ============================================================

export interface WsConnectedPayload {
  userId: string;
  deviceId: string;
  serverTime: number;
}

export interface WsMessageNewPayload {
  conversationId: string;
  message: Message;
}

export interface WsMessageRecalledPayload {
  conversationId: string;
  messageId: string;
  recalledBy: string;
}

export interface WsMessageReadPayload {
  conversationId: string;
  userId: string;
  lastReadMessageId: string;
}

export interface WsMessageDeliveredPayload {
  conversationId: string;
  messageId: string;
  deliveredTo: string;
  deliveredAt: number;
}

export interface WsTypingPayload {
  conversationId: string;
  userId: string;
  startedAt?: number;
  stoppedAt?: number;
}

export interface WsCallInvitePayload {
  callId: string;
  callerId: string;
  calleeId: string;
  conversationId: string;
}

export interface WsCallSignalPayload {
  callId: string;
  fromUserId: string;
  signalType: SignalType;
  signalData: SignalData;
  sentAt: number;
}

export interface WsCallEndPayload {
  callId: string;
  endedBy: string;
  status: CallStatus;
  endReason: CallEndReason;
  duration: number;
}

export interface WsFriendRequestPayload {
  requestId: string;
  fromUser: UserPublic;
  message: string | null;
  source: FriendSource;
  createdAt: number;
}

export interface WsFriendAcceptedPayload {
  requestId: string;
  friendUser: UserPublic;
  conversationId: string;
  acceptedAt: number;
}

export interface WsGroupInvitedPayload {
  groupId: string;
  groupName: string;
  groupAvatar: string | null;
  inviter: UserPublic;
  invitedAt: number;
}

export interface WsGroupKickedPayload {
  groupId: string;
  groupName: string;
  operatorId: string;
  kickedAt: number;
}

export interface WsGroupMutedPayload {
  groupId: string;
  groupName: string;
  operatorId: string;
  duration: number | null;
  muteEndAt: string | null;
  mutedAt: number;
}

export interface WsPresencePayload {
  userId: string;
  deviceId: string;
  onlineAt?: number;
  offlineAt?: number;
}

export interface WsKickPayload {
  reason: string;
  newDeviceId?: string;
}

export interface WsErrorPayload {
  code: number;
  message: string;
  details?: unknown;
}

// ============================================================
// 推送通知数据类型
// ============================================================

export type PushDataType =
  | "new_message"
  | "incoming_call"
  | "friend_request"
  | "friend_accepted"
  | "group_invite"
  | "group_kicked"
  | "group_muted"
  | "group_dissolved";

export interface PushData {
  type: PushDataType;
  conversationId?: string;
  messageId?: string;
  callId?: string;
  callType?: string;
  requestId?: string;
  groupId?: string;
  userId?: string;
}
