# IM API 路由文档

> 生成时间: 2026-01-27

## 概览

- **基础路径**: `/api`
- **健康检查**: `GET /health`
- **静态文件**: `/uploads/*`
- **WebSocket**: `ws://host:port/ws`
- **API 总数**: **84 个**

## 通用响应格式

```typescript
// 成功响应
{ success: true, data: T, message?: string }

// 失败响应
{ success: false, message: string }
```

---

## 84 个 API 完整响应字段

### 1. Auth 认证 (4 个)

#### #1 POST `/api/auth/register` - 用户注册
```typescript
{
  user: {
    id: string,
    pid: string | null,
    searchable: boolean,
    code: string,
    phone: string,
    roleId: string | null,
    telegramId: string | null,
    teamId: string | null,
    state: "active" | "inactive" | "banned",
    vip: number,
    name: string,
    avatar: string | null,
    gender: "male" | "female" | "unknown",
    location: { country?: string, province?: string, city?: string } | null,
    ip: string | null,
    ua: string | null,
    longSession: boolean,
    lastOnlineAt: Date | null,
    privateMuted: boolean,
    privateMuteUntil: Date | null,
    createdAt: Date,
    updatedAt: Date
  },
  access: string,   // JWT access token
  refresh: string,  // JWT refresh token
  payload: {
    sub: string,
    phone: string,
    name: string,
    role: string | null
  }
}
```

#### #2 POST `/api/auth/login` - 用户登录
```typescript
// 同 #1 register 响应格式
```

#### #3 POST `/api/auth/logout` - 用户退出
```typescript
null  // message: "退出成功"
```

#### #4 GET `/api/auth/me` - 获取当前用户信息
```typescript
{
  id: string,
  pid: string | null,
  searchable: boolean,
  code: string,
  phone: string,
  roleId: string | null,
  telegramId: string | null,
  teamId: string | null,
  state: "active" | "inactive" | "banned",
  vip: number,
  name: string,
  avatar: string | null,
  gender: "male" | "female" | "unknown",
  location: { country?: string, province?: string, city?: string } | null,
  ip: string | null,
  ua: string | null,
  longSession: boolean,
  lastOnlineAt: Date | null,
  privateMuted: boolean,
  privateMuteUntil: Date | null,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 2. Users 用户 (7 个)

#### #5 GET `/api/im/users/profile` - 获取当前用户资料
```typescript
{
  id: string,
  pid: string | null,
  searchable: boolean,
  code: string,
  phone: string,
  roleId: string | null,
  telegramId: string | null,
  teamId: string | null,
  state: "active" | "inactive" | "banned",
  vip: number,
  name: string,
  avatar: string | null,
  gender: "male" | "female" | "unknown",
  location: { country?: string, province?: string, city?: string } | null,
  ip: string | null,
  ua: string | null,
  longSession: boolean,
  lastOnlineAt: Date | null,
  privateMuted: boolean,
  privateMuteUntil: Date | null,
  createdAt: Date,
  updatedAt: Date
}
```

#### #6 PUT `/api/im/users/profile` - 更新当前用户资料
```typescript
// 同 #5 响应格式
```

#### #7 POST `/api/im/users/change-password` - 修改密码
```typescript
null  // message: "密码修改成功"
```

#### #8 POST `/api/im/users/change-pin` - 修改二级密码
```typescript
null  // message: "二级密码修改成功"
```

#### #9 POST `/api/im/users/verify-pin` - 验证二级密码
```typescript
{
  valid: boolean
}
```

#### #10 GET `/api/im/users/search` - 搜索用户
```typescript
[
  {
    id: string,
    name: string,
    avatar: string | null,
    gender: "male" | "female" | "unknown",
    isFriend: boolean,
    hasPendingRequest: boolean
  }
]
```

#### #11 GET `/api/im/users/:userId` - 获取指定用户公开信息
```typescript
{
  id: string,
  name: string,
  avatar: string | null,
  gender: "male" | "female" | "unknown"
}
```

---

### 3. Devices 设备 (8 个)

#### #12 GET `/api/im/devices` - 获取我的设备列表
```typescript
[
  {
    id: string,
    userId: string,
    platform: "ios" | "android" | "web" | "desktop",
    deviceName: string | null,
    isOnline: boolean,
    lastActiveAt: Date | null,
    createdAt: Date
  }
]
```

#### #13 POST `/api/im/devices/register` - 注册或更新设备
```typescript
{
  id: string,
  userId: string,
  platform: "ios" | "android" | "web" | "desktop",
  deviceId: string,
  deviceName: string | null,
  pushProvider: "apns" | "fcm" | "hms" | null,
  appVersion: string | null,
  osVersion: string | null,
  isOnline: boolean,
  doNotDisturb: boolean,
  lastActiveAt: Date | null,
  lastIp: string | null,
  createdAt: Date,
  updatedAt: Date
}
```

#### #14 GET `/api/im/devices/:deviceId` - 获取设备详情
```typescript
// 同 #13 响应格式
```

#### #15 PUT `/api/im/devices/:deviceId` - 更新设备信息
```typescript
// 同 #13 响应格式
```

#### #16 DELETE `/api/im/devices/:deviceId` - 删除设备
```typescript
// 204 No Content
```

#### #17 POST `/api/im/devices/:deviceId/push-token` - 更新推送令牌
```typescript
// 同 #13 响应格式
```

#### #18 POST `/api/im/devices/:deviceId/heartbeat` - 设备心跳
```typescript
{
  online: true,
  lastActiveAt: Date
}
```

#### #19 POST `/api/im/devices/:deviceId/offline` - 设备下线
```typescript
{
  online: false
}
```

---

### 4. Friends 好友 (10 个)

#### #20 GET `/api/im/friends` - 获取我的好友列表
```typescript
{
  list: [
    {
      id: string,
      userId: string,
      friendId: string,
      alias: string | null,
      isBlocked: boolean,
      doNotDisturb: boolean,
      isPinned: boolean,
      createdAt: Date,
      friend: {
        id: string,
        name: string,
        avatar: string | null,
        gender: "male" | "female" | "unknown"
      }
    }
  ],
  total: number,
  page: number,
  limit: number
}
```

#### #21 GET `/api/im/friends/:userId` - 获取好友详情
```typescript
{
  friend: {
    id: string,
    userId: string,
    friendId: string,
    alias: string | null,
    isBlocked: boolean,
    doNotDisturb: boolean,
    isPinned: boolean,
    source: "search" | "qrcode" | "group" | "contact" | "share",
    createdAt: Date,
    updatedAt: Date
  },
  user: {
    id: string,
    name: string,
    avatar: string | null,
    gender: "male" | "female" | "unknown"
  }
}
```

#### #22 PUT `/api/im/friends/:userId` - 更新好友信息
```typescript
{
  id: string,
  userId: string,
  friendId: string,
  alias: string | null,
  isBlocked: boolean,
  doNotDisturb: boolean,
  isPinned: boolean,
  source: "search" | "qrcode" | "group" | "contact" | "share",
  createdAt: Date,
  updatedAt: Date
}
```

#### #23 DELETE `/api/im/friends/:userId` - 删除好友
```typescript
// 204 No Content
```

#### #24 POST `/api/im/friends/requests` - 发送好友申请
```typescript
{
  id: string,
  fromUserId: string,
  toUserId: string,
  message: string | null,
  source: "search" | "qrcode" | "group" | "contact" | "share",
  status: "pending",
  respondedAt: null,
  createdAt: Date,
  updatedAt: Date
}
```

#### #25 GET `/api/im/friends/requests/received` - 获取收到的好友申请
```typescript
[
  {
    id: string,
    fromUserId: string,
    toUserId: string,
    message: string | null,
    source: "search" | "qrcode" | "group" | "contact" | "share",
    status: "pending" | "accepted" | "rejected",
    respondedAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
    fromUser: {
      id: string,
      name: string,
      avatar: string | null,
      gender: "male" | "female" | "unknown"
    }
  }
]
```

#### #26 GET `/api/im/friends/requests/sent` - 获取发出的好友申请
```typescript
[
  {
    id: string,
    fromUserId: string,
    toUserId: string,
    message: string | null,
    source: "search" | "qrcode" | "group" | "contact" | "share",
    status: "pending" | "accepted" | "rejected",
    respondedAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
    toUser: {
      id: string,
      name: string,
      avatar: string | null,
      gender: "male" | "female" | "unknown"
    }
  }
]
```

#### #27 POST `/api/im/friends/requests/:requestId/accept` - 接受好友申请
```typescript
{
  friend: {
    id: string,
    userId: string,
    friendId: string,
    alias: null,
    isBlocked: false,
    doNotDisturb: false,
    isPinned: false,
    source: "search" | "qrcode" | "group" | "contact" | "share",
    createdAt: Date,
    updatedAt: Date
  },
  request: {
    id: string,
    fromUserId: string,
    toUserId: string,
    message: string | null,
    source: "search" | "qrcode" | "group" | "contact" | "share",
    status: "accepted",
    respondedAt: Date,
    createdAt: Date,
    updatedAt: Date
  }
}
```

#### #28 POST `/api/im/friends/requests/:requestId/reject` - 拒绝好友申请
```typescript
{
  id: string,
  fromUserId: string,
  toUserId: string,
  message: string | null,
  source: "search" | "qrcode" | "group" | "contact" | "share",
  status: "rejected",
  respondedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### #29 GET `/api/im/friends/check/:userId` - 检查是否为好友
```typescript
{
  isFriend: boolean
}
```

---

### 5. Friend Requests CRUD (5 个)

#### #30 GET `/api/im/friend-requests` - 获取好友申请列表
```typescript
{
  list: [
    {
      id: string,
      fromUserId: string,
      toUserId: string,
      message: string | null,
      source: "search" | "qrcode" | "group" | "contact" | "share",
      status: "pending" | "accepted" | "rejected",
      createdAt: Date
    }
  ],
  total: number,
  page: number,
  limit: number
}
```

#### #31 POST `/api/im/friend-requests` - 发送好友申请
```typescript
{
  id: string,
  fromUserId: string,
  toUserId: string,
  message: string | null,
  source: "search" | "qrcode" | "group" | "contact" | "share",
  status: "pending",
  respondedAt: null,
  createdAt: Date,
  updatedAt: Date
}
```

#### #32 GET `/api/im/friend-requests/:id` - 获取好友申请详情
```typescript
{
  id: string,
  fromUserId: string,
  toUserId: string,
  message: string | null,
  source: "search" | "qrcode" | "group" | "contact" | "share",
  status: "pending" | "accepted" | "rejected",
  respondedAt: Date | null,
  createdAt: Date,
  updatedAt: Date
}
```

#### #33 PUT `/api/im/friend-requests/:id` - 处理好友申请
```typescript
// 同 #32 响应格式
```

#### #34 DELETE `/api/im/friend-requests/:id` - 删除好友申请
```typescript
// 204 No Content
```

---

### 6. Groups 群组 (14 个)

#### #35 GET `/api/im/groups` - 获取我加入的群组列表
```typescript
[
  {
    id: string,
    name: string,
    avatar: string | null,
    ownerId: string,
    memberCount: number,
    joinMode: "open" | "approval" | "invite",
    createdAt: Date,
    membership: {
      role: "owner" | "admin" | "member",
      groupNickname: string | null,
      doNotDisturb: boolean
    }
  }
]
```

#### #36 POST `/api/im/groups` - 创建群组
```typescript
{
  id: string,
  name: string,
  avatar: string | null,
  description: string | null,
  ownerId: string,
  maxMembers: number,
  memberCount: number,
  joinMode: "open" | "approval" | "invite",
  muteAll: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### #37 GET `/api/im/groups/:groupId` - 获取群组详情
```typescript
{
  group: {
    id: string,
    name: string,
    avatar: string | null,
    description: string | null,
    ownerId: string,
    maxMembers: number,
    memberCount: number,
    joinMode: "open" | "approval" | "invite",
    muteAll: boolean,
    createdAt: Date,
    updatedAt: Date
  },
  membership: {
    id: string,
    groupId: string,
    userId: string,
    role: "owner" | "admin" | "member",
    groupNickname: string | null,
    isMuted: boolean,
    muteUntil: Date | null,
    doNotDisturb: boolean,
    joinedAt: Date,
    updatedAt: Date
  }
}
```

#### #38 PUT `/api/im/groups/:groupId` - 更新群组信息
```typescript
// 同 #36 响应格式
```

#### #39 DELETE `/api/im/groups/:groupId` - 解散群组
```typescript
// 204 No Content
```

#### #40 GET `/api/im/groups/:groupId/members` - 获取群成员列表
```typescript
[
  {
    id: string,
    groupId: string,
    userId: string,
    role: "owner" | "admin" | "member",
    groupNickname: string | null,
    isMuted: boolean,
    joinedAt: Date,
    user: {
      id: string,
      name: string,
      avatar: string | null,
      gender: "male" | "female" | "unknown"
    }
  }
]
```

#### #41 POST `/api/im/groups/:groupId/invite` - 邀请成员加入群组
```typescript
[
  {
    id: string,
    groupId: string,
    userId: string,
    role: "member",
    groupNickname: null,
    isMuted: false,
    muteUntil: null,
    doNotDisturb: false,
    joinedAt: Date,
    updatedAt: Date
  }
]
```

#### #42 POST `/api/im/groups/:groupId/kick/:userId` - 踢出成员
```typescript
// 204 No Content
```

#### #43 POST `/api/im/groups/:groupId/leave` - 退出群组
```typescript
// 204 No Content
```

#### #44 POST `/api/im/groups/:groupId/transfer` - 转让群主
```typescript
{
  message: "转让成功"
}
```

#### #45 POST `/api/im/groups/:groupId/admin/:userId` - 设置管理员
```typescript
{
  message: "设置成功"
}
```

#### #46 DELETE `/api/im/groups/:groupId/admin/:userId` - 取消管理员
```typescript
{
  message: "取消成功"
}
```

#### #47 POST `/api/im/groups/:groupId/mute/:userId` - 禁言成员
```typescript
{
  message: "禁言成功"
}
```

#### #48 DELETE `/api/im/groups/:groupId/mute/:userId` - 解除禁言
```typescript
{
  message: "解除禁言成功"
}
```

---

### 7. Group Members CRUD (5 个)

#### #49 GET `/api/im/group-members` - 获取群成员列表
```typescript
{
  list: [
    {
      id: string,
      groupId: string,
      userId: string,
      role: "owner" | "admin" | "member",
      groupNickname: string | null,
      isMuted: boolean,
      joinedAt: Date
    }
  ],
  total: number,
  page: number,
  limit: number
}
```

#### #50 POST `/api/im/group-members` - 添加群成员
```typescript
{
  id: string,
  groupId: string,
  userId: string,
  role: "owner" | "admin" | "member",
  groupNickname: string | null,
  isMuted: boolean,
  muteUntil: Date | null,
  doNotDisturb: boolean,
  joinedAt: Date,
  updatedAt: Date
}
```

#### #51 GET `/api/im/group-members/:id` - 获取群成员详情
```typescript
// 同 #50 响应格式
```

#### #52 PUT `/api/im/group-members/:id` - 更新群成员信息
```typescript
// 同 #50 响应格式
```

#### #53 DELETE `/api/im/group-members/:id` - 移除群成员
```typescript
// 204 No Content
```

---

### 8. Conversations 会话 (6 个)

#### #54 GET `/api/im/conversations` - 获取我的会话列表
```typescript
[
  {
    id: string,
    type: "private" | "group",
    userId: string | null,
    friendId: string | null,
    groupId: string | null,
    lastMessageId: string | null,
    lastMessageAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
    unreadCount: number,
    target: {
      // 私聊时
      id: string,
      name: string,
      avatar: string | null
    } | {
      // 群聊时
      id: string,
      name: string,
      avatar: string | null,
      memberCount: number
    },
    lastMessage: {
      id: string,
      type: "text" | "image" | "audio" | "video" | "file" | "location" | "system",
      content: string | null,
      createdAt: Date
    } | null
  }
]
```

#### #55 POST `/api/im/conversations/private` - 发起私聊
```typescript
{
  id: string,
  type: "private",
  userId: string,
  friendId: string,
  groupId: null,
  lastMessageId: null,
  lastMessageAt: null,
  createdAt: Date,
  updatedAt: Date
}
```

#### #56 GET `/api/im/conversations/:conversationId` - 获取会话详情
```typescript
{
  conversation: {
    id: string,
    type: "private" | "group",
    userId: string | null,
    friendId: string | null,
    groupId: string | null,
    lastMessageId: string | null,
    lastMessageAt: Date | null,
    createdAt: Date,
    updatedAt: Date
  },
  target: {
    id: string,
    name: string,
    avatar: string | null
  },
  unreadCount: number
}
```

#### #57 DELETE `/api/im/conversations/:conversationId` - 删除会话
```typescript
// 204 No Content
```

#### #58 POST `/api/im/conversations/:conversationId/clear-unread` - 清空未读
```typescript
{
  message: "清空成功"
}
```

#### #59 POST `/api/im/conversations/:conversationId/typing` - 发送输入状态
```typescript
{
  message: "状态已发送"
}
```

---

### 9. Messages 消息 (9 个)

#### #60 POST `/api/im/messages` - 发送消息
```typescript
{
  id: string,
  conversationId: string,
  senderId: string,
  type: "text" | "image" | "audio" | "video" | "file" | "location" | "system",
  content: string | null,
  mediaUrl: string | null,
  mediaDuration: number | null,
  replyToId: string | null,
  isRecalled: false,
  recalledAt: null,
  createdAt: Date,
  updatedAt: Date
}
```

#### #61 GET `/api/im/messages/conversation/:conversationId` - 获取会话消息列表
```typescript
[
  {
    id: string,
    conversationId: string,
    senderId: string | null,
    type: "text" | "image" | "audio" | "video" | "file" | "location" | "system",
    content: string | null,
    mediaUrl: string | null,
    mediaDuration: number | null,
    replyToId: string | null,
    isRecalled: boolean,
    createdAt: Date,
    sender: {
      id: string,
      name: string,
      avatar: string | null
    } | null
  }
]
```

#### #62 GET `/api/im/messages/:messageId` - 获取消息详情
```typescript
{
  id: string,
  conversationId: string,
  senderId: string | null,
  type: "text" | "image" | "audio" | "video" | "file" | "location" | "system",
  content: string | null,
  mediaUrl: string | null,
  mediaDuration: number | null,
  replyToId: string | null,
  isRecalled: boolean,
  recalledAt: Date | null,
  createdAt: Date,
  updatedAt: Date,
  sender: {
    id: string,
    name: string,
    avatar: string | null
  } | null,
  replyTo: {
    id: string,
    content: string | null,
    type: string
  } | null
}
```

#### #63 POST `/api/im/messages/:messageId/recall` - 撤回消息
```typescript
{
  id: string,
  conversationId: string,
  senderId: string,
  type: "text" | "image" | "audio" | "video" | "file" | "location" | "system",
  content: null,
  mediaUrl: null,
  mediaDuration: null,
  replyToId: string | null,
  isRecalled: true,
  recalledAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### #64 POST `/api/im/messages/:messageId/forward` - 转发消息
```typescript
[
  {
    id: string,
    conversationId: string,
    senderId: string,
    type: "text" | "image" | "audio" | "video" | "file" | "location" | "system",
    content: string | null,
    mediaUrl: string | null,
    mediaDuration: number | null,
    replyToId: null,
    isRecalled: false,
    recalledAt: null,
    createdAt: Date,
    updatedAt: Date
  }
]
```

#### #65 POST `/api/im/messages/conversation/:conversationId/read` - 标记消息已读
```typescript
{
  message: "标记成功"
}
```

#### #66 POST `/api/im/messages/search` - 搜索消息
```typescript
{
  messages: [
    {
      id: string,
      conversationId: string,
      senderId: string | null,
      type: "text" | "image" | "audio" | "video" | "file" | "location" | "system",
      content: string | null,
      mediaUrl: string | null,
      createdAt: Date,
      conversation: {
        id: string,
        type: "private" | "group"
      }
    }
  ],
  total: number,
  hasMore: boolean
}
```

#### #67 POST `/api/im/messages/:messageId/delivered` - 标记消息已送达
```typescript
{
  message: "标记成功"
}
```

#### #68 POST `/api/im/messages/batch-delivered` - 批量标记消息已送达
```typescript
{
  message: "批量标记成功"
}
```

---

### 10. Calls 通话 (8 个)

#### #69 GET `/api/im/calls` - 获取我的通话记录列表
```typescript
{
  list: [
    {
      id: string,
      conversationId: string,
      callerId: string,
      calleeId: string,
      status: "initiated" | "ringing" | "connected" | "ended" | "rejected" | "missed" | "timeout",
      startedAt: Date | null,
      endedAt: Date | null,
      duration: number | null,
      createdAt: Date,
      caller: {
        id: string,
        name: string,
        avatar: string | null
      },
      callee: {
        id: string,
        name: string,
        avatar: string | null
      }
    }
  ],
  total: number,
  page: number,
  limit: number
}
```

#### #70 POST `/api/im/calls/initiate` - 发起通话
```typescript
{
  id: string,
  conversationId: string,
  callerId: string,
  calleeId: string,
  status: "initiated",
  startedAt: null,
  endedAt: null,
  duration: null,
  endReason: null,
  createdAt: Date,
  updatedAt: Date
}
```

#### #71 GET `/api/im/calls/:callId` - 获取通话详情
```typescript
{
  id: string,
  conversationId: string,
  callerId: string,
  calleeId: string,
  status: "initiated" | "ringing" | "connected" | "ended" | "rejected" | "missed" | "timeout",
  startedAt: Date | null,
  endedAt: Date | null,
  duration: number | null,
  endReason: "normal" | "busy" | "declined" | "timeout" | "error" | null,
  createdAt: Date,
  updatedAt: Date,
  caller: {
    id: string,
    name: string,
    avatar: string | null
  },
  callee: {
    id: string,
    name: string,
    avatar: string | null
  }
}
```

#### #72 POST `/api/im/calls/:callId/ring` - 响铃
```typescript
{
  id: string,
  conversationId: string,
  callerId: string,
  calleeId: string,
  status: "ringing",
  startedAt: null,
  endedAt: null,
  duration: null,
  endReason: null,
  createdAt: Date,
  updatedAt: Date
}
```

#### #73 POST `/api/im/calls/:callId/accept` - 接听通话
```typescript
{
  id: string,
  conversationId: string,
  callerId: string,
  calleeId: string,
  status: "connected",
  startedAt: Date,
  endedAt: null,
  duration: null,
  endReason: null,
  createdAt: Date,
  updatedAt: Date
}
```

#### #74 POST `/api/im/calls/:callId/reject` - 拒接通话
```typescript
{
  id: string,
  conversationId: string,
  callerId: string,
  calleeId: string,
  status: "rejected",
  startedAt: null,
  endedAt: Date,
  duration: null,
  endReason: "declined",
  createdAt: Date,
  updatedAt: Date
}
```

#### #75 POST `/api/im/calls/:callId/hangup` - 挂断通话
```typescript
{
  id: string,
  conversationId: string,
  callerId: string,
  calleeId: string,
  status: "ended",
  startedAt: Date | null,
  endedAt: Date,
  duration: number | null,
  endReason: "normal",
  createdAt: Date,
  updatedAt: Date
}
```

#### #76 POST `/api/im/calls/:callId/signal` - 发送 WebRTC 信令
```typescript
{
  message: "信令已发送"
}
```

---

### 11. Presence 在线状态 (4 个)

#### #77 GET `/api/im/presence/check/:userId` - 检查单个用户是否在线
```typescript
{
  userId: string,
  isOnline: boolean
}
```

#### #78 GET `/api/im/presence/status/:userId` - 获取单个用户详细在线状态
```typescript
{
  userId: string,
  isOnline: boolean,
  lastActiveAt: Date | null,
  deviceCount: number,
  devices: [
    {
      id: string,
      platform: "ios" | "android" | "web" | "desktop",
      deviceName: string | null,
      lastActiveAt: Date | null
    }
  ]
}
```

#### #79 POST `/api/im/presence/batch` - 批量获取用户在线状态
```typescript
{
  [userId: string]: {
    isOnline: boolean,
    lastActiveAt: Date | null
  }
}
```

#### #80 GET `/api/im/presence/friends` - 获取好友的在线状态
```typescript
[
  {
    userId: string,
    isOnline: boolean,
    lastActiveAt: Date | null
  }
]
```

---

### 12. Media 媒体文件 (4 个)

#### #81 POST `/api/im/media/upload` - 上传单个媒体文件
```typescript
{
  id: string,
  type: "image" | "audio" | "video" | "file",
  url: string,
  filename: string,
  originalName: string,
  mimeType: string,
  size: number,
  uploadedAt: Date
}
```

#### #82 POST `/api/im/media/upload/multiple` - 上传多个媒体文件
```typescript
[
  {
    id: string,
    type: "image" | "audio" | "video" | "file",
    url: string,
    filename: string,
    originalName: string,
    mimeType: string,
    size: number,
    uploadedAt: Date
  }
]
```

#### #83 DELETE `/api/im/media/:type/:filename` - 删除媒体文件
```typescript
{
  message: "文件已删除"
}
```

#### #84 GET `/api/im/media/limits` - 获取上传限制配置
```typescript
{
  allowedTypes: [
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "audio/mpeg", "audio/wav", "audio/ogg", "audio/webm", "audio/m4a", "audio/aac",
    "video/mp4", "video/webm", "video/quicktime",
    "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip", "text/plain"
  ],
  sizeLimits: {
    image: 10485760,   // 10MB
    audio: 20971520,   // 20MB
    video: 104857600,  // 100MB
    file: 52428800     // 50MB
  },
  maxFiles: 9
}
```

---

## 统计汇总

| 模块 | API 数量 | 编号范围 |
|------|----------|----------|
| Auth 认证 | 4 | #1-#4 |
| Users 用户 | 7 | #5-#11 |
| Devices 设备 | 8 | #12-#19 |
| Friends 好友 | 10 | #20-#29 |
| Friend Requests CRUD | 5 | #30-#34 |
| Groups 群组 | 14 | #35-#48 |
| Group Members CRUD | 5 | #49-#53 |
| Conversations 会话 | 6 | #54-#59 |
| Messages 消息 | 9 | #60-#68 |
| Calls 通话 | 8 | #69-#76 |
| Presence 在线状态 | 4 | #77-#80 |
| Media 媒体文件 | 4 | #81-#84 |
| **总计** | **84** | **#1-#84** |
