# Expo 推送服务 API 文档

## 概述

ExpoPushService 是基于 Expo Push Notification 的推送服务，支持向离线设备发送推送通知。

**服务位置**: `src/services/push/expo.ts`

## 类型定义

### PushNotificationPayload
```typescript
interface PushNotificationPayload {
  title: string;           // 推送标题
  body: string;            // 推送内容
  data?: Record<string, unknown>; // 自定义数据
  badge?: number;          // 角标数
  sound?: boolean;         // 是否播放声音（默认 true）
  priority?: "default" | "normal" | "high"; // 优先级
  channelId?: string;      // Android 通知通道
}
```

### SendPushResult
```typescript
interface SendPushResult {
  success: number;         // 成功数量
  failed: number;          // 失败数量
  errors: Array<{          // 错误详情
    token: string;         // 失败的推送令牌
    error: string;         // 错误信息
  }>;
}
```

### ExpoPushMessage
```typescript
interface ExpoPushMessage {
  to: string;              // Expo Push Token
  title?: string;          // 推送标题
  body: string;            // 推送内容
  data?: Record<string, unknown>; // 自定义数据
  sound?: "default" | null; // 声音
  badge?: number;          // 角标
  priority?: "default" | "normal" | "high"; // 优先级
  channelId?: string;      // Android 通道 ID
  categoryId?: string;     // 通知分类
  ttl?: number;            // 生存时间（秒）
  expiration?: number;     // 过期时间戳
}
```

## 方法列表

### sendToUser
向单个用户的所有离线设备发送推送。

**签名**:
```typescript
async sendToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<SendPushResult>
```

**参数**:
- `userId`: 目标用户 ID
- `payload`: 推送内容

**特性**:
- 自动过滤在线设备（只推送给离线设备）
- 自动过滤勿扰模式设备
- 仅推送给 pushProvider 为 "expo" 的设备

**示例**:
```typescript
import { ExpoPushService } from '@/services/push/index.js';

const result = await ExpoPushService.sendToUser('user-123', {
  title: '系统通知',
  body: '您有一条新消息',
  data: { type: 'system', action: 'open_app' },
});
```

---

### sendToUsers
向多个用户批量发送推送。

**签名**:
```typescript
async sendToUsers(
  userIds: string[],
  payload: PushNotificationPayload
): Promise<SendPushResult>
```

**参数**:
- `userIds`: 目标用户 ID 数组
- `payload`: 推送内容

**示例**:
```typescript
const result = await ExpoPushService.sendToUsers(
  ['user-1', 'user-2', 'user-3'],
  {
    title: '群公告',
    body: '管理员发布了新公告',
    channelId: 'announcements',
  }
);
```

---

### sendToTokens
向指定的推送令牌列表发送通知。

**签名**:
```typescript
async sendToTokens(
  tokens: string[],
  payload: PushNotificationPayload
): Promise<SendPushResult>
```

**参数**:
- `tokens`: Expo Push Token 数组
- `payload`: 推送内容

**特性**:
- 自动过滤无效的 Expo Push Token
- 自动分批发送（每批最多 100 条）
- 自动清理失效的推送令牌（DeviceNotRegistered）

---

### sendNewMessagePush
发送新消息推送（业务封装方法）。

**签名**:
```typescript
async sendNewMessagePush(
  userId: string,
  senderName: string,
  messagePreview: string,
  conversationId: string
): Promise<SendPushResult>
```

**参数**:
- `userId`: 接收者用户 ID
- `senderName`: 发送者名称（显示为标题）
- `messagePreview`: 消息预览（超过 100 字符自动截断）
- `conversationId`: 会话 ID

**推送数据**:
```json
{
  "title": "张三",
  "body": "你好，在吗？",
  "data": {
    "type": "new_message",
    "conversationId": "conv-123"
  },
  "channelId": "messages"
}
```

---

### sendIncomingCallPush
发送来电推送（业务封装方法）。

**签名**:
```typescript
async sendIncomingCallPush(
  userId: string,
  callerName: string,
  callId: string,
  callType: "voice" | "video"
): Promise<SendPushResult>
```

**参数**:
- `userId`: 被呼叫者用户 ID
- `callerName`: 来电者名称
- `callId`: 通话 ID
- `callType`: 通话类型（语音/视频）

**推送数据**:
```json
{
  "title": "来电",
  "body": "张三 发起视频通话",
  "data": {
    "type": "incoming_call",
    "callId": "call-123",
    "callType": "video"
  },
  "priority": "high",
  "channelId": "calls"
}
```

---

### sendFriendRequestPush
发送好友请求推送（业务封装方法）。

**签名**:
```typescript
async sendFriendRequestPush(
  userId: string,
  senderName: string,
  requestId: string
): Promise<SendPushResult>
```

**参数**:
- `userId`: 接收者用户 ID
- `senderName`: 请求者名称
- `requestId`: 好友请求 ID

**推送数据**:
```json
{
  "title": "好友请求",
  "body": "张三 请求添加你为好友",
  "data": {
    "type": "friend_request",
    "requestId": "req-123"
  },
  "channelId": "social"
}
```

---

### sendGroupInvitePush
发送群组邀请推送（业务封装方法）。

**签名**:
```typescript
async sendGroupInvitePush(
  userId: string,
  groupName: string,
  inviterName: string,
  groupId: string
): Promise<SendPushResult>
```

**参数**:
- `userId`: 接收者用户 ID
- `groupName`: 群组名称
- `inviterName`: 邀请者名称
- `groupId`: 群组 ID

**推送数据**:
```json
{
  "title": "群组邀请",
  "body": "张三 邀请你加入群组「技术交流群」",
  "data": {
    "type": "group_invite",
    "groupId": "group-123"
  },
  "channelId": "social"
}
```

---

### isValidExpoPushToken
验证 Expo Push Token 格式是否有效。

**签名**:
```typescript
isValidExpoPushToken(token: string): boolean
```

**参数**:
- `token`: 待验证的推送令牌

**返回**: 是否为有效的 Expo Push Token

**有效格式**: `ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]`

---

## 推送通道配置

### Android 通知通道
```typescript
// messages - 消息通知（默认优先级）
// calls - 来电通知（高优先级）
// social - 社交通知（好友请求、群组邀请）
```

### 客户端配置示例
```typescript
import * as Notifications from 'expo-notifications';

// 配置通知通道
await Notifications.setNotificationChannelAsync('messages', {
  name: '消息通知',
  importance: Notifications.AndroidImportance.DEFAULT,
});

await Notifications.setNotificationChannelAsync('calls', {
  name: '来电通知',
  importance: Notifications.AndroidImportance.HIGH,
  sound: 'ringtone.wav',
});

await Notifications.setNotificationChannelAsync('social', {
  name: '社交通知',
  importance: Notifications.AndroidImportance.DEFAULT,
});
```

---

## 推送数据类型 (data.type)

| type | 说明 | 关联通道 |
|------|------|---------|
| new_message | 新消息 | messages |
| incoming_call | 来电 | calls |
| friend_request | 好友请求 | social |
| group_invite | 群组邀请 | social |

---

## 服务配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| EXPO_PUSH_URL | https://exp.host/--/api/v2/push/send | Expo 推送 API |
| REQUEST_TIMEOUT | 10000ms | 请求超时时间 |
| MAX_BATCH_SIZE | 100 | 单次批量推送上限 |

---

## 自动清理机制

当 Expo 返回 `DeviceNotRegistered` 错误时，服务会自动清除该设备的推送令牌：

```typescript
// 自动执行：
await Device.update(
  { pushToken: null, pushProvider: null },
  { where: { pushToken: invalidToken } }
);
```

---

## 使用建议

1. **优先使用业务封装方法**：`sendNewMessagePush`、`sendIncomingCallPush` 等已配置好通道和数据格式
2. **批量推送使用 sendToUsers**：避免循环调用 sendToUser
3. **高优先级推送**：来电等紧急通知使用 `priority: "high"`
4. **客户端配置通道**：确保 Android 客户端已配置对应的通知通道
