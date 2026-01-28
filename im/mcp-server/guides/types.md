# IM-API TypeScript 类型定义

```typescript
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
export type SignalType = "offer" | "answer" | "ice-candidate";
export type Gender = "male" | "female" | "unknown";
export type UserState = "normal" | "muted" | "banned" | "canceled" | "risk_controlled";

export interface UserLocation {
  country: string;
  province: string;
  city: string;
}

export interface User {
  id: string;
  pid: string | null;
  phone: string;
  code: string | null;
  name: string;
  avatar: string | null;
  gender: Gender;
  location: UserLocation | null;
  vip: boolean;
  roleId: string;
  state: UserState;
  searchable: boolean;
  privateMuted: boolean;
  privateMuteUntil: string | null;
  lastOnlineAt: string | null;
  createdAt: string;
}

export interface Device {
  id: string;
  userId: string;
  platform: DevicePlatform;
  deviceId: string;
  deviceName: string | null;
  pushToken: string | null;
  pushProvider: PushProvider | null;
  isOnline: boolean;
  lastActiveAt: string | null;
}

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
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string | null;
  source: FriendSource;
  status: FriendRequestStatus;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  avatar: string | null;
  description: string | null;
  ownerId: string;
  maxMembers: number;
  memberCount: number;
  joinMode: GroupJoinMode;
  muteAll: boolean;
  createdAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  groupNickname: string | null;
  isMuted: boolean;
  muteUntil: string | null;
  doNotDisturb: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  userId: string | null;
  friendId: string | null;
  groupId: string | null;
  lastMessageId: string | null;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string | null;
  type: MessageType;
  content: string | null;
  mediaUrl: string | null;
  mediaDuration: number | null;
  replyToId: string | null;
  isRecalled: boolean;
  recalledAt: string | null;
  createdAt: string;
}

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
}

export interface ApiResponse<T> {
  code: string;
  data: T;
  message?: string;
}

export interface PagedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
    value?: unknown;
  }>;
}
```
