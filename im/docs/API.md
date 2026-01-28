# IM-API 接口对接文档

> 版本：1.0.0 | 更新：2026-01-26

## 目录

- [通用说明](#%E9%80%9A%E7%94%A8%E8%AF%B4%E6%98%8E)
- [认证模块](#%E8%AE%A4%E8%AF%81%E6%A8%A1%E5%9D%97)
- [用户模块](#%E7%94%A8%E6%88%B7%E6%A8%A1%E5%9D%97)
- [设备管理](#%E8%AE%BE%E5%A4%87%E7%AE%A1%E7%90%86)
- [好友模块](#%E5%A5%BD%E5%8F%8B%E6%A8%A1%E5%9D%97)
- [群组模块](#%E7%BE%A4%E7%BB%84%E6%A8%A1%E5%9D%97)
- [会话模块](#%E4%BC%9A%E8%AF%9D%E6%A8%A1%E5%9D%97)
- [消息模块](#%E6%B6%88%E6%81%AF%E6%A8%A1%E5%9D%97)
- [通话模块](#%E9%80%9A%E8%AF%9D%E6%A8%A1%E5%9D%97)
- [在线状态](#%E5%9C%A8%E7%BA%BF%E7%8A%B6%E6%80%81)
- [媒体文件](#%E5%AA%92%E4%BD%93%E6%96%87%E4%BB%B6)
- [WebSocket 实时通信](#websocket-%E5%AE%9E%E6%97%B6%E9%80%9A%E4%BF%A1)
- [枚举常量](#%E6%9E%9A%E4%B8%BE%E5%B8%B8%E9%87%8F)
- [错误码](#%E9%94%99%E8%AF%AF%E7%A0%81)
- [Expo 客户端集成指南](#expo-%E5%AE%A2%E6%88%B7%E7%AB%AF%E9%9B%86%E6%88%90%E6%8C%87%E5%8D%97)
- [项目实施计划](project/implementation-plan.md)
- [模型文档](models/)

---

## 通用说明

### 基础信息

| 项目 | 值 |
|------|-----|
| 基础路径 | `/api` |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |
| 认证方式 | Bearer Token (JWT) |

### 请求头

```http
Content-Type: application/json
Authorization: Bearer <access_token>
```

### 通用响应格式

**成功响应**：
```json
{
  "success": true,
  "data": { ... }
}
```

**错误响应**：
```json
{
  "success": false,
  "message": "错误描述"
}
```

### 分页参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | number | 1 | 页码 |
| limit | number | 20 | 每页数量 |

---

## 认证模块

### 用户注册

```
POST /api/auth/register
```

**请求体**：
```json
{
  "phone": "13800138000",
  "password": "your_password",
  "pin": "123456"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 手机号（纯数字） |
| password | string | 是 | 密码（≥6位） |
| pin | string | 是 | 二级密码（6位数字） |

**响应**：
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1234567",
      "phone": "13800138000",
      "name": "用户昵称",
      "avatar": null,
      "gender": "unknown",
      "vip": false,
      "state": "normal",
      "createdAt": "2026-01-25T00:00:00.000Z"
    },
    "access": "<access_token>",
    "refresh": "<refresh_token>",
    "payload": {
      "sub": "1234567",
      "vip": false,
      "roleId": "user",
      "teamId": null
    }
  }
}
```

---

### 用户登录

```
POST /api/auth/login
```

**请求体**：
```json
{
  "phone": "13800138000",
  "password": "your_password"
}
```

**响应**：同注册接口

---

### 获取当前用户

```
GET /api/auth/me
```

**需要认证**：是

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "1234567",
    "phone": "13800138000",
    "name": "用户昵称",
    "avatar": null,
    "gender": "unknown",
    "vip": false,
    "state": "normal",
    "searchable": true,
    "lastOnlineAt": "2026-01-25T00:00:00.000Z"
  }
}
```

---

### 退出登录

```
POST /api/auth/logout
```

**需要认证**：是

**响应**：
```json
{
  "success": true,
  "message": "退出成功"
}
```

---

## 用户模块

### 获取个人资料

```
GET /api/im/users/profile
```

**需要认证**：是

---

### 更新个人资料

```
PUT /api/im/users/profile
```

**请求体**：
```json
{
  "name": "新昵称",
  "avatar": "https://example.com/avatar.jpg",
  "gender": "male",
  "location": {
    "country": "中国",
    "province": "广东",
    "city": "深圳"
  },
  "searchable": true
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 否 | 昵称（≤20字符） |
| avatar | string | 否 | 头像 URL |
| gender | string | 否 | 性别：male/female/unknown |
| location | object | 否 | 位置信息 |
| searchable | boolean | 否 | 是否允许被搜索 |

---

### 修改密码

```
POST /api/im/users/change-password
```

**请求体**：
```json
{
  "oldPassword": "旧密码",
  "newPassword": "新密码"
}
```

---

### 修改二级密码

```
POST /api/im/users/change-pin
```

**请求体**：
```json
{
  "password": "登录密码",
  "newPin": "654321"
}
```

---

### 验证二级密码

```
POST /api/im/users/verify-pin
```

**请求体**：
```json
{
  "pin": "123456"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "valid": true
  }
}
```

---

### 搜索用户

```
GET /api/im/users/search?keyword=关键词&limit=20
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | ID 或手机号精确匹配 |
| limit | number | 否 | 返回数量，默认20，最大50 |

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": "1234567",
      "name": "用户昵称",
      "avatar": null,
      "gender": "unknown",
      "isFriend": false,
      "hasPendingRequest": false
    }
  ]
}
```

---

### 获取用户公开信息

```
GET /api/im/users/:userId
```

---

## 设备管理

### 获取设备列表

```
GET /api/im/devices
```

---

### 注册设备

```
POST /api/im/devices/register
```

**请求体**：
```json
{
  "platform": "ios",
  "deviceId": "device-uuid",
  "deviceName": "iPhone 15",
  "pushToken": "expo-push-token",
  "pushProvider": "expo",
  "appVersion": "1.0.0",
  "osVersion": "17.0"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| platform | string | 是 | ios/android/web/macos/windows |
| deviceId | string | 是 | 设备唯一标识 |
| deviceName | string | 否 | 设备名称 |
| pushToken | string | 否 | 推送令牌 |
| pushProvider | string | 否 | apns/expo/fcm |
| appVersion | string | 否 | App 版本 |
| osVersion | string | 否 | 系统版本 |

---

### 获取设备详情

```
GET /api/im/devices/:deviceId
```

---

### 更新设备信息

```
PUT /api/im/devices/:deviceId
```

**请求体**：
```json
{
  "deviceName": "新设备名",
  "pushToken": "新推送令牌",
  "pushProvider": "expo",
  "doNotDisturb": false
}
```

---

### 删除设备

```
DELETE /api/im/devices/:deviceId
```

---

### 更新推送令牌

```
POST /api/im/devices/:deviceId/push-token
```

**请求体**：
```json
{
  "pushToken": "expo-push-token",
  "pushProvider": "expo"
}
```

---

### 设备心跳

```
POST /api/im/devices/:deviceId/heartbeat
```

**响应**：
```json
{
  "success": true,
  "data": {
    "online": true,
    "lastActiveAt": "2026-01-25T00:00:00.000Z"
  }
}
```

---

### 设备下线

```
POST /api/im/devices/:deviceId/offline
```

---

## 好友模块

### 获取好友列表

```
GET /api/im/friends?page=1&limit=20&isBlocked=false&isPinned=true
```

| 参数 | 类型 | 说明 |
|------|------|------|
| isBlocked | boolean | 筛选黑名单 |
| isPinned | boolean | 筛选置顶 |

---

### 获取好友详情

```
GET /api/im/friends/:userId
```

---

### 更新好友设置

```
PUT /api/im/friends/:userId
```

**请求体**：
```json
{
  "alias": "备注名",
  "isBlocked": false,
  "doNotDisturb": false,
  "isPinned": true
}
```

---

### 删除好友

```
DELETE /api/im/friends/:userId
```

---

### 发送好友申请

```
POST /api/im/friends/requests
```

**请求体**：
```json
{
  "toUserId": "目标用户ID",
  "message": "我是xxx",
  "source": "search"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| toUserId | string | 是 | 目标用户 ID |
| message | string | 否 | 验证消息 |
| source | string | 是 | search/qr/phone/invite |

---

### 获取收到的好友申请

```
GET /api/im/friends/requests/received?status=pending
```

| 参数 | 说明 |
|------|------|
| status | pending/accepted/rejected |

---

### 获取发出的好友申请

```
GET /api/im/friends/requests/sent?status=pending
```

---

### 接受好友申请

```
POST /api/im/friends/requests/:requestId/accept
```

---

### 拒绝好友申请

```
POST /api/im/friends/requests/:requestId/reject
```

---

### 检查是否为好友

```
GET /api/im/friends/check/:userId
```

**响应**：
```json
{
  "success": true,
  "data": {
    "isFriend": true
  }
}
```

---

## 群组模块

### 获取我的群组列表

```
GET /api/im/groups
```

---

### 创建群组

```
POST /api/im/groups
```

**请求体**：
```json
{
  "name": "群名称",
  "avatar": "https://example.com/group.jpg",
  "description": "群描述",
  "joinMode": "open",
  "memberIds": ["user1", "user2"]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 群名称 |
| avatar | string | 否 | 群头像 |
| description | string | 否 | 群描述 |
| joinMode | string | 否 | open/approval/invite |
| memberIds | string[] | 否 | 初始成员 ID 列表 |

---

### 获取群组详情

```
GET /api/im/groups/:groupId
```

---

### 更新群组信息

```
PUT /api/im/groups/:groupId
```

**请求体**：
```json
{
  "name": "新群名",
  "avatar": "新头像",
  "description": "新描述",
  "joinMode": "approval",
  "muteAll": false
}
```

---

### 解散群组

```
DELETE /api/im/groups/:groupId
```

**权限**：仅群主

---

### 获取群成员列表

```
GET /api/im/groups/:groupId/members
```

---

### 邀请成员

```
POST /api/im/groups/:groupId/invite
```

**请求体**：
```json
{
  "userIds": ["user1", "user2"]
}
```

---

### 踢出成员

```
POST /api/im/groups/:groupId/kick/:userId
```

**权限**：群主或管理员

---

### 退出群组

```
POST /api/im/groups/:groupId/leave
```

---

### 转让群主

```
POST /api/im/groups/:groupId/transfer
```

**请求体**：
```json
{
  "newOwnerId": "新群主ID"
}
```

---

### 设置管理员

```
POST /api/im/groups/:groupId/admin/:userId
```

---

### 取消管理员

```
DELETE /api/im/groups/:groupId/admin/:userId
```

---

### 禁言成员

```
POST /api/im/groups/:groupId/mute/:userId
```

**请求体**：
```json
{
  "duration": 3600
}
```

| 字段 | 说明 |
|------|------|
| duration | 禁言时长（秒），不传则永久禁言 |

---

### 解除禁言

```
DELETE /api/im/groups/:groupId/mute/:userId
```

---

## 会话模块

### 获取会话列表

```
GET /api/im/conversations
```

---

### 发起私聊

```
POST /api/im/conversations/private
```

**请求体**：
```json
{
  "targetUserId": "对方用户ID"
}
```

---

### 获取会话详情

```
GET /api/im/conversations/:conversationId
```

---

### 删除会话

```
DELETE /api/im/conversations/:conversationId
```

---

### 清空未读

```
POST /api/im/conversations/:conversationId/clear-unread
```

---

## 消息模块

### 发送消息

```
POST /api/im/messages
```

**请求体**：
```json
{
  "conversationId": "会话ID",
  "type": "text",
  "content": "消息内容",
  "mediaUrl": "https://example.com/image.jpg",
  "mediaDuration": 30,
  "replyToId": "回复的消息ID"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| conversationId | string | 是 | 会话 ID |
| type | string | 是 | text/image/voice |
| content | string | 否 | 文本内容 |
| mediaUrl | string | 否 | 媒体文件 URL |
| mediaDuration | number | 否 | 语音时长（秒），最大60秒 |
| replyToId | string | 否 | 回复消息 ID |

---

### 获取会话消息列表

```
GET /api/im/messages/conversation/:conversationId?beforeId=xxx&afterId=xxx&limit=20
```

| 参数 | 说明 |
|------|------|
| beforeId | 获取此消息之前的消息 |
| afterId | 获取此消息之后的消息 |
| limit | 数量限制 |

---

### 获取消息详情

```
GET /api/im/messages/:messageId
```

---

### 撤回消息

```
POST /api/im/messages/:messageId/recall
```

**限制**：发送后120秒内可撤回

---

### 转发消息

```
POST /api/im/messages/:messageId/forward
```

**请求体**：
```json
{
  "conversationIds": ["会话ID1", "会话ID2"]
}
```

**响应体**：
```json
{
  "code": "OK",
  "data": {
    "succeeded": [
      { "id": "消息ID", "conversationId": "会话ID", "type": "text", "content": "..." }
    ],
    "failed": [
      { "conversationId": "会话ID", "reason": "失败原因" }
    ]
  }
}
```

---

### 标记已读

```
POST /api/im/messages/conversation/:conversationId/read
```

**请求体**：
```json
{
  "messageId": "最后已读消息ID"
}
```

---

### 标记消息送达

```
POST /api/im/messages/:messageId/delivered
```

**说明**：客户端收到消息后调用，通知发送者消息已送达

**响应**：
```json
{
  "success": true,
  "data": {
    "message": "标记成功"
  }
}
```

---

### 批量标记消息送达

```
POST /api/im/messages/batch-delivered
```

**请求体**：
```json
{
  "messageIds": ["msg-uuid-1", "msg-uuid-2", "msg-uuid-3"]
}
```

**说明**：批量标记多条消息已送达，适用于客户端重新上线时同步状态

---

### 发送输入状态

```
POST /api/im/conversations/:conversationId/typing
```

**请求体**：
```json
{
  "isTyping": true
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| isTyping | boolean | 是 | true=开始输入，false=停止输入 |

**说明**：通知会话其他参与者当前用户的输入状态

---

### 搜索消息

## 通话模块

### 获取通话记录

```
GET /api/im/calls?page=1&limit=20
```

---

### 发起通话

```
POST /api/im/calls/initiate
```

**请求体**：
```json
{
  "calleeId": "被叫用户ID"
}
```

---

### 获取通话详情

```
GET /api/im/calls/:callId
```

---

### 响铃

```
POST /api/im/calls/:callId/ring
```

**说明**：被叫收到通话邀请后调用

---

### 接听通话

```
POST /api/im/calls/:callId/accept
```

---

### 拒接通话

```
POST /api/im/calls/:callId/reject
```

---

### 挂断通话

```
POST /api/im/calls/:callId/hangup
```

---

### 发送 WebRTC 信令

```
POST /api/im/calls/:callId/signal
```

**请求体**：
```json
{
  "signalType": "offer",
  "signalData": {
    "sdp": "v=0\r\no=- 46117317..."
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| signalType | string | 是 | offer/answer/ice-candidate |
| signalData | object | 是 | SDP 或 ICE Candidate 数据 |

**信令类型说明**：

| signalType | 用途 | signalData 内容 |
|------------|------|-----------------|
| offer | 主叫发起 SDP Offer | `{ "sdp": "..." }` |
| answer | 被叫响应 SDP Answer | `{ "sdp": "..." }` |
| ice-candidate | 交换 ICE Candidate | `{ "candidate": "...", "sdpMid": "...", "sdpMLineIndex": 0 }` |

**说明**：WebRTC 信令转发，服务端会将信令通过 WebSocket 推送给通话对方

---

## 在线状态

### 检查用户是否在线

```
GET /api/im/presence/check/:userId
```

**响应**：
```json
{
  "success": true,
  "data": {
    "userId": "1234567",
    "isOnline": true
  }
}
```

---

### 获取用户详细在线状态

```
GET /api/im/presence/status/:userId
```

**响应**：
```json
{
  "success": true,
  "data": {
    "userId": "1234567",
    "isOnline": true,
    "lastOnlineAt": "2026-01-25T00:00:00.000Z",
    "onlineDeviceCount": 2
  }
}
```

---

### 批量获取在线状态

```
POST /api/im/presence/batch
```

**请求体**：
```json
{
  "userIds": ["user1", "user2", "user3"]
}
```

**限制**：一次最多100个用户

---

### 获取好友在线状态

```
GET /api/im/presence/friends
```

---

## 媒体文件

### 上传单个文件

```
POST /api/im/media/upload
```

**Content-Type**：`multipart/form-data`

**请求体**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 要上传的文件 |

**响应**：
```json
{
  "success": true,
  "data": {
    "type": "image",
    "url": "/uploads/images/1706140800000-uuid.jpg",
    "filename": "1706140800000-uuid.jpg",
    "originalName": "photo.jpg",
    "mimeType": "image/jpeg",
    "size": 102400
  }
}
```

---

### 上传多个文件

```
POST /api/im/media/upload/multiple
```

**Content-Type**：`multipart/form-data`

**请求体**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| files | File[] | 是 | 要上传的文件（最多9个） |

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "type": "image",
      "url": "/uploads/images/xxx.jpg",
      "filename": "xxx.jpg",
      "originalName": "photo1.jpg",
      "mimeType": "image/jpeg",
      "size": 102400
    },
    {
      "type": "image",
      "url": "/uploads/images/yyy.jpg",
      "filename": "yyy.jpg",
      "originalName": "photo2.jpg",
      "mimeType": "image/jpeg",
      "size": 204800
    }
  ]
}
```

---

### 删除文件

```
DELETE /api/im/media/:type/:filename
```

| 参数 | 类型 | 说明 |
|------|------|------|
| type | string | 媒体类型：image/audio/video/file |
| filename | string | 文件名 |

**响应**：
```json
{
  "success": true,
  "message": "文件已删除"
}
```

---

### 获取上传限制

```
GET /api/im/media/limits
```

**响应**：
```json
{
  "success": true,
  "data": {
    "allowedTypes": [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/webm",
      "video/mp4",
      "video/webm",
      "application/pdf"
    ],
    "sizeLimits": {
      "image": 10485760,
      "audio": 20971520,
      "video": 104857600,
      "file": 52428800
    },
    "maxFiles": 9
  }
}
```

**大小限制说明**：

| 类型 | 限制 |
|------|------|
| image | 10MB |
| audio | 20MB |
| video | 100MB |
| file | 50MB |

---

## WebSocket 实时通信

### 连接地址

```
ws://服务器地址:端口/ws?token=<JWT令牌>&deviceId=<设备ID>
```

| 参数 | 必填 | 说明 |
|------|------|------|
| token | 是 | JWT 访问令牌 |
| deviceId | 否 | 设备 ID，不传自动生成 |

### 连接限制

| 限制项 | 默认值 | 说明 |
|--------|--------|------|
| 单用户最大设备数 | 5 | 同一用户最多 5 个设备同时在线 |
| 全局最大连接数 | 10000 | 服务器最多支持 10000 个并发连接 |

**超限处理**：
- 超过用户设备数限制：返回关闭码 `4003`
- 超过全局连接数限制：返回关闭码 `4004`

---

### 连接成功响应

```json
{
  "type": "connected",
  "timestamp": 1706140800000,
  "payload": {
    "userId": "1234567",
    "deviceId": "device-uuid",
    "serverTime": 1706140800000
  }
}
```

---

### 客户端发送消息格式

**心跳**：
```json
{
  "type": "ping"
}
```

**响应**：
```json
{
  "type": "pong",
  "payload": {
    "timestamp": 1706140800000
  }
}
```

---

### 服务端推送事件

#### 新消息

```json
{
  "type": "message:new",
  "timestamp": 1706140800000,
  "payload": {
    "conversationId": "conv-uuid",
    "message": {
      "id": "msg-uuid",
      "conversationId": "conv-uuid",
      "senderId": "1234567",
      "type": "text",
      "content": "消息内容",
      "mediaUrl": null,
      "isRecalled": false,
      "createdAt": "2026-01-25T00:00:00.000Z"
    }
  }
}
```

#### 消息撤回

```json
{
  "type": "message:recalled",
  "timestamp": 1706140800000,
  "payload": {
    "conversationId": "conv-uuid",
    "messageId": "msg-uuid",
    "recalledBy": "1234567"
  }
}
```

#### 消息已读

```json
{
  "type": "message:read",
  "timestamp": 1706140800000,
  "payload": {
    "conversationId": "conv-uuid",
    "userId": "1234567",
    "lastReadMessageId": "msg-uuid"
  }
}
```

#### 消息送达

```json
{
  "type": "message:delivered",
  "timestamp": 1706140800000,
  "payload": {
    "conversationId": "conv-uuid",
    "messageId": "msg-uuid",
    "deliveredTo": "7654321",
    "deliveredAt": 1706140800000
  }
}
```

**说明**：当接收方调用送达回执 API 后，发送方会收到此事件

#### 来电邀请

```json
{
  "type": "call:invite",
  "timestamp": 1706140800000,
  "payload": {
    "callId": "call-uuid",
    "callerId": "1234567",
    "calleeId": "7654321",
    "conversationId": "conv-uuid"
  }
}
```

#### 通话接听

```json
{
  "type": "call:answer",
  "timestamp": 1706140800000,
  "payload": {
    "callId": "call-uuid",
    "answeredBy": "7654321"
  }
}
```

#### 通话拒绝

```json
{
  "type": "call:reject",
  "timestamp": 1706140800000,
  "payload": {
    "callId": "call-uuid",
    "rejectedBy": "7654321"
  }
}
```

#### 通话结束

```json
{
  "type": "call:end",
  "timestamp": 1706140800000,
  "payload": {
    "callId": "call-uuid",
    "endedBy": "1234567",
    "status": "ended",
    "endReason": "caller_hangup",
    "duration": 120
  }
}
```

#### 响铃通知

```json
{
  "type": "call:ring",
  "timestamp": 1706140800000,
  "payload": {
    "callId": "call-uuid",
    "calleeId": "7654321",
    "ringAt": 1706140800000
  }
}
```

**说明**：被叫调用响铃 API 后，主叫会收到此事件，确认被叫设备已收到来电

#### WebRTC 信令

```json
{
  "type": "call:signal",
  "timestamp": 1706140800000,
  "payload": {
    "callId": "call-uuid",
    "fromUserId": "1234567",
    "signalType": "offer",
    "signalData": {
      "sdp": "v=0\r\no=- 46117317..."
    },
    "sentAt": 1706140800000
  }
}
```

**信令类型**：

| signalType | 说明 |
|------------|------|
| offer | 主叫发送的 SDP Offer |
| answer | 被叫响应的 SDP Answer |
| ice-candidate | ICE Candidate 候选 |

#### 开始输入

```json
{
  "type": "typing:start",
  "timestamp": 1706140800000,
  "payload": {
    "conversationId": "conv-uuid",
    "userId": "1234567",
    "startedAt": 1706140800000
  }
}
```

#### 停止输入

```json
{
  "type": "typing:stop",
  "timestamp": 1706140800000,
  "payload": {
    "conversationId": "conv-uuid",
    "userId": "1234567",
    "stoppedAt": 1706140800000
  }
}
```

**说明**：用户调用输入状态 API 后，会话其他参与者会收到此事件

#### 用户上线

```json
{
  "type": "presence:online",
  "timestamp": 1706140800000,
  "payload": {
    "userId": "1234567",
    "deviceId": "device-uuid",
    "onlineAt": 1706140800000
  }
}
```

#### 用户下线

```json
{
  "type": "presence:offline",
  "timestamp": 1706140800000,
  "payload": {
    "userId": "1234567",
    "deviceId": "device-uuid",
    "offlineAt": 1706140800000
  }
}
```

#### 被踢下线

```json
{
  "type": "kick",
  "timestamp": 1706140800000,
  "payload": {
    "reason": "duplicate_login",
    "newDeviceId": "new-device-uuid"
  }
}
```

#### 好友申请

```json
{
  "type": "friend:request",
  "timestamp": 1706140800000,
  "payload": {
    "requestId": "request-uuid",
    "fromUser": {
      "id": "1234567",
      "name": "用户昵称",
      "avatar": "https://..."
    },
    "message": "你好，我是xxx",
    "source": "search",
    "createdAt": 1706140800000
  }
}
```

#### 好友申请被接受

```json
{
  "type": "friend:accepted",
  "timestamp": 1706140800000,
  "payload": {
    "requestId": "request-uuid",
    "friendUser": {
      "id": "7654321",
      "name": "好友昵称",
      "avatar": "https://..."
    },
    "conversationId": "conv-uuid",
    "acceptedAt": 1706140800000
  }
}
```

#### 被邀请入群

```json
{
  "type": "group:invited",
  "timestamp": 1706140800000,
  "payload": {
    "groupId": "group-uuid",
    "groupName": "群名称",
    "groupAvatar": "https://...",
    "inviter": {
      "id": "1234567",
      "name": "邀请者昵称",
      "avatar": "https://..."
    },
    "invitedAt": 1706140800000
  }
}
```

#### 被踢出群

```json
{
  "type": "group:kicked",
  "timestamp": 1706140800000,
  "payload": {
    "groupId": "group-uuid",
    "groupName": "群名称",
    "operatorId": "1234567",
    "kickedAt": 1706140800000
  }
}
```

#### 成员入群

```json
{
  "type": "group:member_joined",
  "timestamp": 1706140800000,
  "payload": {
    "groupId": "group-uuid",
    "member": {
      "id": "7654321",
      "name": "新成员昵称",
      "avatar": "https://..."
    },
    "inviterId": "1234567",
    "joinedAt": 1706140800000
  }
}
```

#### 成员退群

```json
{
  "type": "group:member_left",
  "timestamp": 1706140800000,
  "payload": {
    "groupId": "group-uuid",
    "userId": "7654321",
    "leftAt": 1706140800000
  }
}
```

#### 群信息更新

```json
{
  "type": "group:updated",
  "timestamp": 1706140800000,
  "payload": {
    "groupId": "group-uuid",
    "changes": {
      "name": "新群名称",
      "avatar": "https://...",
      "description": "新描述",
      "muteAll": false
    },
    "operatorId": "1234567",
    "updatedAt": 1706140800000
  }
}
```

#### 被禁言

```json
{
  "type": "group:muted",
  "timestamp": 1706140800000,
  "payload": {
    "groupId": "group-uuid",
    "groupName": "群名称",
    "operatorId": "1234567",
    "duration": 3600,
    "muteEndAt": "2026-01-25T01:00:00.000Z",
    "mutedAt": 1706140800000
  }
}
```

#### 被解禁

```json
{
  "type": "group:unmuted",
  "timestamp": 1706140800000,
  "payload": {
    "groupId": "group-uuid",
    "groupName": "群名称",
    "operatorId": "1234567",
    "unmutedAt": 1706140800000
  }
}
```

#### 群组解散

```json
{
  "type": "group:dissolved",
  "timestamp": 1706140800000,
  "payload": {
    "groupId": "group-uuid",
    "groupName": "群名称",
    "dissolvedAt": 1706140800000
  }
}
```

---

## 枚举常量

### 设备平台 (DevicePlatform)

| 值 | 说明 |
|-----|------|
| ios | iOS |
| android | Android |
| web | Web |
| macos | macOS |
| windows | Windows |

### 推送提供商 (PushProvider)

| 值 | 说明 |
|-----|------|
| apns | Apple Push Notification Service |
| expo | Expo Push Notifications |
| fcm | Firebase Cloud Messaging |

### 好友来源 (FriendSource)

| 值 | 说明 |
|-----|------|
| search | 搜索添加 |
| qr | 扫码添加 |
| phone | 手机号添加 |
| invite | 邀请添加 |

### 好友申请状态 (FriendRequestStatus)

| 值 | 说明 |
|-----|------|
| pending | 待处理 |
| accepted | 已接受 |
| rejected | 已拒绝 |
| ignored | 已忽略 |

### 消息类型 (MessageType)

| 值 | 说明 |
|-----|------|
| text | 文本消息 |
| image | 图片消息 |
| voice | 语音消息（最大60秒） |

### 群组加入方式 (GroupJoinMode)

| 值 | 说明 |
|-----|------|
| open | 自由加入 |
| approval | 需审批 |
| invite | 仅邀请 |

### 通话状态 (CallStatus)

| 值 | 说明 |
|-----|------|
| initiated | 已发起 |
| ringing | 响铃中 |
| connected | 已接通 |
| ended | 已结束 |
| missed | 未接 |
| rejected | 已拒绝 |
| busy | 忙线 |

### 通话结束原因 (CallEndReason)

| 值 | 说明 |
|-----|------|
| caller_hangup | 主叫挂断 |
| callee_hangup | 被叫挂断 |
| timeout | 超时 |
| network_error | 网络错误 |

### WebSocket 事件类型

| 类型 | 说明 |
|------|------|
| connected | 连接成功 |
| message:new | 新消息 |
| message:recalled | 消息撤回 |
| message:read | 消息已读 |
| message:delivered | 消息送达 |
| typing:start | 开始输入 |
| typing:stop | 停止输入 |
| call:invite | 来电邀请 |
| call:ring | 响铃 |
| call:answer | 接听 |
| call:reject | 拒绝 |
| call:end | 通话结束 |
| call:signal | WebRTC 信令 |
| presence:online | 用户上线 |
| presence:offline | 用户下线 |
| friend:request | 好友申请 |
| friend:accepted | 好友申请被接受 |
| group:invited | 被邀请入群 |
| group:kicked | 被踢出群 |
| group:member_joined | 成员入群 |
| group:member_left | 成员退群 |
| group:updated | 群信息更新 |
| group:muted | 被禁言 |
| group:unmuted | 被解禁 |
| group:dissolved | 群组解散 |
| heartbeat:ack | 心跳响应 |
| kick | 被踢下线 |
| error | 错误 |

---

## 错误码

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 204 | 无内容（删除成功） |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 500 | 服务器错误 |

### WebSocket 关闭码

| 关闭码 | 说明 |
|--------|------|
| 1000 | 正常关闭 |
| 1001 | 服务器关闭 |
| 4001 | 缺少认证令牌 |
| 4002 | 认证失败 |
| 4003 | 用户设备数量超过限制（默认最多5个设备同时在线） |
| 4004 | 服务器连接数已满（默认最多10000个连接） |

---

## Expo 客户端集成指南

### 开发环境配置

| 注意事项 | 说明 |
|----------|------|
| 网络访问 | Expo Go 无法访问 `localhost`，需使用局域网 IP（如 `192.168.x.x`） |
| HTTPS | 开发环境可使用 HTTP，生产环境建议 HTTPS |
| 端口 | 默认端口 3000，确保防火墙放行 |

---

### 推送令牌配置

#### 令牌格式要求

```
ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

- 必须以 `ExponentPushToken[` 开头，以 `]` 结尾
- 中间为字母数字和短横线组成的字符串
- 无效格式的令牌会被服务端忽略

#### 注册推送令牌

**步骤 1**：在 Expo 客户端获取令牌

```typescript
import * as Notifications from 'expo-notifications';

const token = (await Notifications.getExpoPushTokenAsync()).data;
// 结果: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
```

**步骤 2**：注册设备时提交令牌

```
POST /api/im/devices/register
```

```json
{
  "deviceId": "设备唯一标识",
  "platform": "ios",
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "pushProvider": "expo",
  "deviceName": "iPhone 15 Pro",
  "appVersion": "1.0.0",
  "osVersion": "17.0"
}
```

**步骤 3**：令牌变更时更新

```
POST /api/im/devices/:deviceId/push-token
```

```json
{
  "pushToken": "ExponentPushToken[新令牌]",
  "pushProvider": "expo"
}
```

> **重要**：推送令牌可能因 App 重装、系统更新等原因变化，建议每次 App 启动时检查并更新。

---

### 推送通道（Android）

在 Android 上需要配置通知通道，服务端使用以下 `channelId`：

| channelId | 用途 | 建议配置 |
|-----------|------|----------|
| `messages` | 新消息通知 | 默认重要性，显示角标 |
| `calls` | 来电通知 | 高重要性，响铃+振动 |
| `social` | 好友请求/群组邀请 | 默认重要性 |

**Expo 配置示例**：

```typescript
import * as Notifications from 'expo-notifications';

// 配置消息通道
await Notifications.setNotificationChannelAsync('messages', {
  name: '消息通知',
  importance: Notifications.AndroidImportance.DEFAULT,
  sound: 'default',
});

// 配置来电通道
await Notifications.setNotificationChannelAsync('calls', {
  name: '来电通知',
  importance: Notifications.AndroidImportance.HIGH,
  sound: 'default',
  vibrationPattern: [0, 250, 250, 250],
});

// 配置社交通道
await Notifications.setNotificationChannelAsync('social', {
  name: '社交通知',
  importance: Notifications.AndroidImportance.DEFAULT,
});
```

---

### 推送触发场景

服务端在以下场景自动发送离线推送（仅当用户**离线**且**未开启勿扰**时）：

| 场景 | 推送标题 | 推送内容 | data.type |
|------|----------|----------|-----------|
| 新消息 | 发送者昵称 | 消息内容预览（最多100字） | `new_message` |
| 来电 | "来电" | "xxx 发起语音通话" | `incoming_call` |
| 好友请求 | "好友请求" | "xxx 请求添加你为好友" | `friend_request` |
| 好友接受 | "好友添加成功" | "xxx 已接受你的好友申请" | `friend_accepted` |
| 群组邀请 | "群组邀请" | "xxx 邀请你加入群组「群名」" | `group_invite` |
| 被踢出群 | "已被移出群组" | "你已被移出群组「群名」" | `group_kicked` |
| 被禁言 | "群组禁言" | "你在群组「群名」被禁言 x 分钟" | `group_muted` |
| 群组解散 | "群组已解散" | "群组「群名」已被解散" | `group_dissolved` |

---

### 推送 data 结构

推送通知的 `data` 字段包含业务数据，用于客户端点击处理：

#### 新消息

```json
{
  "type": "new_message",
  "conversationId": "会话ID",
  "messageId": "消息ID"
}
```

#### 来电

```json
{
  "type": "incoming_call",
  "callId": "通话ID",
  "callType": "voice"
}
```

#### 好友请求

```json
{
  "type": "friend_request",
  "requestId": "申请ID"
}
```

#### 好友接受

```json
{
  "type": "friend_accepted",
  "requestId": "申请ID",
  "conversationId": "会话ID"
}
```

#### 群组邀请

```json
{
  "type": "group_invite",
  "groupId": "群组ID"
}
```

#### 被踢出群

```json
{
  "type": "group_kicked",
  "groupId": "群组ID"
}
```

#### 被禁言

```json
{
  "type": "group_muted",
  "groupId": "群组ID",
  "duration": 3600
}
```

#### 群组解散

```json
{
  "type": "group_dissolved",
  "groupId": "群组ID"
}
```

**客户端处理示例**：

```typescript
import * as Notifications from 'expo-notifications';

// 监听通知点击
Notifications.addNotificationResponseReceivedListener((response) => {
  const data = response.notification.request.content.data;
  
  switch (data.type) {
    case 'new_message':
      // 跳转到会话页面
      navigation.navigate('Chat', { conversationId: data.conversationId });
      break;
    case 'incoming_call':
      // 跳转到来电页面
      navigation.navigate('IncomingCall', { callId: data.callId });
      break;
    case 'friend_request':
      // 跳转到好友请求页面
      navigation.navigate('FriendRequests');
      break;
    case 'friend_accepted':
      // 跳转到新好友会话
      navigation.navigate('Chat', { conversationId: data.conversationId });
      break;
    case 'group_invite':
    case 'group_kicked':
    case 'group_muted':
      // 跳转到群组详情
      navigation.navigate('GroupDetail', { groupId: data.groupId });
      break;
    case 'group_dissolved':
      // 刷新群组列表
      navigation.navigate('Groups');
      break;
  }
});
```

---

### 无效令牌处理

服务端自动处理无效的推送令牌：

| 错误类型 | 服务端处理 | 客户端建议 |
|----------|------------|------------|
| `DeviceNotRegistered` | 自动清除该设备的 pushToken | App 启动时重新注册令牌 |
| `MessageTooBig` | 记录错误日志 | 无需处理 |
| `MessageRateExceeded` | 延迟重试 | 无需处理 |
| `InvalidCredentials` | 记录错误日志 | 检查 Expo 项目配置 |

---

### WebSocket 连接

#### 连接地址

```
ws://服务器IP:端口/ws?token=<JWT令牌>&deviceId=<设备ID>
```

#### 断线重连

Expo App 在以下情况可能断开 WebSocket：
- App 进入后台
- 网络切换（WiFi ↔ 4G）
- 设备休眠

**重连策略建议**：

```typescript
class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // 起始延迟 1 秒

  connect(token: string, deviceId: string) {
    const url = `ws://${SERVER_IP}:${PORT}/ws?token=${token}&deviceId=${deviceId}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.ws.onclose = () => {
      this.stopHeartbeat();
      this.scheduleReconnect(token, deviceId);
    };
  }

  private scheduleReconnect(token: string, deviceId: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('达到最大重连次数');
      return;
    }
    
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;
    
    setTimeout(() => this.connect(token, deviceId), delay);
  }
}
```

#### 心跳保活

建议每 **30 秒** 发送一次心跳：

```typescript
// 发送
ws.send(JSON.stringify({ type: 'ping' }));

// 接收
// { "type": "pong", "payload": { "timestamp": 1706140800000 } }
```

---

### 前后台切换处理

```typescript
import { AppState, AppStateStatus } from 'react-native';

AppState.addEventListener('change', (state: AppStateStatus) => {
  if (state === 'active') {
    // App 进入前台
    // 1. 检查 WebSocket 连接状态，必要时重连
    // 2. 刷新会话列表和未读数
    // 3. 清除通知角标
  } else if (state === 'background') {
    // App 进入后台
    // WebSocket 可能会被系统断开
    // 离线消息将通过推送通知送达
  }
});
```

---

### 勿扰模式

用户可为设备开启勿扰模式，开启后该设备不会收到离线推送：

```
PUT /api/im/devices/:deviceId
```

```json
{
  "doNotDisturb": true
}
```

---

### 常见问题

#### 1. 推送收不到

检查项：
- 推送令牌格式是否正确（`ExponentPushToken[...]`）
- `pushProvider` 是否设置为 `expo`
- 设备是否处于离线状态（在线用户通过 WebSocket 接收）
- 是否开启了勿扰模式

#### 2. WebSocket 频繁断开

- 检查心跳是否正常发送
- 检查网络稳定性
- 实现指数退避重连策略

#### 3. 开发环境连接失败

- 使用局域网 IP 而非 localhost
- 确保手机和电脑在同一网络
- 检查防火墙设置
