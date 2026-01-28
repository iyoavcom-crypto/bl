/**
 * 推送通知类型定义
 */

// 推送通知类型
export type NotificationType = 
  | 'message'           // 新消息 (前端别名)
  | 'new_message'       // 新消息 (后端推送)
  | 'friend_request'    // 好友申请
  | 'friend_accepted'   // 好友通过
  | 'group_invited'     // 群组邀请 (前端别名)
  | 'group_invite'      // 群组邀请 (后端推送)
  | 'group_kicked'      // 被踢出群组
  | 'group_muted'       // 群组禁言
  | 'group_dissolved'   // 群组解散
  | 'call_incoming'     // 来电 (前端别名)
  | 'incoming_call'     // 来电 (后端推送)
  | 'system';           // 系统通知

// 推送通知数据
export interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  // 消息通知数据
  conversationId?: string;
  messageId?: string;
  senderId?: string;
  senderName?: string;
  // 好友通知数据
  friendId?: string;
  friendName?: string;
  requestId?: string;
  // 群组通知数据
  groupId?: string;
  groupName?: string;
  duration?: number | null;  // 禁言时长（秒）
  // 通话通知数据
  callId?: string;
  callType?: 'audio' | 'video';
  // 通用数据
  timestamp?: number;
}

// 通知权限状态
export type NotificationPermissionStatus = 
  | 'undetermined'  // 未确定
  | 'granted'       // 已授权
  | 'denied';       // 已拒绝

// 设备 Push Token 注册请求
export interface RegisterPushTokenRequest {
  token: string;
  platform: 'ios' | 'android';
  deviceId: string;
  deviceName?: string;
  appVersion?: string;
}

// 设备 Push Token 注册响应
export interface RegisterPushTokenResponse {
  success: boolean;
  deviceId: string;
  message?: string;
}

// 通知设置
export interface NotificationSettings {
  // 消息通知
  messageEnabled: boolean;
  messagePreview: boolean;      // 是否显示消息预览
  messageSound: boolean;
  messageVibrate: boolean;
  // 好友通知
  friendRequestEnabled: boolean;
  // 群组通知
  groupEnabled: boolean;
  // 通话通知
  callEnabled: boolean;
  // 免打扰
  doNotDisturb: boolean;
  doNotDisturbStart?: string;   // HH:mm 格式
  doNotDisturbEnd?: string;     // HH:mm 格式
}

// 默认通知设置
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  messageEnabled: true,
  messagePreview: true,
  messageSound: true,
  messageVibrate: true,
  friendRequestEnabled: true,
  groupEnabled: true,
  callEnabled: true,
  doNotDisturb: false,
};
