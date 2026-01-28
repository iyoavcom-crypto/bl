# API 文档与代码对比分析报告

> 分析时间：2026-01-25

---

## 一、文档与代码一致性检查

### 1. 枚举常量差异

| 枚举 | 文档值 | 代码值 | 状态 |
|------|--------|--------|------|
| GroupJoinMode | free/approval/invite | **open**/approval/invite | **不一致** |
| FriendRequestStatus | pending/accepted/rejected | pending/accepted/rejected/**ignored** | **代码多一个值** |

**修正建议**：
- `GroupJoinMode.free` 应改为 `open`（代码为准）
- `FriendRequestStatus` 文档应补充 `ignored` 状态

---

### 2. HTTP API 路由对比

#### 认证模块 `/api/auth`

| 文档接口 | 代码路由 | 状态 |
|----------|----------|------|
| POST /register | `router.post("/register", register)` | 一致 |
| POST /login | `router.post("/login", login)` | 一致 |
| POST /logout | `router.post("/logout", requireAuth, logout)` | 一致 |
| GET /me | `router.get("/me", requireAuth, me)` | 一致 |

#### 用户模块 `/api/im/users`

| 文档接口 | 代码路由 | 状态 |
|----------|----------|------|
| GET /profile | `router.get("/profile", ...)` | 一致 |
| PUT /profile | `router.put("/profile", ...)` | 一致 |
| POST /change-password | `router.post("/change-password", ...)` | 一致 |
| POST /change-pin | `router.post("/change-pin", ...)` | 一致 |
| POST /verify-pin | `router.post("/verify-pin", ...)` | 一致 |
| GET /search | `router.get("/search", ...)` | 一致 |
| GET /:userId | `router.get("/:userId", ...)` | 一致 |

#### 设备模块 `/api/im/devices`

| 文档接口 | 代码路由 | 状态 |
|----------|----------|------|
| GET / | `router.get("/", ...)` | 一致 |
| POST /register | `router.post("/register", ...)` | 一致 |
| GET /:deviceId | `router.get("/:deviceId", ...)` | 一致 |
| PUT /:deviceId | `router.put("/:deviceId", ...)` | 一致 |
| DELETE /:deviceId | `router.delete("/:deviceId", ...)` | 一致 |
| POST /:deviceId/push-token | `router.post("/:deviceId/push-token", ...)` | 一致 |
| POST /:deviceId/heartbeat | `router.post("/:deviceId/heartbeat", ...)` | 一致 |
| POST /:deviceId/offline | `router.post("/:deviceId/offline", ...)` | 一致 |

#### 好友模块 `/api/im/friends`

| 文档接口 | 代码路由 | 状态 |
|----------|----------|------|
| GET / | `router.get("/", ...)` | 一致 |
| GET /:userId | `router.get("/:userId", ...)` | 一致 |
| PUT /:userId | `router.put("/:userId", ...)` | 一致 |
| DELETE /:userId | `router.delete("/:userId", ...)` | 一致 |
| POST /requests | `router.post("/requests", ...)` | 一致 |
| GET /requests/received | `router.get("/requests/received", ...)` | 一致 |
| GET /requests/sent | `router.get("/requests/sent", ...)` | 一致 |
| POST /requests/:requestId/accept | `router.post("/requests/:requestId/accept", ...)` | 一致 |
| POST /requests/:requestId/reject | `router.post("/requests/:requestId/reject", ...)` | 一致 |
| GET /check/:userId | `router.get("/check/:userId", ...)` | 一致 |

#### 群组模块 `/api/im/groups`

| 文档接口 | 代码路由 | 状态 |
|----------|----------|------|
| GET / | `router.get("/", ...)` | 一致 |
| POST / | `router.post("/", ...)` | 一致 |
| GET /:groupId | `router.get("/:groupId", ...)` | 一致 |
| PUT /:groupId | `router.put("/:groupId", ...)` | 一致 |
| DELETE /:groupId | `router.delete("/:groupId", ...)` | 一致 |
| GET /:groupId/members | `router.get("/:groupId/members", ...)` | 一致 |
| POST /:groupId/invite | `router.post("/:groupId/invite", ...)` | 一致 |
| POST /:groupId/kick/:userId | `router.post("/:groupId/kick/:userId", ...)` | 一致 |
| POST /:groupId/leave | `router.post("/:groupId/leave", ...)` | 一致 |
| POST /:groupId/transfer | `router.post("/:groupId/transfer", ...)` | 一致 |
| POST /:groupId/admin/:userId | `router.post("/:groupId/admin/:userId", ...)` | 一致 |
| DELETE /:groupId/admin/:userId | `router.delete("/:groupId/admin/:userId", ...)` | 一致 |
| POST /:groupId/mute/:userId | `router.post("/:groupId/mute/:userId", ...)` | 一致 |
| DELETE /:groupId/mute/:userId | `router.delete("/:groupId/mute/:userId", ...)` | 一致 |

#### 会话模块 `/api/im/conversations`

| 文档接口 | 代码路由 | 状态 |
|----------|----------|------|
| GET / | `router.get("/", ...)` | 一致 |
| POST /private | `router.post("/private", ...)` | 一致 |
| GET /:conversationId | `router.get("/:conversationId", ...)` | 一致 |
| DELETE /:conversationId | `router.delete("/:conversationId", ...)` | 一致 |
| POST /:conversationId/clear-unread | `router.post("/:conversationId/clear-unread", ...)` | 一致 |

#### 消息模块 `/api/im/messages`

| 文档接口 | 代码路由 | 状态 |
|----------|----------|------|
| POST / | `router.post("/", ...)` | 一致 |
| GET /conversation/:conversationId | `router.get("/conversation/:conversationId", ...)` | 一致 |
| GET /:messageId | `router.get("/:messageId", ...)` | 一致 |
| POST /:messageId/recall | `router.post("/:messageId/recall", ...)` | 一致 |
| POST /:messageId/forward | `router.post("/:messageId/forward", ...)` | 一致 |
| POST /conversation/:conversationId/read | `router.post("/conversation/:conversationId/read", ...)` | 一致 |

#### 通话模块 `/api/im/calls`

| 文档接口 | 代码路由 | 状态 |
|----------|----------|------|
| GET / | `router.get("/", ...)` | 一致 |
| POST /initiate | `router.post("/initiate", ...)` | 一致 |
| GET /:callId | `router.get("/:callId", ...)` | 一致 |
| POST /:callId/ring | `router.post("/:callId/ring", ...)` | 一致 |
| POST /:callId/accept | `router.post("/:callId/accept", ...)` | 一致 |
| POST /:callId/reject | `router.post("/:callId/reject", ...)` | 一致 |
| POST /:callId/hangup | `router.post("/:callId/hangup", ...)` | 一致 |

#### 在线状态模块 `/api/im/presence`

| 文档接口 | 代码路由 | 状态 |
|----------|----------|------|
| GET /check/:userId | `router.get("/check/:userId", ...)` | 一致 |
| GET /status/:userId | `router.get("/status/:userId", ...)` | 一致 |
| POST /batch | `router.post("/batch", ...)` | 一致 |
| GET /friends | `router.get("/friends", ...)` | 一致 |

---

### 3. WebSocket 事件对比

| 文档事件类型 | 代码常量 | 状态 |
|--------------|----------|------|
| connected | WsEventType.CONNECTED | 一致 |
| message:new | WsEventType.MESSAGE_NEW | 一致 |
| message:recalled | WsEventType.MESSAGE_RECALLED | 一致 |
| message:read | WsEventType.MESSAGE_READ | 一致 |
| call:invite | WsEventType.CALL_INVITE | 一致 |
| call:ring | WsEventType.CALL_RING | 一致 |
| call:answer | WsEventType.CALL_ANSWER | 一致 |
| call:reject | WsEventType.CALL_REJECT | 一致 |
| call:end | WsEventType.CALL_END | 一致 |
| presence:online | WsEventType.PRESENCE_ONLINE | 一致 |
| presence:offline | WsEventType.PRESENCE_OFFLINE | 一致 |
| kick | WsEventType.KICK | 一致 |
| error | WsEventType.ERROR | 一致 |
| heartbeat:ack | WsEventType.HEARTBEAT_ACK | **文档遗漏** |

---

### 4. Payload 结构对比

#### 新消息事件

| 字段 | 文档 | 代码 | 状态 |
|------|------|------|------|
| conversationId | 有 | 有 | 一致 |
| message | 扁平字段 | 嵌套对象 | **结构不同** |

**文档描述**：
```json
{
  "messageId": "...",
  "conversationId": "...",
  "senderId": "...",
  ...
}
```

**代码实际**：
```json
{
  "conversationId": "...",
  "message": { /* MessageAttributes */ }
}
```

#### 在线状态事件

| 字段 | 文档 | 代码 | 状态 |
|------|------|------|------|
| userId | 有 | 有 | 一致 |
| deviceId | 有 | 有 | 一致 |
| onlineAt/offlineAt | 无 | 有 | **文档遗漏** |

---

## 二、项目完整性分析

### 1. 已实现功能清单

| 模块 | 功能 | 状态 | 备注 |
|------|------|------|------|
| **认证** | 注册/登录/退出/获取当前用户 | 完成 | |
| **用户** | 资料管理/搜索/密码修改/PIN管理 | 完成 | |
| **设备** | 注册/心跳/推送令牌/多设备管理 | 完成 | |
| **好友** | 申请/接受/拒绝/删除/拉黑/置顶 | 完成 | |
| **群组** | 创建/解散/邀请/踢人/禁言/管理员 | 完成 | |
| **会话** | 私聊/群聊/列表/删除/清未读 | 完成 | |
| **消息** | 发送/撤回/转发/已读标记 | 完成 | |
| **通话** | 发起/响铃/接听/拒接/挂断 | 完成 | |
| **在线状态** | 查询/批量查询/好友状态 | 完成 | |
| **WebSocket** | 连接/心跳/事件推送 | 完成 | |
| **定时任务** | 通话超时处理 | 完成 | |
| **Redis** | 跨实例推送/在线状态同步 | 完成 | 可选 |

### 2. 测试覆盖

| 测试类型 | 用例数 | 状态 |
|----------|--------|------|
| JWT 单元测试 | 29 | 通过 |
| Auth E2E 测试 | 19 | 通过 |
| IM 模块 E2E 测试 | 48 | 通过 |
| **总计** | **96** | **全部通过** |

### 3. 待完善功能

| 优先级 | 功能 | 说明 |
|--------|------|------|
| P1 | 文件上传 | 图片/语音/文件上传接口（当前仅存 URL） |
| P1 | 消息搜索 | 按关键词搜索历史消息 |
| P2 | 离线推送 | APNs/FCM/Expo 集成 |
| P2 | 敏感词过滤 | 消息内容审核 |
| P3 | 令牌刷新 | Refresh Token 轮转接口 |

### 4. 代码质量

| 指标 | 状态 |
|------|------|
| TypeScript 严格模式 | 启用 |
| ESM 规范 | 遵守 |
| 无 any 类型 | 遵守 |
| 显式类型标注 | 遵守 |
| 构建无错误 | 通过 |

---

## 三、需修正的文档问题

### 修正清单

1. **GroupJoinMode 枚举**：`free` → `open`
2. **FriendRequestStatus 枚举**：补充 `ignored` 状态
3. **WebSocket 事件**：补充 `heartbeat:ack` 事件
4. **新消息事件 Payload**：修正为嵌套结构 `{ conversationId, message }`
5. **在线状态事件**：补充 `onlineAt`/`offlineAt` 字段

---

## 四、结论

| 项目 | 评估 |
|------|------|
| **文档与代码一致性** | 95%（存在少量枚举和 Payload 差异） |
| **功能完整性** | 90%（核心功能完整，缺少文件上传等辅助功能） |
| **测试覆盖** | 96 用例全部通过 |
| **可上线状态** | 基础功能可用，建议补充文件上传后发布 |
