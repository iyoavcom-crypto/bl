# IM 系统实现规划

> 版本：1.0.0 | 更新：2026-01-25

## 一、实现阶段总览

```
Phase 1: 基础模型层
├── 1.1 Device 模型
├── 1.2 Friend + FriendRequest 模型
├── 1.3 Group + GroupMember 模型
├── 1.4 Conversation 模型
├── 1.5 Message + MessageRead 模型
├── 1.6 Call 模型
└── 1.7 User 模型扩展

Phase 2: 服务层
├── 2.1 Device 服务
├── 2.2 Friend 服务
├── 2.3 Group 服务
├── 2.4 Conversation 服务
├── 2.5 Message 服务
├── 2.6 Call 服务
└── 2.7 禁言校验服务

Phase 3: API 路由层
├── 3.1 设备管理 API
├── 3.2 好友关系 API
├── 3.3 群组管理 API
├── 3.4 会话管理 API
├── 3.5 消息 API
└── 3.6 通话 API

Phase 4: 实时通讯层
├── 4.1 WebSocket 服务
├── 4.2 消息推送
├── 4.3 通话信令
└── 4.4 在线状态

Phase 5: 推送集成
├── 5.1 Expo Push 集成
├── 5.2 APNs 配置
└── 5.3 离线推送逻辑
```

---

## 二、Phase 1: 基础模型层

### 1.1 Device 模型

**目录结构**：
```
src/models/device/
├── index.ts
├── device.ts
├── association.ts
├── hook.ts
└── types/
    ├── index.ts
    ├── const.ts
    └── device.ts
```

**依赖**：User 模型

**实现内容**：
| 文件 | 内容 |
|------|------|
| types/const.ts | DevicePlatform, PushProvider 枚举 |
| types/device.ts | DeviceAttributes, DeviceCreationAttributes, 6个字段常量 |
| device.ts | Device 模型定义，initDevice() |
| association.ts | associateDevice() - belongsTo User |
| hook.ts | beforeCreate 生成 UUID, afterUpdate 更新 User.lastOnlineAt |
| index.ts | 统一导出 |

---

### 1.2 Friend + FriendRequest 模型

**目录结构**：
```
src/models/friend/
├── index.ts
├── friend.ts
├── association.ts
├── hook.ts
└── types/
    ├── index.ts
    ├── const.ts
    └── friend.ts

src/models/friend-request/
├── index.ts
├── friend-request.ts
├── association.ts
├── hook.ts
└── types/
    ├── index.ts
    ├── const.ts
    └── friend-request.ts
```

**依赖**：User 模型

**实现内容**：

| 模型 | 枚举 | 钩子 |
|------|------|------|
| Friend | FriendSource | beforeCreate 验证, afterCreate 创建 Conversation |
| FriendRequest | FriendRequestStatus | beforeCreate 检查, beforeUpdate 创建双向 Friend |

---

### 1.3 Group + GroupMember 模型

**目录结构**：
```
src/models/group/
├── index.ts
├── group.ts
├── association.ts
├── hook.ts
└── types/
    ├── index.ts
    ├── const.ts
    └── group.ts

src/models/group-member/
├── index.ts
├── group-member.ts
├── association.ts
├── hook.ts
└── types/
    ├── index.ts
    ├── const.ts
    └── group-member.ts
```

**依赖**：User 模型

**实现内容**：

| 模型 | 枚举 | 钩子 |
|------|------|------|
| Group | GroupJoinMode | afterCreate 创建群主 Member + Conversation |
| GroupMember | GroupMemberRole | afterCreate/Destroy 更新 memberCount |

---

### 1.4 Conversation 模型

**目录结构**：
```
src/models/conversation/
├── index.ts
├── conversation.ts
├── association.ts
├── hook.ts
└── types/
    ├── index.ts
    ├── const.ts
    └── conversation.ts
```

**依赖**：User, Group, Message 模型

**实现内容**：

| 文件 | 内容 |
|------|------|
| types/const.ts | ConversationType 枚举 |
| hook.ts | beforeCreate 验证 type 与外键一致性 |

---

### 1.5 Message + MessageRead 模型

**目录结构**：
```
src/models/message/
├── index.ts
├── message.ts
├── association.ts
├── hook.ts
└── types/
    ├── index.ts
    ├── const.ts
    └── message.ts

src/models/message-read/
├── index.ts
├── message-read.ts
├── association.ts
├── hook.ts
└── types/
    ├── index.ts
    └── message-read.ts
```

**依赖**：Conversation, User 模型

**实现内容**：

| 模型 | 枚举 | 钩子 |
|------|------|------|
| Message | MessageType | beforeCreate 验证语音时长, afterCreate 更新 Conversation |
| MessageRead | - | beforeCreate 防重复 |

---

### 1.6 Call 模型

**目录结构**：
```
src/models/call/
├── index.ts
├── call.ts
├── association.ts
├── hook.ts
└── types/
    ├── index.ts
    ├── const.ts
    └── call.ts
```

**依赖**：Conversation, User 模型

**实现内容**：

| 文件 | 内容 |
|------|------|
| types/const.ts | CallStatus, CallEndReason 枚举 |
| hook.ts | beforeCreate 验证私聊, beforeUpdate 计算 duration |

---

### 1.7 User 模型扩展

**修改文件**：
```
src/models/user/
├── types/user.ts     # 新增 privateMuted, privateMuteUntil 字段
├── user.ts           # 新增字段定义
└── association.ts    # 新增 IM 相关关联
```

---

### 1.8 模型初始化顺序

**修改文件**：`src/models/index.ts`

```typescript
// 初始化顺序（按依赖关系）
1. Role
2. User (扩展字段)
3. Device
4. Friend
5. FriendRequest
6. Group
7. GroupMember
8. Conversation
9. Message
10. MessageRead
11. Call

// 关联注册顺序
同上
```

---

## 三、Phase 2: 服务层

### 2.1 Device 服务

**文件**：`src/services/device.ts`

| 方法 | 功能 |
|------|------|
| register() | 注册/更新设备 |
| updatePushToken() | 更新推送 token |
| setOnline() | 设置在线状态 |
| setDoNotDisturb() | 设置勿扰模式 |
| getUserDevices() | 获取用户所有设备 |
| getOnlineDevices() | 获取用户在线设备 |
| removeDevice() | 移除设备 |

---

### 2.2 Friend 服务

**文件**：`src/services/friend.ts`

| 方法 | 功能 |
|------|------|
| sendRequest() | 发送好友请求 |
| acceptRequest() | 接受好友请求 |
| rejectRequest() | 拒绝好友请求 |
| ignoreRequest() | 忽略好友请求 |
| removeFriend() | 删除好友 |
| blockFriend() | 拉黑好友 |
| unblockFriend() | 解除拉黑 |
| setAlias() | 设置备注 |
| getFriends() | 获取好友列表 |
| getPendingRequests() | 获取待处理请求 |

---

### 2.3 Group 服务

**文件**：`src/services/group.ts`

| 方法 | 功能 |
|------|------|
| create() | 创建群组 |
| update() | 更新群信息 |
| dissolve() | 解散群组 |
| transferOwner() | 转让群主 |
| addMember() | 添加成员 |
| removeMember() | 移除成员 |
| setAdmin() | 设置管理员 |
| muteMember() | 禁言成员 |
| unmuteMember() | 解除禁言 |
| setMuteAll() | 设置全员禁言 |
| leave() | 退出群组 |
| getMembers() | 获取成员列表 |
| getMyGroups() | 获取我的群组 |

---

### 2.4 Conversation 服务

**文件**：`src/services/conversation.ts`

| 方法 | 功能 |
|------|------|
| getList() | 获取会话列表 |
| getDetail() | 获取会话详情 |
| delete() | 删除会话 |
| getUnreadCount() | 获取未读数 |
| markAsRead() | 标记已读 |

---

### 2.5 Message 服务

**文件**：`src/services/message.ts`

| 方法 | 功能 |
|------|------|
| send() | 发送消息 |
| recall() | 撤回消息 |
| getHistory() | 获取历史消息 |
| forward() | 转发消息 |
| markAsRead() | 标记已读 |
| getReadReceipts() | 获取已读回执 |

---

### 2.6 Call 服务

**文件**：`src/services/call.ts`

| 方法 | 功能 |
|------|------|
| initiate() | 发起通话 |
| ring() | 响铃 |
| accept() | 接听 |
| reject() | 拒绝 |
| hangup() | 挂断 |
| timeout() | 超时处理 |
| getHistory() | 获取通话记录 |

---

### 2.7 禁言校验服务

**文件**：`src/services/mute-check.ts`

| 方法 | 功能 |
|------|------|
| checkGlobalMute() | 检查全局禁言 (User.state) |
| checkPrivateMute() | 检查私聊禁言 |
| checkGroupMute() | 检查群禁言（全员+个人） |
| canSendMessage() | 综合校验能否发送消息 |
| isMuteExpired() | 检查禁言是否过期 |

---

## 四、Phase 3: API 路由层

### 路由结构

```
src/routes/
├── index.ts              # 路由聚合
├── im/
│   ├── index.ts
│   ├── device.ts         # /api/im/devices
│   ├── friend.ts         # /api/im/friends
│   ├── group.ts          # /api/im/groups
│   ├── conversation.ts   # /api/im/conversations
│   ├── message.ts        # /api/im/messages
│   └── call.ts           # /api/im/calls
```

### 3.1 设备管理 API

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | /api/im/devices | 注册设备 |
| PUT | /api/im/devices/:id | 更新设备 |
| PUT | /api/im/devices/:id/push-token | 更新推送 token |
| PUT | /api/im/devices/:id/online | 设置在线状态 |
| PUT | /api/im/devices/:id/dnd | 设置勿扰 |
| GET | /api/im/devices | 获取我的设备 |
| DELETE | /api/im/devices/:id | 移除设备 |

---

### 3.2 好友关系 API

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | /api/im/friends/requests | 发送好友请求 |
| GET | /api/im/friends/requests | 获取好友请求列表 |
| PUT | /api/im/friends/requests/:id/accept | 接受请求 |
| PUT | /api/im/friends/requests/:id/reject | 拒绝请求 |
| PUT | /api/im/friends/requests/:id/ignore | 忽略请求 |
| GET | /api/im/friends | 获取好友列表 |
| DELETE | /api/im/friends/:id | 删除好友 |
| PUT | /api/im/friends/:id/block | 拉黑 |
| PUT | /api/im/friends/:id/unblock | 解除拉黑 |
| PUT | /api/im/friends/:id/alias | 设置备注 |

---

### 3.3 群组管理 API

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | /api/im/groups | 创建群组 |
| GET | /api/im/groups | 获取我的群组 |
| GET | /api/im/groups/:id | 获取群详情 |
| PUT | /api/im/groups/:id | 更新群信息 |
| DELETE | /api/im/groups/:id | 解散群组 |
| PUT | /api/im/groups/:id/transfer | 转让群主 |
| POST | /api/im/groups/:id/members | 添加成员 |
| DELETE | /api/im/groups/:id/members/:userId | 移除成员 |
| PUT | /api/im/groups/:id/members/:userId/admin | 设置管理员 |
| PUT | /api/im/groups/:id/members/:userId/mute | 禁言成员 |
| PUT | /api/im/groups/:id/mute-all | 全员禁言 |
| POST | /api/im/groups/:id/leave | 退出群组 |
| GET | /api/im/groups/:id/members | 获取成员列表 |

---

### 3.4 会话管理 API

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /api/im/conversations | 获取会话列表 |
| GET | /api/im/conversations/:id | 获取会话详情 |
| DELETE | /api/im/conversations/:id | 删除会话 |
| PUT | /api/im/conversations/:id/read | 标记已读 |

---

### 3.5 消息 API

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | /api/im/messages | 发送消息 |
| GET | /api/im/conversations/:id/messages | 获取历史消息 |
| PUT | /api/im/messages/:id/recall | 撤回消息 |
| POST | /api/im/messages/:id/forward | 转发消息 |
| GET | /api/im/messages/:id/read-receipts | 获取已读回执 |

---

### 3.6 通话 API

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | /api/im/calls | 发起通话 |
| PUT | /api/im/calls/:id/accept | 接听 |
| PUT | /api/im/calls/:id/reject | 拒绝 |
| PUT | /api/im/calls/:id/hangup | 挂断 |
| GET | /api/im/calls | 获取通话记录 |

---

## 五、Phase 4: 实时通讯层

### 4.1 WebSocket 服务

**文件结构**：
```
src/ws/
├── index.ts              # WebSocket 服务入口
├── server.ts             # WebSocketServer 初始化
├── auth.ts               # 连接认证
├── connection.ts         # 连接管理
├── handlers/
│   ├── index.ts
│   ├── message.ts        # 消息处理
│   ├── call.ts           # 通话信令
│   └── presence.ts       # 在线状态
└── types/
    ├── index.ts
    └── events.ts         # 事件类型定义
```

### WebSocket 事件定义

```typescript
// 客户端 → 服务端
type ClientEvent =
  | 'message:send'        // 发送消息
  | 'message:read'        // 已读确认
  | 'call:initiate'       // 发起通话
  | 'call:accept'         // 接听
  | 'call:reject'         // 拒绝
  | 'call:hangup'         // 挂断
  | 'rtc:offer'           // WebRTC Offer
  | 'rtc:answer'          // WebRTC Answer
  | 'rtc:candidate'       // ICE Candidate
  | 'presence:heartbeat'; // 心跳

// 服务端 → 客户端
type ServerEvent =
  | 'message:new'         // 新消息
  | 'message:recalled'    // 消息撤回
  | 'message:read'        // 已读回执
  | 'call:incoming'       // 来电
  | 'call:ringing'        // 响铃
  | 'call:accepted'       // 已接听
  | 'call:rejected'       // 已拒绝
  | 'call:ended'          // 已结束
  | 'rtc:offer'           // WebRTC Offer
  | 'rtc:answer'          // WebRTC Answer
  | 'rtc:candidate'       // ICE Candidate
  | 'presence:online'     // 用户上线
  | 'presence:offline';   // 用户离线
```

---

### 4.2 消息推送

**实现逻辑**：
```
1. 发送消息 → MessageService.send()
2. 查询接收者在线设备 → DeviceService.getOnlineDevices()
3. 在线设备 → WebSocket 推送
4. 离线设备 → 推送队列 → Expo Push / APNs
```

---

### 4.3 通话信令

**实现逻辑**：
```
1. 发起通话 → CallService.initiate()
2. 检查 callee 在线状态
3. 在线 → WebSocket 推送 call:incoming
4. 离线 → 推送 VoIP 通知 (APNs)
5. WebRTC 协商 → 中转 offer/answer/candidate
```

---

### 4.4 在线状态

**Redis 存储**：
```
user:{userId}:online = "1"  (TTL 60s)
user:{userId}:devices = Set<deviceId>
```

**心跳机制**：
- 客户端每 30s 发送 heartbeat
- 服务端刷新 Redis TTL
- 断开连接 → 移除 device，检查是否全部离线

---

## 六、Phase 5: 推送集成

### 5.1 Expo Push 集成

**文件**：`src/services/push/expo.ts`

```typescript
// 依赖：expo-server-sdk
interface ExpoPushService {
  send(tokens: string[], message: PushMessage): Promise<void>;
  handleReceipts(): Promise<void>;
}
```

---

### 5.2 APNs 配置

**文件**：`src/services/push/apns.ts`

```typescript
// 依赖：node-apn 或通过 Expo Push 中转
// VoIP 推送需要单独的证书
interface ApnsService {
  sendNotification(token: string, payload: ApnsPayload): Promise<void>;
  sendVoipPush(token: string, callData: CallPayload): Promise<void>;
}
```

---

### 5.3 离线推送逻辑

**文件**：`src/services/push/index.ts`

```typescript
interface PushService {
  // 消息推送
  pushMessage(userId: string, message: Message): Promise<void>;
  
  // 通话推送
  pushCall(userId: string, call: Call): Promise<void>;
  
  // 好友请求推送
  pushFriendRequest(userId: string, request: FriendRequest): Promise<void>;
}
```

---

## 七、实现优先级

### P0 - 核心功能（必须）

1. Device 模型 + 服务 + API
2. Friend/FriendRequest 模型 + 服务 + API
3. Group/GroupMember 模型 + 服务 + API
4. Conversation 模型 + 服务 + API
5. Message/MessageRead 模型 + 服务 + API
6. User 扩展（privateMuted）
7. 禁言校验服务

### P1 - 实时功能（重要）

8. WebSocket 服务
9. 消息实时推送
10. 在线状态

### P2 - 通话功能（增强）

11. Call 模型 + 服务 + API
12. 通话信令

### P3 - 推送集成（完善）

13. Expo Push 集成
14. APNs VoIP 推送

---

## 八、依赖安装

```bash
# 推送相关
npm install expo-server-sdk

# WebSocket（已有）
# ws 8.18.3

# 可选：APNs 原生支持
npm install @parse/node-apn
```

---

## 九、环境变量新增

```env
# WebSocket（已有）
WS_ENABLED=true
WS_PING_INTERVAL_MS=15000
WS_IDLE_TIMEOUT_MS=45000

# Expo Push
EXPO_ACCESS_TOKEN=<your_expo_access_token>

# APNs (可选，如果不使用 Expo 中转)
APNS_KEY_ID=<key_id>
APNS_TEAM_ID=<team_id>
APNS_KEY_PATH=./certs/apns.p8
APNS_BUNDLE_ID=com.yourapp.id

# STUN/TURN
STUN_SERVER=stun:stun.l.google.com:19302
TURN_SERVER=<your_turn_server>
TURN_USERNAME=<username>
TURN_CREDENTIAL=<credential>
```

---

## 十、测试计划

### 单元测试

```
tests/unit/
├── models/
│   ├── device.test.ts
│   ├── friend.test.ts
│   ├── group.test.ts
│   ├── conversation.test.ts
│   ├── message.test.ts
│   └── call.test.ts
└── services/
    ├── mute-check.test.ts
    └── ...
```

### 集成测试

```
tests/integration/
├── friend-flow.test.ts       # 好友添加流程
├── group-flow.test.ts        # 群组创建流程
├── message-flow.test.ts      # 消息发送流程
└── call-flow.test.ts         # 通话流程
```

### E2E 测试

```
tests/e2e/
├── chat.test.ts              # 完整聊天流程
└── call.test.ts              # 完整通话流程
```
