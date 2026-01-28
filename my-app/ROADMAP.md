# 包聊 (BaoLiao) 项目开发规划

## 项目概述

- **产品名称**: 包聊 (BaoLiao)
- **Bundle ID**: com.baoliao.im
- **平台**: iOS (Expo SDK 54)
- **后端协议**: MCP (84个API + 28个WebSocket事件)

---

## Phase 0: 基础架构 [已完成]

### 类型定义 `src/types/`
- [x] user.ts - 用户、认证类型
- [x] message.ts - 消息类型
- [x] conversation.ts - 会话类型
- [x] group.ts - 群组、群成员类型
- [x] friend.ts - 好友、好友申请类型
- [x] call.ts - 通话、信令类型
- [x] device.ts - 设备类型
- [x] websocket.ts - WebSocket事件类型
- [x] notification.ts - 推送通知类型
- [x] media.ts - 媒体上传类型

### 配置层 `src/config/`
- [x] api/env.ts - 环境变量
- [x] api/api.ts - Axios实例 + Token刷新
- [x] api/types.ts - API响应类型
- [x] api/errorHandler.ts - 错误处理
- [x] api/responseHandler.ts - 响应处理
- [x] constants.ts - 常量定义

### 主题系统 `src/theme/`
- [x] tokens.ts - 颜色、间距、字号令牌
- [x] ThemeContext.tsx - 主题Provider
- [x] layout.ts - 布局常量
- [x] animation.ts - 动画配置

### 工具函数 `src/utils/`
- [x] storage.ts - 存储工具
- [x] format.ts - 格式化工具
- [x] device.ts - 设备信息
- [x] validation.ts - 验证工具
- [x] haptics.ts - 触觉反馈

---

## Phase 1: 状态管理层 `src/stores/`

### 认证模块
- [ ] authStore.ts
  - login() → POST /auth/login
  - register() → POST /auth/register
  - logout() → 清除Token
  - refreshToken() → POST /auth/refresh

### 用户模块
- [ ] userStore.ts
  - fetchProfile() → GET /im/user/me
  - updateProfile() → PUT /im/user/me
  - searchUser() → GET /im/user/search

### 设备模块
- [ ] deviceStore.ts
  - registerDevice() → POST /im/device/register
  - updatePushToken() → PUT /im/device/:id/push-token
  - heartbeat() → POST /im/device/:id/heartbeat

### 会话模块
- [ ] conversationStore.ts
  - fetchConversations() → GET /im/conversation
  - createConversation() → POST /im/conversation
  - updateSettings() → PUT /im/conversation/:id
  - deleteConversation() → DELETE /im/conversation/:id

### 消息模块
- [ ] messageStore.ts
  - fetchMessages() → GET /im/message
  - sendMessage() → POST /im/message
  - recallMessage() → DELETE /im/message/:id/recall
  - markAsRead() → POST /im/message/read

### 好友模块
- [ ] friendStore.ts
  - fetchFriends() → GET /im/friend
  - updateFriend() → PUT /im/friend/:id
  - deleteFriend() → DELETE /im/friend/:id
  - fetchRequests() → GET /im/friend-request
  - sendRequest() → POST /im/friend-request
  - handleRequest() → PUT /im/friend-request/:id

### 群组模块
- [ ] groupStore.ts
  - fetchGroups() → GET /im/group
  - createGroup() → POST /im/group
  - updateGroup() → PUT /im/group/:id
  - dissolveGroup() → DELETE /im/group/:id
  - fetchMembers() → GET /im/group/:id/member
  - inviteMembers() → POST /im/group/:id/member
  - removeMember() → DELETE /im/group/:id/member/:userId

### 通话模块
- [ ] callStore.ts
  - initiateCall() → POST /im/call/initiate
  - answerCall() → POST /im/call/:id/answer
  - rejectCall() → POST /im/call/:id/reject
  - endCall() → POST /im/call/:id/end
  - sendSignal() → POST /im/call/:id/signal

---

## Phase 2: 服务层 `src/services/`

### WebSocket管理
- [ ] websocket/manager.ts
  - connect() - 建立连接
  - disconnect() - 断开连接
  - send() - 发送消息
  - reconnect() - 自动重连
  - heartbeat() - 心跳维护

### WebSocket事件处理
- [ ] websocket/handlers.ts
  - message:new - 新消息
  - message:recalled - 消息撤回
  - message:read - 消息已读
  - message:delivered - 消息送达
  - typing:start/stop - 输入状态
  - call:invite/ring/answer/reject/end/signal - 通话事件
  - presence:online/offline - 在线状态
  - friend:request/accepted - 好友事件
  - group:invited/kicked/member_joined/member_left/updated/muted/unmuted/dissolved - 群组事件

### 推送通知
- [ ] notification.ts
  - requestPermissions() - 请求权限
  - registerPushToken() - 注册Token
  - handleNotification() - 处理通知
  - handleNotificationResponse() - 处理点击

### 消息队列
- [ ] messageQueue.ts
  - enqueue() - 入队
  - dequeue() - 出队
  - retry() - 重试失败消息
  - persist() - 持久化

---

## Phase 3: UI组件 `src/components/`

### 基础组件 `ui/`
- [ ] Button.tsx
- [ ] Input.tsx
- [ ] Avatar.tsx
- [ ] Badge.tsx
- [ ] Modal.tsx
- [ ] Toast.tsx
- [ ] Loading.tsx
- [ ] Empty.tsx

### 聊天组件 `chat/`
- [ ] MessageBubble.tsx
- [ ] MessageList.tsx
- [ ] InputBar.tsx
- [ ] VoiceRecorder.tsx
- [ ] ImagePicker.tsx
- [ ] ReplyPreview.tsx

### 会话组件 `conversation/`
- [ ] ConversationItem.tsx
- [ ] ConversationList.tsx
- [ ] SearchBar.tsx

### 联系人组件 `contact/`
- [ ] ContactItem.tsx
- [ ] ContactList.tsx
- [ ] GroupItem.tsx
- [ ] FriendRequestItem.tsx

### 通话组件 `call/`
- [ ] CallOverlay.tsx
- [ ] CallControls.tsx
- [ ] IncomingCall.tsx

---

## Phase 4: 页面 `src/screens/`

### 认证页面 `auth/`
- [ ] LoginScreen.tsx
- [ ] RegisterScreen.tsx
- [ ] ForgotPasswordScreen.tsx

### 主页面 `main/`
- [ ] ConversationsScreen.tsx
- [ ] ContactsScreen.tsx
- [ ] ProfileScreen.tsx

### 聊天页面 `chat/`
- [ ] ChatRoomScreen.tsx
- [ ] GroupInfoScreen.tsx
- [ ] UserInfoScreen.tsx
- [ ] MediaViewerScreen.tsx

### 设置页面 `settings/`
- [ ] SettingsScreen.tsx
- [ ] AccountScreen.tsx
- [ ] NotificationSettingsScreen.tsx
- [ ] AboutScreen.tsx

---

## Phase 5: 导航 `src/navigation/`

- [ ] RootNavigator.tsx - 根导航 (Auth/Main分支)
- [ ] AuthNavigator.tsx - 认证流程
- [ ] MainNavigator.tsx - 主Tab导航
- [ ] ChatNavigator.tsx - 聊天Stack
- [ ] ContactNavigator.tsx - 通讯录Stack
- [ ] types.ts - 导航类型定义

---

## 开发顺序

```
Phase 1.1: authStore → LoginScreen → RegisterScreen
Phase 1.2: deviceStore → 设备注册 → 推送Token上报
Phase 2.1: websocket/manager → 连接管理 → 心跳
Phase 1.3: conversationStore → ConversationsScreen
Phase 1.4: messageStore → ChatRoomScreen
Phase 1.5: friendStore → ContactsScreen
Phase 1.6: groupStore → 群组功能
Phase 1.7: callStore → VoiceCall
```

---

## MCP API 覆盖检查

| 模块 | API数量 | Store覆盖 |
|------|---------|-----------|
| Auth | 4 | authStore |
| User | 6 | userStore |
| Device | 5 | deviceStore |
| Conversation | 5 | conversationStore |
| Message | 6 | messageStore |
| Friend | 8 | friendStore |
| FriendRequest | 4 | friendStore |
| Group | 12 | groupStore |
| GroupMember | 8 | groupStore |
| Call | 6 | callStore |
| Media | 4 | messageStore |
| Presence | 2 | websocket |

---

## WebSocket 事件覆盖

| 类别 | 事件数量 | Handler |
|------|----------|---------|
| 消息 | 4 | messageStore |
| 输入状态 | 2 | conversationStore |
| 通话 | 6 | callStore |
| 在线状态 | 2 | userStore |
| 好友 | 2 | friendStore |
| 群组 | 8 | groupStore |
| 系统 | 4 | websocket/manager |
