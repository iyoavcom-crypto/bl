# message 模型文档
模块位置：[src/models/message](../../../src/models/message)

## 基本信息
- 表名: "message"
- 模型: "Message"
- 时间戳: true
- 软删除: true

## 字段
| 字段 | 中文名 | 类型 | 空 | 默认值 | 索引 | 备注 |
|---|---|---|---|---|---|---|
| id | 主键 | string | 否 | hook生成 | PRIMARY KEY | UUID 36位 |
| conversationId | 会话ID | string | 否 | 无 | BTREE | 引用 conversation.id |
| senderId | 发送者ID | string | 否 | 无 | BTREE | 引用 user.id |
| type | 消息类型 | MessageType | 否 | 无 | BTREE | text/image/voice |
| content | 文本内容 | string \| null | 是 | 无 |  | TEXT 类型，用于 text 消息或 JSON 元数据 |
| mediaUrl | 媒体URL | string \| null | 是 | 无 |  | 图片/语音文件 URL，长度 ≤ 500 |
| mediaDuration | 媒体时长 | number \| null | 是 | 无 |  | 语音时长（秒），最大 60 |
| replyToId | 引用消息ID | string \| null | 是 | 无 | BTREE | 引用 message.id |
| isRecalled | 是否已撤回 | boolean | 否 | false | BTREE |  |
| recalledAt | 撤回时间 | Date \| null | 是 | 无 |  |  |
| createdAt | 发送时间 | Date | 否 | 无 | BTREE |  |
| updatedAt | 更新时间 | Date | 否 | 无 |  |  |
| deletedAt | 删除时间 | Date \| null | 是 | 无 |  | paranoid 软删除 |

## 关系
| 关系类型 | 别名 | 外键 | 目标模型 | 更新时 | 删除时 | 说明 |
|---|---|---|---|---|---|---|
| belongsTo | conversation | conversationId | Conversation | 级联 | 级联 | 所属会话 |
| belongsTo | sender | senderId | User | 级联 | 置空 | 发送者 |
| belongsTo | replyTo | replyToId | Message | 级联 | 置空 | 引用的消息 |
| hasMany | replies | replyToId | Message | 级联 | 置空 | 回复列表 |
| hasMany | readReceipts | messageId | MessageRead | 级联 | 级联 | 已读回执列表 |

## 常量
| 常量名 | 键 | 值 | 说明 |
|---|---|---|---|
| MessageType | TEXT | "text" | 文本消息 |
| MessageType | IMAGE | "image" | 图片消息 |
| MessageType | VOICE | "voice" | 语音消息 |

## 接口
| 接口名 | 属性 | 类型 |
|---|---|---|
| MessageAttributes | id | string |
| MessageAttributes | conversationId | string |
| MessageAttributes | senderId | string |
| MessageAttributes | type | MessageType |
| MessageAttributes | content | string \| null |
| MessageAttributes | mediaUrl | string \| null |
| MessageAttributes | mediaDuration | number \| null |
| MessageAttributes | replyToId | string \| null |
| MessageAttributes | isRecalled | boolean |
| MessageAttributes | recalledAt | Date \| null |

## DTO/白名单
- 列表字段: id, conversationId, senderId, type, content, mediaUrl, mediaDuration, replyToId, isRecalled, createdAt
- 详情字段: id, conversationId, senderId, type, content, mediaUrl, mediaDuration, replyToId, isRecalled, recalledAt, createdAt, updatedAt
- 可创建字段: conversationId, senderId, type, content, mediaUrl, mediaDuration, replyToId
- 可更新字段: isRecalled, recalledAt
- 可筛选字段: conversationId, senderId, type, isRecalled
- 可排序字段: createdAt

## 钩子
- beforeCreate: 自动生成 UUID 作为 id；验证 type='voice' 时 mediaDuration ≤ 60
- afterCreate: 更新 Conversation.lastMessageId 和 lastMessageAt；触发推送通知
- beforeUpdate: 当 isRecalled 从 false 变为 true 时，设置 recalledAt=now

## 索引
- `(conversationId, createdAt)` BTREE - 会话消息列表（时间排序）
- `(senderId)` BTREE - 查询某人发送的消息
- `(replyToId)` BTREE - 查询某消息的回复
- `(isRecalled)` BTREE - 过滤撤回消息
- `(type)` BTREE - 按消息类型筛选

## 业务逻辑
- **消息撤回**: 
  - 普通用户只能撤回 2 分钟内发送的消息
  - 群主和管理员可撤回任意时间的群消息
  - 撤回后 isRecalled=true，客户端显示"[用户]撤回了一条消息"
- **消息引用**: replyToId 指向被引用的消息 ID
- **消息转发**: 创建新消息，content 中包含原消息引用信息
- **媒体存储**: mediaUrl 指向 CDN 地址
- **语音限制**: mediaDuration 最大 60 秒
- **消息分页**: 按 createdAt 降序查询，支持 cursor-based 分页
