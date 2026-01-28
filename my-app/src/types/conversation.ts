// 会话类型
export type ConversationType = 'private' | 'group';

// 会话中的用户信息（简化版）
export interface ConversationUser {
  id: string;
  code: string | null;
  name: string | null;
  avatar: string | null;
  gender: string;
}

// 会话中的群组信息（简化版）
export interface ConversationGroup {
  id: string;
  name: string;
  avatar: string | null;
  description: string | null;
  ownerId: string;
  joinMode: string;
  muteAll: boolean;
  memberCount: number;
  createdAt: string;
}

// 会话中的最后一条消息（简化版）
export interface ConversationLastMessage {
  id: string;
  conversationId: string;
  senderId: string | null;
  type: string;
  content: string | null;
  mediaUrl: string | null;
  mediaDuration: number | null;
  replyToId: string | null;
  isRecalled: boolean;
  recalledAt: string | null;
  createdAt: string;
}

// 会话实体
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
  lastMessage?: ConversationLastMessage;
  targetUser?: ConversationUser;
  group?: ConversationGroup;
}
