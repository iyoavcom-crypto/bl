# IM-API 功能详细说明

> 更新时间：2026-01-26
> 版本：1.0.0

---

## 一、用户认证

### 1.1 用户注册

**接口**：`POST /api/auth/register`

**功能流程**：
1. 用户提交手机号、密码、二级密码（6位PIN码）
2. 系统验证手机号格式（11位中国手机号）
3. 系统检查手机号是否已被注册
4. 系统对密码进行scrypt哈希加密
5. 系统对PIN码进行AES-256-GCM加密存储
6. 创建用户记录，自动生成7位数字用户ID
7. 签发JWT令牌（access_token + refresh_token）
8. 返回用户信息和令牌

**请求参数**：
```json
{
  "phone": "13800138000",      // 必填，11位手机号
  "password": "123456",        // 必填，登录密码
  "pin": "666666",             // 必填，6位数字PIN码
  "name": "昵称"               // 可选，默认"用户"+随机数
}
```

**返回数据**：
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1234567",
      "phone": "138****8000",
      "name": "昵称",
      "avatar": null,
      "createdAt": "2026-01-26T00:00:00.000Z"
    },
    "access": "eyJ...",
    "refresh": "eyJ...",
    "payload": {
      "sub": "1234567",
      "vip": false,
      "roleId": "user",
      "teamId": null,
      "teamRoleId": null
    }
  }
}
```

**业务规则**：
- 手机号全局唯一
- 密码长度不限，建议6位以上
- PIN码必须是6位纯数字
- 注册成功后自动登录

---

### 1.2 用户登录

**接口**：`POST /api/auth/login`

**功能流程**：
1. 用户提交手机号和密码
2. 系统查找用户记录
3. 系统验证密码（scrypt比对）
4. 验证通过后签发新的JWT令牌
5. 返回用户信息和令牌

**请求参数**：
```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

**返回数据**：
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "access": "eyJ...",
    "refresh": "eyJ...",
    "payload": {
      "sub": "1234567",
      "vip": false,
      "roleId": "user",
      "teamId": null,
      "teamRoleId": null
    }
  }
}
```

**业务规则**：
- 密码错误不提示具体原因（安全考虑）
- 支持多设备同时登录

---

### 1.3 获取当前用户

**接口**：`GET /api/auth/me`

**功能流程**：
1. 从请求头提取Bearer Token
2. 验证JWT令牌有效性
3. 从令牌中提取用户ID
4. 查询用户完整信息
5. 返回用户资料（排除敏感字段）

**请求头**：
```
Authorization: Bearer eyJ...
```

**返回数据**：
```json
{
  "success": true,
  "data": {
    "id": "1234567",
    "phone": "138****8000",
    "name": "昵称",
    "avatar": "https://...",
    "gender": "male",
    "region": "广东深圳",
    "signature": "个性签名",
    "searchable": true,
    "createdAt": "2026-01-26T00:00:00.000Z"
  }
}
```

---

### 1.4 用户退出

**接口**：`POST /api/auth/logout`

**功能流程**：
1. 验证JWT令牌
2. 标记当前令牌失效（可选：加入黑名单）
3. 返回成功状态

**业务规则**：
- 仅使当前设备的令牌失效
- 其他设备不受影响

---

## 二、用户资料管理

### 2.1 获取我的资料

**接口**：`GET /api/im/users/profile`

**返回数据**：
```json
{
  "success": true,
  "data": {
    "id": "1234567",
    "phone": "138****8000",
    "name": "昵称",
    "avatar": "https://...",
    "gender": "male",           // male/female/unknown
    "region": "广东深圳",
    "signature": "个性签名",
    "searchable": true,         // 是否允许被搜索
    "createdAt": "2026-01-26T00:00:00.000Z"
  }
}
```

---

### 2.2 更新我的资料

**接口**：`PUT /api/im/users/profile`

**请求参数**：
```json
{
  "name": "新昵称",             // 可选
  "avatar": "https://...",     // 可选
  "gender": "male",            // 可选：male/female/unknown
  "region": "广东深圳",         // 可选
  "signature": "个性签名",      // 可选
  "searchable": true           // 可选
}
```

**业务规则**：
- 昵称长度1-20字符
- 头像必须是有效URL
- 只更新传入的字段

---

### 2.3 修改密码

**接口**：`POST /api/im/users/change-password`

**功能流程**：
1. 验证旧密码是否正确
2. 对新密码进行scrypt哈希
3. 更新用户密码字段
4. 可选：使其他设备令牌失效

**请求参数**：
```json
{
  "oldPassword": "旧密码",
  "newPassword": "新密码"
}
```

---

### 2.4 修改二级密码

**接口**：`POST /api/im/users/change-pin`

**功能流程**：
1. 验证登录密码是否正确（安全验证）
2. 对新PIN码进行AES-256-GCM加密
3. 更新用户PIN字段

**请求参数**：
```json
{
  "password": "登录密码",
  "newPin": "666666"
}
```

**业务规则**：
- PIN码必须是6位纯数字
- 修改PIN需要验证登录密码

---

### 2.5 验证二级密码

**接口**：`POST /api/im/users/verify-pin`

**功能流程**：
1. 获取用户存储的加密PIN
2. 解密后与输入PIN比对
3. 返回验证结果

**请求参数**：
```json
{
  "pin": "666666"
}
```

**返回数据**：
```json
{
  "success": true,
  "data": { "valid": true }
}
```

**使用场景**：
- 转账确认
- 敏感操作验证
- 查看隐私内容

---

### 2.6 搜索用户

**接口**：`GET /api/im/users/search?keyword=xxx&limit=20`

**功能流程**：
1. 按手机号精确匹配或昵称模糊匹配
2. 排除searchable=false的用户
3. 排除当前用户自己
4. 返回匹配的用户列表

**请求参数**：
- `keyword`：搜索关键词（手机号或昵称）
- `limit`：返回数量，默认20，最大100

**返回数据**：
```json
{
  "success": true,
  "data": [
    {
      "id": "1234567",
      "name": "昵称",
      "avatar": "https://...",
      "isFriend": false
    }
  ]
}
```

---

### 2.7 查看用户资料

**接口**：`GET /api/im/users/:userId`

**功能流程**：
1. 查询指定用户公开资料
2. 检查与当前用户的好友关系
3. 返回用户公开信息

**返回数据**：
```json
{
  "success": true,
  "data": {
    "id": "1234567",
    "name": "昵称",
    "avatar": "https://...",
    "gender": "male",
    "region": "广东深圳",
    "signature": "个性签名",
    "isFriend": true,
    "friendAlias": "备注名"     // 如果是好友
  }
}
```

---

## 三、设备管理

### 3.1 注册设备

**接口**：`POST /api/im/devices/register`

**功能流程**：
1. 检查设备ID是否已存在
2. 如存在则更新设备信息
3. 如不存在则创建新设备记录
4. 记录设备平台、型号、版本、IP等
5. 标记设备为在线状态

**请求参数**：
```json
{
  "deviceId": "设备唯一标识",       // 必填
  "platform": "ios",               // 必填：ios/android/web
  "deviceName": "iPhone 15 Pro",   // 可选
  "pushToken": "ExponentPushToken[xxx]", // 可选：Expo推送令牌
  "pushProvider": "expo",          // 可选：expo/fcm/apns
  "appVersion": "1.0.0",           // 可选
  "osVersion": "17.0"              // 可选
}
```

**返回数据**：
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "deviceId": "设备唯一标识",
    "platform": "ios",
    "deviceName": "iPhone 15 Pro",
    "isOnline": true,
    "lastActiveAt": "2026-01-26T00:00:00.000Z",
    "lastIp": "192.168.1.1"
  }
}
```

**业务规则**：
- 同一用户可注册多个设备
- 设备ID应由客户端生成并持久化存储
- 推送令牌用于离线消息推送

---

### 3.2 我的设备列表

**接口**：`GET /api/im/devices`

**返回数据**：
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "deviceId": "设备唯一标识",
      "platform": "ios",
      "deviceName": "iPhone 15 Pro",
      "isOnline": true,
      "lastActiveAt": "2026-01-26T00:00:00.000Z",
      "lastIp": "192.168.1.1",
      "doNotDisturb": false
    }
  ]
}
```

---

### 3.3 设备详情

**接口**：`GET /api/im/devices/:deviceId`

**返回数据**：与设备列表中的单条数据结构相同

---

### 3.4 更新设备信息

**接口**：`PUT /api/im/devices/:deviceId`

**请求参数**：
```json
{
  "deviceName": "新设备名",
  "pushToken": "新推送令牌",
  "pushProvider": "expo",
  "appVersion": "1.1.0",
  "osVersion": "17.1",
  "doNotDisturb": false          // 勿扰模式
}
```

---

### 3.5 更新推送令牌

**接口**：`POST /api/im/devices/:deviceId/push-token`

**请求参数**：
```json
{
  "pushToken": "ExponentPushToken[xxx]",
  "pushProvider": "expo"
}
```

**业务规则**：
- 推送令牌可能随时变化（如App重装）
- 客户端应在每次启动时更新令牌

---

### 3.6 设备心跳

**接口**：`POST /api/im/devices/:deviceId/heartbeat`

**功能流程**：
1. 验证设备归属当前用户
2. 更新设备最后活跃时间
3. 更新设备IP地址
4. 标记设备为在线状态

**返回数据**：
```json
{
  "success": true,
  "data": {
    "online": true,
    "lastActiveAt": "2026-01-26T00:00:00.000Z"
  }
}
```

**业务规则**：
- 建议每30秒发送一次心跳
- WebSocket连接时无需HTTP心跳

---

### 3.7 设备下线

**接口**：`POST /api/im/devices/:deviceId/offline`

**功能流程**：
1. 标记设备为离线状态
2. 更新最后活跃时间

---

### 3.8 删除设备

**接口**：`DELETE /api/im/devices/:deviceId`

**功能流程**：
1. 验证设备归属当前用户
2. 删除设备记录
3. 关闭该设备的WebSocket连接

**使用场景**：
- 用户在其他设备上强制登出当前设备
- 清理不再使用的设备

---

## 四、好友系统

### 4.1 发送好友申请

**接口**：`POST /api/im/friends/requests`

**功能流程**：
1. 验证目标用户存在
2. 检查是否已是好友
3. 检查是否有待处理的申请
4. 创建好友申请记录
5. 推送好友申请通知（WebSocket + 离线推送）

**请求参数**：
```json
{
  "toUserId": "目标用户ID",
  "message": "我是xxx，请通过好友申请",  // 可选，验证消息
  "source": "search"                    // 来源：search/qrcode/group/card
}
```

**返回数据**：
```json
{
  "success": true,
  "data": {
    "id": "申请ID",
    "fromUserId": "发起者ID",
    "toUserId": "目标用户ID",
    "message": "验证消息",
    "source": "search",
    "status": "pending",
    "createdAt": "2026-01-26T00:00:00.000Z"
  }
}
```

**业务规则**：
- 不能向自己发送好友申请
- 已是好友不能重复申请
- 有待处理申请时不能重复发送
- 被对方拉黑时申请会被拒绝

---

### 4.2 收到的好友申请

**接口**：`GET /api/im/friends/requests/received?status=pending`

**请求参数**：
- `status`：可选，筛选状态（pending/accepted/rejected）

**返回数据**：
```json
{
  "success": true,
  "data": [
    {
      "id": "申请ID",
      "fromUser": {
        "id": "用户ID",
        "name": "昵称",
        "avatar": "头像URL"
      },
      "message": "验证消息",
      "source": "search",
      "status": "pending",
      "createdAt": "2026-01-26T00:00:00.000Z"
    }
  ]
}
```

---

### 4.3 发出的好友申请

**接口**：`GET /api/im/friends/requests/sent?status=pending`

**返回数据**：
```json
{
  "success": true,
  "data": [
    {
      "id": "申请ID",
      "toUser": {
        "id": "用户ID",
        "name": "昵称",
        "avatar": "头像URL"
      },
      "message": "验证消息",
      "status": "pending",
      "createdAt": "2026-01-26T00:00:00.000Z"
    }
  ]
}
```

---

### 4.4 接受好友申请

**接口**：`POST /api/im/friends/requests/:requestId/accept`

**功能流程**：
1. 验证申请存在且目标是当前用户
2. 验证申请状态为pending
3. 更新申请状态为accepted
4. 创建双向好友关系（两条Friend记录）
5. 自动创建私聊会话
6. 推送好友添加成功通知

**返回数据**：
```json
{
  "success": true,
  "data": {
    "request": { ... },
    "friend": {
      "userId": "好友ID",
      "name": "昵称",
      "avatar": "头像URL"
    },
    "conversation": {
      "id": "会话ID",
      "type": "private"
    }
  }
}
```

**业务规则**：
- 只能处理发给自己的申请
- 只能处理pending状态的申请
- 接受后自动双向建立好友关系

---

### 4.5 拒绝好友申请

**接口**：`POST /api/im/friends/requests/:requestId/reject`

**功能流程**：
1. 验证申请存在且目标是当前用户
2. 更新申请状态为rejected

**业务规则**：
- 拒绝后对方可重新发送申请
- 不会通知对方被拒绝

---

### 4.6 好友列表

**接口**：`GET /api/im/friends?page=1&limit=50&isBlocked=false&isPinned=true`

**请求参数**：
- `page`：页码，默认1
- `limit`：每页数量，默认50
- `isBlocked`：筛选黑名单，true/false
- `isPinned`：筛选置顶，true/false

**返回数据**：
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "userId": "好友ID",
        "name": "昵称",
        "avatar": "头像URL",
        "alias": "备注名",
        "isBlocked": false,
        "isPinned": true,
        "doNotDisturb": false,
        "createdAt": "2026-01-26T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 50
  }
}
```

---

### 4.7 好友详情

**接口**：`GET /api/im/friends/:userId`

**返回数据**：
```json
{
  "success": true,
  "data": {
    "userId": "好友ID",
    "user": {
      "id": "好友ID",
      "name": "昵称",
      "avatar": "头像URL",
      "gender": "male",
      "region": "广东深圳",
      "signature": "个性签名"
    },
    "alias": "备注名",
    "isBlocked": false,
    "isPinned": false,
    "doNotDisturb": false,
    "source": "search",
    "createdAt": "2026-01-26T00:00:00.000Z"
  }
}
```

---

### 4.8 更新好友设置

**接口**：`PUT /api/im/friends/:userId`

**请求参数**：
```json
{
  "alias": "备注名",           // 可选，null表示清除备注
  "isBlocked": false,         // 可选，是否拉黑
  "isPinned": true,           // 可选，是否置顶
  "doNotDisturb": false       // 可选，是否免打扰
}
```

**业务规则**：
- 拉黑后对方无法发送消息
- 拉黑后对方无法发起通话
- 免打扰只影响推送，不影响消息接收
- 置顶在好友列表中优先显示

---

### 4.9 删除好友

**接口**：`DELETE /api/im/friends/:userId`

**功能流程**：
1. 验证是好友关系
2. 删除双向好友关系（两条记录）
3. 私聊会话保留但标记为非好友状态

**业务规则**：
- 删除后双方都从好友列表消失
- 删除后不能直接发消息（需重新添加）
- 历史消息保留

---

### 4.10 检查好友关系

**接口**：`GET /api/im/friends/check/:userId`

**返回数据**：
```json
{
  "success": true,
  "data": { "isFriend": true }
}
```

---

## 五、私聊功能

### 5.1 发起私聊

**接口**：`POST /api/im/conversations/private`

**功能流程**：
1. 验证目标用户是好友
2. 检查是否已有私聊会话
3. 如有则返回现有会话
4. 如无则创建新会话
5. 返回会话信息

**请求参数**：
```json
{
  "targetUserId": "好友ID"
}
```

**返回数据**：
```json
{
  "success": true,
  "data": {
    "id": "会话ID",
    "type": "private",
    "targetUser": {
      "id": "好友ID",
      "name": "昵称",
      "avatar": "头像URL"
    },
    "unreadCount": 0,
    "lastMessage": null,
    "createdAt": "2026-01-26T00:00:00.000Z"
  }
}
```

**业务规则**：
- 只能与好友发起私聊
- 同一对用户只有一个私聊会话
- 会话创建后即使删除好友也保留

---

### 5.2 会话列表

**接口**：`GET /api/im/conversations`

**功能流程**：
1. 获取用户所有私聊和群聊会话
2. 按最后消息时间倒序排列
3. 置顶会话优先显示
4. 返回会话列表及未读数

**返回数据**：
```json
{
  "success": true,
  "data": [
    {
      "id": "会话ID",
      "type": "private",
      "targetUser": {
        "id": "好友ID",
        "name": "昵称",
        "avatar": "头像URL"
      },
      "unreadCount": 5,
      "lastMessage": {
        "id": "消息ID",
        "type": "text",
        "content": "消息内容",
        "senderId": "发送者ID",
        "createdAt": "2026-01-26T00:00:00.000Z"
      },
      "isPinned": false,
      "isMuted": false,
      "updatedAt": "2026-01-26T00:00:00.000Z"
    },
    {
      "id": "会话ID",
      "type": "group",
      "group": {
        "id": "群ID",
        "name": "群名称",
        "avatar": "群头像"
      },
      "unreadCount": 10,
      "lastMessage": { ... },
      "isPinned": true,
      "isMuted": false,
      "updatedAt": "2026-01-26T00:00:00.000Z"
    }
  ]
}
```

---

### 5.3 会话详情

**接口**：`GET /api/im/conversations/:conversationId`

**返回数据（私聊）**：
```json
{
  "success": true,
  "data": {
    "id": "会话ID",
    "type": "private",
    "targetUser": {
      "id": "好友ID",
      "name": "昵称",
      "avatar": "头像URL",
      "isOnline": true
    },
    "unreadCount": 5,
    "lastMessage": { ... },
    "isFriend": true,
    "isBlocked": false,
    "createdAt": "2026-01-26T00:00:00.000Z"
  }
}
```

---

### 5.4 发送消息

**接口**：`POST /api/im/messages`

**功能流程**：
1. 验证会话存在且有权限
2. 验证发送者未被禁言（群聊）
3. 对文本消息进行敏感词过滤
4. 创建消息记录
5. 更新会话最后消息和时间
6. 通过WebSocket推送给接收方
7. 如接收方离线则发送离线推送

**请求参数**：
```json
{
  "conversationId": "会话ID",
  "type": "text",                    // text/image/voice
  "content": "消息内容",              // 文本消息必填
  "mediaUrl": "https://...",         // 图片/语音必填
  "mediaDuration": 10,               // 语音时长（秒），语音消息必填
  "replyToId": "被回复消息ID"         // 可选，引用回复
}
```

**返回数据**：
```json
{
  "success": true,
  "data": {
    "id": "消息ID",
    "conversationId": "会话ID",
    "senderId": "发送者ID",
    "type": "text",
    "content": "消息内容",
    "mediaUrl": null,
    "mediaDuration": null,
    "replyTo": null,
    "isRecalled": false,
    "createdAt": "2026-01-26T00:00:00.000Z"
  }
}
```

**消息类型**：
| 类型 | 说明 | 必填字段 |
|------|------|----------|
| text | 文本消息 | content |
| image | 图片消息 | mediaUrl |
| voice | 语音消息 | mediaUrl, mediaDuration |

**业务规则**：
- 文本消息自动过滤敏感词（替换为***）
- 语音消息时长限制60秒
- 被拉黑后无法发送消息
- 非好友无法发送私聊消息

---

### 5.5 消息列表

**接口**：`GET /api/im/messages/conversation/:conversationId?beforeId=xxx&limit=50`

**请求参数**：
- `beforeId`：分页游标，获取此消息ID之前的消息
- `afterId`：获取此消息ID之后的消息
- `limit`：数量限制，默认50，最大100

**返回数据**：
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "消息ID",
        "conversationId": "会话ID",
        "sender": {
          "id": "发送者ID",
          "name": "昵称",
          "avatar": "头像URL"
        },
        "type": "text",
        "content": "消息内容",
        "mediaUrl": null,
        "mediaDuration": null,
        "replyTo": {
          "id": "被回复消息ID",
          "content": "被回复内容预览",
          "senderName": "发送者昵称"
        },
        "isRecalled": false,
        "createdAt": "2026-01-26T00:00:00.000Z"
      }
    ],
    "hasMore": true
  }
}
```

---

### 5.6 消息详情

**接口**：`GET /api/im/messages/:messageId`

**返回数据**：
```json
{
  "success": true,
  "data": {
    "id": "消息ID",
    "conversationId": "会话ID",
    "sender": { ... },
    "type": "text",
    "content": "消息内容",
    "replyTo": { ... },
    "isRecalled": false,
    "readBy": [
      {
        "userId": "阅读者ID",
        "readAt": "2026-01-26T00:00:00.000Z"
      }
    ],
    "createdAt": "2026-01-26T00:00:00.000Z"
  }
}
```

---

### 5.7 撤回消息

**接口**：`POST /api/im/messages/:messageId/recall`

**功能流程**：
1. 验证消息存在
2. 验证是消息发送者或群管理员
3. 验证消息发送时间在120秒内
4. 标记消息为已撤回
5. 通过WebSocket推送撤回通知

**返回数据**：
```json
{
  "success": true,
  "data": {
    "id": "消息ID",
    "isRecalled": true,
    "recalledAt": "2026-01-26T00:00:00.000Z"
  }
}
```

**业务规则**：
- 只能撤回自己发送的消息
- 群管理员可撤回成员消息
- 撤回时限120秒
- 撤回后消息内容不再显示

---

### 5.8 转发消息

**接口**：`POST /api/im/messages/:messageId/forward`

**功能流程**：
1. 验证原消息存在且有权限查看
2. 验证目标会话有权限发送
3. 为每个目标会话创建新消息副本
4. 推送新消息通知

**请求参数**：
```json
{
  "conversationIds": ["会话ID1", "会话ID2"]
}
```

**返回数据**：
```json
{
  "success": true,
  "data": [
    {
      "conversationId": "会话ID1",
      "message": { ... }
    },
    {
      "conversationId": "会话ID2",
      "message": { ... }
    }
  ]
}
```

**业务规则**：
- 最多同时转发到9个会话
- 转发的是消息内容副本，非引用
- 撤回的消息不能转发

---

### 5.9 标记已读

**接口**：`POST /api/im/messages/conversation/:conversationId/read`

**功能流程**：
1. 验证会话存在且有权限
2. 创建/更新已读记录
3. 清空会话未读计数
4. 向消息发送者推送已读回执

**请求参数**：
```json
{
  "messageId": "最后阅读的消息ID"
}
```

**业务规则**：
- 标记某条消息已读，意味着该消息及之前的消息都已读
- 会触发已读回执推送给消息发送者

---

### 5.10 删除会话

**接口**：`DELETE /api/im/conversations/:conversationId`

**功能流程**：
1. 验证会话存在且有权限
2. 删除会话记录（软删除）
3. 消息记录保留

**业务规则**：
- 删除会话不删除消息
- 收到新消息时会话会重新出现
- 对方不会收到任何通知

---

### 5.11 清空未读

**接口**：`POST /api/im/conversations/:conversationId/clear-unread`

**功能流程**：
1. 将会话未读计数设为0
2. 不发送已读回执

---

### 5.12 消息搜索

**接口**：`POST /api/im/messages/search`

**功能流程**：
1. 在用户有权访问的会话中搜索
2. 支持按会话、发送者、时间范围筛选
3. 返回匹配的消息列表

**请求参数**：
```json
{
  "keyword": "搜索关键词",
  "conversationId": "会话ID",        // 可选，指定会话
  "senderId": "发送者ID",            // 可选，指定发送者
  "type": "text",                   // 可选，消息类型
  "startDate": "2026-01-01",        // 可选，开始日期
  "endDate": "2026-01-31",          // 可选，结束日期
  "limit": 20,                      // 可选，返回数量
  "offset": 0                       // 可选，偏移量
}
```

**返回数据**：
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "消息ID",
        "content": "包含关键词的内容",
        "sender": { ... },
        "conversation": {
          "id": "会话ID",
          "type": "private",
          "name": "会话名称"
        },
        "createdAt": "2026-01-26T00:00:00.000Z"
      }
    ],
    "total": 100,
    "hasMore": true
  }
}
```

---

## 六、群聊功能

### 6.1 创建群组

**接口**：`POST /api/im/groups`

**功能流程**：
1. 创建群组记录
2. 将创建者设为群主
3. 邀请初始成员加入（如有）
4. 为群组创建群聊会话
5. 向被邀请成员推送入群通知

**请求参数**：
```json
{
  "name": "群名称",
  "avatar": "https://...",           // 可选
  "description": "群简介",           // 可选
  "joinMode": "open",               // 可选：open/approval/invite
  "memberIds": ["用户ID1", "用户ID2"] // 可选，初始成员
}
```

**返回数据**：
```json
{
  "success": true,
  "data": {
    "id": "群ID",
    "name": "群名称",
    "avatar": "https://...",
    "description": "群简介",
    "ownerId": "群主ID",
    "joinMode": "open",
    "memberCount": 3,
    "createdAt": "2026-01-26T00:00:00.000Z"
  }
}
```

**加群方式**：
| joinMode | 说明 |
|----------|------|
| open | 自由加入 |
| approval | 需要管理员审批 |
| invite | 仅邀请可加入 |

---

### 6.2 我的群组列表

**接口**：`GET /api/im/groups`

**返回数据**：
```json
{
  "success": true,
  "data": [
    {
      "id": "群ID",
      "name": "群名称",
      "avatar": "https://...",
      "memberCount": 50,
      "myRole": "owner",            // owner/admin/member
      "unreadCount": 10,
      "lastMessage": { ... }
    }
  ]
}
```

---

### 6.3 群组详情

**接口**：`GET /api/im/groups/:groupId`

**返回数据**：
```json
{
  "success": true,
  "data": {
    "id": "群ID",
    "name": "群名称",
    "avatar": "https://...",
    "description": "群简介",
    "announcement": "群公告",
    "owner": {
      "id": "群主ID",
      "name": "昵称",
      "avatar": "头像"
    },
    "joinMode": "open",
    "muteAll": false,
    "memberCount": 50,
    "myRole": "member",
    "myNickname": "群内昵称",
    "isMuted": false,
    "muteEndAt": null,
    "createdAt": "2026-01-26T00:00:00.000Z"
  }
}
```

---

### 6.4 更新群组信息

**接口**：`PUT /api/im/groups/:groupId`

**请求参数**：
```json
{
  "name": "新群名",
  "avatar": "https://...",
  "description": "新简介",
  "announcement": "新公告",
  "joinMode": "approval",
  "muteAll": false               // 全员禁言
}
```

**权限要求**：群主或管理员

---

### 6.5 解散群组

**接口**：`DELETE /api/im/groups/:groupId`

**功能流程**：
1. 验证操作者是群主
2. 删除所有群成员记录
3. 删除群聊会话
4. 删除群组记录
5. 向所有成员推送解散通知

**权限要求**：仅群主

---

### 6.6 群成员列表

**接口**：`GET /api/im/groups/:groupId/members`

**返回数据**：
```json
{
  "success": true,
  "data": [
    {
      "userId": "用户ID",
      "user": {
        "id": "用户ID",
        "name": "昵称",
        "avatar": "头像"
      },
      "nickname": "群内昵称",
      "role": "owner",            // owner/admin/member
      "isMuted": false,
      "muteEndAt": null,
      "joinedAt": "2026-01-26T00:00:00.000Z"
    }
  ]
}
```

---

### 6.7 邀请入群

**接口**：`POST /api/im/groups/:groupId/invite`

**功能流程**：
1. 验证操作者是群成员
2. 验证被邀请者是操作者的好友
3. 验证被邀请者未在群内
4. 创建群成员记录
5. 向被邀请者推送入群通知

**请求参数**：
```json
{
  "userIds": ["用户ID1", "用户ID2"]
}
```

**业务规则**：
- 只能邀请自己的好友
- 管理员可邀请任意用户（joinMode=invite时）
- 被邀请者会收到入群通知

---

### 6.8 踢出成员

**接口**：`POST /api/im/groups/:groupId/kick/:userId`

**功能流程**：
1. 验证操作者权限
2. 验证被踢者在群内
3. 删除群成员记录
4. 向被踢者推送通知

**权限要求**：
- 群主可踢任何人
- 管理员可踢普通成员
- 不能踢群主

---

### 6.9 退出群组

**接口**：`POST /api/im/groups/:groupId/leave`

**功能流程**：
1. 删除自己的群成员记录
2. 删除自己的群聊会话

**业务规则**：
- 群主不能退出，需先转让群主
- 退出后群聊消息不再接收

---

### 6.10 转让群主

**接口**：`POST /api/im/groups/:groupId/transfer`

**功能流程**：
1. 验证操作者是群主
2. 验证新群主是群成员
3. 更新群组ownerId
4. 更新原群主为普通成员
5. 更新新群主角色为owner

**请求参数**：
```json
{
  "newOwnerId": "新群主用户ID"
}
```

---

### 6.11 设置管理员

**接口**：`POST /api/im/groups/:groupId/admin/:userId`

**功能流程**：
1. 验证操作者是群主
2. 验证目标是群成员
3. 更新成员角色为admin

**权限要求**：仅群主

---

### 6.12 取消管理员

**接口**：`DELETE /api/im/groups/:groupId/admin/:userId`

**功能流程**：
1. 验证操作者是群主
2. 更新成员角色为member

---

### 6.13 禁言成员

**接口**：`POST /api/im/groups/:groupId/mute/:userId`

**功能流程**：
1. 验证操作者权限
2. 设置成员禁言状态
3. 设置禁言结束时间

**请求参数**：
```json
{
  "duration": 3600               // 禁言时长（秒），不传则永久禁言
}
```

**权限要求**：群主或管理员

**业务规则**：
- 管理员不能禁言其他管理员
- 禁言期间成员无法发送消息
- 到期自动解除禁言

---

### 6.14 解除禁言

**接口**：`DELETE /api/im/groups/:groupId/mute/:userId`

**功能流程**：
1. 清除成员禁言状态
2. 清除禁言结束时间

---

## 七、语音通话

### 7.1 发起通话

**接口**：`POST /api/im/calls/initiate`

**功能流程**：
1. 验证被叫是好友
2. 检查双方是否有进行中的通话
3. 获取或创建私聊会话
4. 创建通话记录（状态：initiated）
5. 通过WebSocket向被叫推送来电邀请
6. 如被叫离线则发送离线推送
7. 启动60秒超时计时

**请求参数**：
```json
{
  "calleeId": "被叫用户ID"
}
```

**返回数据**：
```json
{
  "success": true,
  "data": {
    "id": "通话ID",
    "callerId": "主叫ID",
    "calleeId": "被叫ID",
    "conversationId": "会话ID",
    "status": "initiated",
    "createdAt": "2026-01-26T00:00:00.000Z"
  }
}
```

**通话状态流转**：
```
initiated → ringing → connected → ended
     ↓         ↓
   missed   rejected
```

---

### 7.2 被叫响铃

**接口**：`POST /api/im/calls/:callId/ring`

**功能流程**：
1. 验证是被叫方
2. 验证通话状态为initiated
3. 更新状态为ringing
4. 向主叫推送响铃状态

**业务规则**：
- 被叫收到来电后调用
- 表示被叫端已开始响铃

---

### 7.3 接听通话

**接口**：`POST /api/im/calls/:callId/accept`

**功能流程**：
1. 验证是被叫方
2. 验证通话状态为initiated或ringing
3. 更新状态为connected
4. 记录通话开始时间
5. 向主叫推送接听通知
6. 双方开始通话

**返回数据**：
```json
{
  "success": true,
  "data": {
    "id": "通话ID",
    "status": "connected",
    "connectedAt": "2026-01-26T00:00:00.000Z"
  }
}
```

---

### 7.4 拒接通话

**接口**：`POST /api/im/calls/:callId/reject`

**功能流程**：
1. 验证是被叫方
2. 验证通话状态为initiated或ringing
3. 更新状态为rejected
4. 记录结束原因
5. 向主叫推送拒接通知

**返回数据**：
```json
{
  "success": true,
  "data": {
    "id": "通话ID",
    "status": "rejected",
    "endReason": "callee_reject",
    "endedAt": "2026-01-26T00:00:00.000Z"
  }
}
```

---

### 7.5 挂断通话

**接口**：`POST /api/im/calls/:callId/hangup`

**功能流程**：
1. 验证是通话参与者
2. 根据当前状态处理：
   - initiated/ringing：标记为missed（主叫取消）
   - connected：标记为ended（正常结束）
3. 计算通话时长
4. 向对方推送挂断通知

**返回数据**：
```json
{
  "success": true,
  "data": {
    "id": "通话ID",
    "status": "ended",
    "endReason": "caller_hangup",
    "duration": 120,               // 通话时长（秒）
    "endedAt": "2026-01-26T00:00:00.000Z"
  }
}
```

**结束原因**：
| endReason | 说明 |
|-----------|------|
| caller_hangup | 主叫挂断 |
| callee_hangup | 被叫挂断 |
| callee_reject | 被叫拒接 |
| timeout | 无人接听超时 |
| busy | 对方忙线 |

---

### 7.6 通话记录列表

**接口**：`GET /api/im/calls?page=1&limit=20`

**返回数据**：
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "通话ID",
        "caller": {
          "id": "主叫ID",
          "name": "昵称",
          "avatar": "头像"
        },
        "callee": {
          "id": "被叫ID",
          "name": "昵称",
          "avatar": "头像"
        },
        "status": "ended",
        "endReason": "caller_hangup",
        "duration": 120,
        "isOutgoing": true,          // 是否为拨出
        "createdAt": "2026-01-26T00:00:00.000Z",
        "endedAt": "2026-01-26T00:02:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

---

### 7.7 通话详情

**接口**：`GET /api/im/calls/:callId`

**返回数据**：
```json
{
  "success": true,
  "data": {
    "id": "通话ID",
    "caller": { ... },
    "callee": { ... },
    "conversationId": "关联会话ID",
    "status": "ended",
    "endReason": "caller_hangup",
    "duration": 120,
    "createdAt": "2026-01-26T00:00:00.000Z",
    "connectedAt": "2026-01-26T00:00:05.000Z",
    "endedAt": "2026-01-26T00:02:05.000Z"
  }
}
```

---

### 7.8 通话超时处理

**自动任务**：每15秒扫描

**处理逻辑**：
1. 查找状态为initiated或ringing且超过60秒的通话
2. 将状态更新为missed
3. 设置结束原因为timeout
4. 向主叫推送未接通知

---

## 八、在线状态

### 8.1 检查用户在线

**接口**：`GET /api/im/presence/check/:userId`

**返回数据**：
```json
{
  "success": true,
  "data": {
    "userId": "用户ID",
    "isOnline": true
  }
}
```

---

### 8.2 用户详细状态

**接口**：`GET /api/im/presence/status/:userId`

**返回数据**：
```json
{
  "success": true,
  "data": {
    "userId": "用户ID",
    "isOnline": true,
    "lastActiveAt": "2026-01-26T00:00:00.000Z",
    "devices": [
      {
        "platform": "ios",
        "isOnline": true,
        "lastActiveAt": "2026-01-26T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 8.3 批量查询状态

**接口**：`POST /api/im/presence/batch`

**请求参数**：
```json
{
  "userIds": ["用户ID1", "用户ID2", "用户ID3"]
}
```

**返回数据**：
```json
{
  "success": true,
  "data": {
    "用户ID1": { "isOnline": true, "lastActiveAt": "..." },
    "用户ID2": { "isOnline": false, "lastActiveAt": "..." },
    "用户ID3": { "isOnline": true, "lastActiveAt": "..." }
  }
}
```

**限制**：单次最多查询100个用户

---

### 8.4 好友在线状态

**接口**：`GET /api/im/presence/friends`

**返回数据**：
```json
{
  "success": true,
  "data": [
    {
      "userId": "好友ID",
      "name": "昵称",
      "avatar": "头像",
      "isOnline": true,
      "lastActiveAt": "2026-01-26T00:00:00.000Z"
    }
  ]
}
```

---

## 九、媒体文件

### 9.1 单文件上传

**接口**：`POST /api/im/media/upload`

**功能流程**：
1. 接收multipart/form-data上传
2. 验证文件类型和大小
3. 生成唯一文件名
4. 存储到对应目录
5. 返回文件访问URL

**请求格式**：
```
Content-Type: multipart/form-data

file: <二进制文件>
```

**返回数据**：
```json
{
  "success": true,
  "data": {
    "id": "文件ID",
    "type": "image",
    "url": "http://localhost:3000/uploads/images/xxx.jpg",
    "filename": "xxx.jpg",
    "originalName": "原始文件名.jpg",
    "mimeType": "image/jpeg",
    "size": 102400,
    "uploadedAt": "2026-01-26T00:00:00.000Z"
  }
}
```

---

### 9.2 多文件上传

**接口**：`POST /api/im/media/upload/multiple`

**请求格式**：
```
Content-Type: multipart/form-data

files: <文件1>
files: <文件2>
...
```

**返回数据**：
```json
{
  "success": true,
  "data": [
    { "id": "...", "url": "...", ... },
    { "id": "...", "url": "...", ... }
  ]
}
```

**限制**：单次最多9个文件

---

### 9.3 删除文件

**接口**：`DELETE /api/im/media/:type/:filename`

**参数说明**：
- `type`：文件类型（image/audio/video/file）
- `filename`：文件名

**示例**：`DELETE /api/im/media/image/xxx.jpg`

---

### 9.4 上传限制配置

**接口**：`GET /api/im/media/limits`

**返回数据**：
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
      "video/mp4",
      "application/pdf"
    ],
    "sizeLimits": {
      "image": 10485760,           // 10MB
      "audio": 20971520,           // 20MB
      "video": 104857600,          // 100MB
      "file": 52428800             // 50MB
    },
    "maxFiles": 9
  }
}
```

---

## 十、WebSocket 实时通信

### 10.1 连接建立

**连接地址**：`ws://host:port/ws?token=xxx`

**认证方式**：URL Query参数传递JWT Token

**连接成功响应**：
```json
{
  "type": "connected",
  "payload": {
    "userId": "用户ID",
    "deviceId": "设备ID",
    "timestamp": 1706227200000
  }
}
```

---

### 10.2 心跳保活

**客户端发送**：
```json
{ "type": "ping" }
```

**服务端响应**：
```json
{
  "type": "pong",
  "payload": { "timestamp": 1706227200000 }
}
```

**频率建议**：每30秒发送一次

---

### 10.3 消息事件

**新消息**：
```json
{
  "type": "message:new",
  "payload": {
    "conversationId": "会话ID",
    "message": {
      "id": "消息ID",
      "senderId": "发送者ID",
      "type": "text",
      "content": "消息内容",
      "createdAt": "2026-01-26T00:00:00.000Z"
    }
  }
}
```

**消息撤回**：
```json
{
  "type": "message:recalled",
  "payload": {
    "conversationId": "会话ID",
    "messageId": "消息ID",
    "recalledBy": "撤回者ID"
  }
}
```

**已读回执**：
```json
{
  "type": "message:read",
  "payload": {
    "conversationId": "会话ID",
    "readBy": "阅读者ID",
    "lastReadMessageId": "最后已读消息ID"
  }
}
```

**送达回执**：
```json
{
  "type": "message:delivered",
  "timestamp": 1706227200000,
  "payload": {
    "conversationId": "会话ID",
    "messageId": "消息ID",
    "deliveredTo": "接收者ID",
    "deliveredAt": 1706227200000
  }
}
```

---

### 10.4 通话事件

**来电邀请**：
```json
{
  "type": "call:invite",
  "timestamp": 1706227200000,
  "payload": {
    "callId": "通话ID",
    "callerId": "主叫ID",
    "calleeId": "被叫ID",
    "conversationId": "会话ID"
  }
}
```

**响铃通知**：
```json
{
  "type": "call:ring",
  "timestamp": 1706227200000,
  "payload": {
    "callId": "通话ID",
    "calleeId": "被叫ID",
    "ringAt": 1706227200000
  }
}
```

**对方接听**：
```json
{
  "type": "call:answer",
  "payload": {
    "callId": "通话ID",
    "answeredBy": "接听者ID"
  }
}
```

**对方拒接**：
```json
{
  "type": "call:reject",
  "payload": {
    "callId": "通话ID",
    "rejectedBy": "拒接者ID"
  }
}
```

**通话结束**：
```json
{
  "type": "call:end",
  "timestamp": 1706227200000,
  "payload": {
    "callId": "通话ID",
    "endedBy": "结束者ID",
    "status": "ended",
    "endReason": "caller_hangup",
    "duration": 120
  }
}
```

**WebRTC 信令**：
```json
{
  "type": "call:signal",
  "timestamp": 1706227200000,
  "payload": {
    "callId": "通话ID",
    "fromUserId": "发送者ID",
    "signalType": "offer",
    "signalData": {
      "sdp": "v=0\r\no=- 46117317..."
    },
    "sentAt": 1706227200000
  }
}
```

**信令类型说明**：
| signalType | 说明 |
|------------|------|
| offer | 主叫发送的 SDP Offer |
| answer | 被叫响应的 SDP Answer |
| ice-candidate | ICE Candidate 候选 |

---

### 10.5 在线状态事件

**好友上线**：
```json
{
  "type": "presence:online",
  "timestamp": 1706227200000,
  "payload": {
    "userId": "用户ID",
    "deviceId": "设备ID",
    "onlineAt": 1706227200000
  }
}
```

**好友离线**：
```json
{
  "type": "presence:offline",
  "timestamp": 1706227200000,
  "payload": {
    "userId": "用户ID",
    "deviceId": "设备ID",
    "offlineAt": 1706227200000
  }
}
```

---

### 10.6 输入状态事件

**开始输入**：
```json
{
  "type": "typing:start",
  "timestamp": 1706227200000,
  "payload": {
    "conversationId": "会话ID",
    "userId": "用户ID",
    "startedAt": 1706227200000
  }
}
```

**停止输入**：
```json
{
  "type": "typing:stop",
  "timestamp": 1706227200000,
  "payload": {
    "conversationId": "会话ID",
    "userId": "用户ID",
    "stoppedAt": 1706227200000
  }
}
```

---

### 10.7 好友事件

**好友申请**：
```json
{
  "type": "friend:request",
  "timestamp": 1706227200000,
  "payload": {
    "requestId": "申请ID",
    "fromUser": {
      "id": "用户ID",
      "name": "昵称",
      "avatar": "头像URL"
    },
    "message": "验证消息",
    "source": "search",
    "createdAt": 1706227200000
  }
}
```

**好友申请被接受**：
```json
{
  "type": "friend:accepted",
  "timestamp": 1706227200000,
  "payload": {
    "requestId": "申请ID",
    "friendUser": {
      "id": "好友ID",
      "name": "昵称",
      "avatar": "头像URL"
    },
    "conversationId": "会话ID",
    "acceptedAt": 1706227200000
  }
}
```

---

### 10.8 群组事件

**被邀请入群**：
```json
{
  "type": "group:invited",
  "timestamp": 1706227200000,
  "payload": {
    "groupId": "群ID",
    "groupName": "群名称",
    "groupAvatar": "群头像",
    "inviter": {
      "id": "邀请者ID",
      "name": "邀请者昵称",
      "avatar": "头像URL"
    },
    "invitedAt": 1706227200000
  }
}
```

**被踢出群**：
```json
{
  "type": "group:kicked",
  "timestamp": 1706227200000,
  "payload": {
    "groupId": "群ID",
    "groupName": "群名称",
    "operatorId": "操作者ID",
    "kickedAt": 1706227200000
  }
}
```

**成员入群**：
```json
{
  "type": "group:member_joined",
  "timestamp": 1706227200000,
  "payload": {
    "groupId": "群ID",
    "member": {
      "id": "成员ID",
      "name": "昵称",
      "avatar": "头像URL"
    },
    "inviterId": "邀请者ID",
    "joinedAt": 1706227200000
  }
}
```

**成员退群**：
```json
{
  "type": "group:member_left",
  "timestamp": 1706227200000,
  "payload": {
    "groupId": "群ID",
    "userId": "用户ID",
    "leftAt": 1706227200000
  }
}
```

**群信息更新**：
```json
{
  "type": "group:updated",
  "timestamp": 1706227200000,
  "payload": {
    "groupId": "群ID",
    "changes": {
      "name": "新群名称",
      "avatar": "新头像",
      "description": "新描述",
      "muteAll": false
    },
    "operatorId": "操作者ID",
    "updatedAt": 1706227200000
  }
}
```

**被禁言**：
```json
{
  "type": "group:muted",
  "timestamp": 1706227200000,
  "payload": {
    "groupId": "群ID",
    "groupName": "群名称",
    "operatorId": "操作者ID",
    "duration": 3600,
    "muteEndAt": "2026-01-26T01:00:00.000Z",
    "mutedAt": 1706227200000
  }
}
```

**被解禁**：
```json
{
  "type": "group:unmuted",
  "timestamp": 1706227200000,
  "payload": {
    "groupId": "群ID",
    "groupName": "群名称",
    "operatorId": "操作者ID",
    "unmutedAt": 1706227200000
  }
}
```

**群组解散**：
```json
{
  "type": "group:dissolved",
  "timestamp": 1706227200000,
  "payload": {
    "groupId": "群ID",
    "groupName": "群名称",
    "dissolvedAt": 1706227200000
  }
}
```

---

### 10.9 系统事件

**被踢下线**：
```json
{
  "type": "kick",
  "timestamp": 1706227200000,
  "payload": {
    "reason": "duplicate_login",
    "newDeviceId": "新设备ID"
  }
}
```

**错误通知**：
```json
{
  "type": "error",
  "timestamp": 1706227200000,
  "payload": {
    "code": 4001,
    "message": "错误描述",
    "details": null
  }
}
```

**心跳响应**：
```json
{
  "type": "heartbeat:ack",
  "timestamp": 1706227200000,
  "payload": {
    "serverTime": 1706227200000
  }
}
```

---

## 十一、离线推送

### 11.1 Expo Push

**支持场景**：
- 新私聊消息
- 新群聊消息
- 来电邀请
- 好友请求
- 群邀请

**推送条件**：
- 用户所有设备均离线
- 设备未开启勿扰模式
- 设备已注册有效推送令牌

**推送格式**：
```json
{
  "to": "ExponentPushToken[xxx]",
  "title": "发送者昵称",
  "body": "消息内容预览",
  "data": {
    "type": "new_message",
    "conversationId": "会话ID",
    "messageId": "消息ID"
  },
  "sound": "default",
  "priority": "high",
  "channelId": "messages"
}
```

---

## 十二、敏感词过滤

### 12.1 过滤规则

**触发时机**：发送文本消息时

**处理策略**：将敏感词替换为等长的`***`

**算法**：DFA（确定有限自动机）

**词库位置**：`data/sensitive-words.txt`

**词库分类**：
| 分类 | 示例 |
|------|------|
| 违法相关 | 赌博、贩毒、洗钱 |
| 欺诈相关 | 传销、诈骗、杀猪盘 |
| 色情相关 | 色情、淫秽、招嫖 |
| 暴力相关 | 杀人、暗杀、绑架 |
| 自我伤害 | 自杀、自残 |
| 侮辱歧视 | 辱骂词汇 |

**示例**：
- 输入：`这是赌博网站`
- 输出：`这是**网站`

---

## 十三、统计汇总

| 模块 | REST API | WebSocket事件 |
|------|----------|--------------|
| 用户认证 | 4 | - |
| 用户资料 | 7 | - |
| 设备管理 | 8 | - |
| 好友系统 | 10 | 2 |
| 私聊功能 | 12 | 4 |
| 群聊功能 | 14 | 8 |
| 语音通话 | 7 | 6 |
| 在线状态 | 4 | 2 |
| 输入状态 | 1 | 2 |
| 媒体文件 | 4 | - |
| 系统事件 | - | 4 |
| **总计** | **71** | **28** |
