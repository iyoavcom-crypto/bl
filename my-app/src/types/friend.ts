import type { UserPublic } from './user';

// 好友来源 (与后端一致)
export type FriendSource = 'search' | 'qrcode' | 'group' | 'contact' | 'share';

// 好友申请状态
export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected' | 'ignored';

// 好友关系
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

// 好友申请
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

// 发送好友申请请求
export interface SendFriendRequestBody {
  toUserId: string;
  message?: string;
  source: FriendSource;
}

// WebSocket 事件 payload
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
