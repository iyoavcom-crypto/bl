import type { NavigatorScreenParams } from '@react-navigation/native';

// 认证导航
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// 主Tab导航
export type MainTabParamList = {
  Conversations: undefined;
  Contacts: undefined;
  Profile: undefined;
};

// 聊天Stack导航 (Chats Tab内的导航栈)
export type ChatsStackParamList = {
  ConversationList: undefined;
  ChatRoom: { conversationId: string; title?: string };
  UserInfo: { userId: string };
  GroupInfo: { groupId: string };
  InviteMembers: { groupId: string };
  ManageMembers: { groupId: string };
  CreateGroup: undefined;
  Report: { targetId: string; targetType: 'user' | 'message' | 'group'; targetName?: string };
};

// 联系人Stack导航 (Contacts Tab内的导航栈)
export type ContactsStackParamList = {
  ContactList: undefined;
  FriendRequests: undefined;
  AddFriend: undefined;
  CreateGroup: undefined;
};

// 根导航 (包含所有独立页面和模态页)
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  ChatRoom: { conversationId: string; title: string };
  UserInfo: { userId: string };
  GroupInfo: { groupId: string };
  InviteMembers: { groupId: string };
  ManageMembers: { groupId: string };
  CreateGroup: undefined;
  AddFriend: undefined;
  FriendRequests: undefined;
  Settings: undefined;
  Account: undefined;
  Privacy: undefined;
  ChangePassword: undefined;
  NotificationSettings: undefined;
  About: { type?: 'about' | 'terms' | 'privacy' };
  Report: { targetId: string; targetType: 'user' | 'message' | 'group'; targetName?: string };
};

// 声明全局导航类型
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
