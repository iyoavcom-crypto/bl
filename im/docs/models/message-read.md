# message-read 模型文档
模块位置：[src/models/message-read](../../../src/models/message-read)

## 基本信息
- 表名: "message_read"
- 模型: "MessageRead"
- 时间戳: true
- 软删除: false

## 字段
| 字段 | 中文名 | 类型 | 空 | 默认值 | 索引 | 备注 |
|---|---|---|---|---|---|---|
| id | 主键 | string | 否 | hook生成 | PRIMARY KEY | UUID 36位 |
| messageId | 消息ID | string | 否 | 无 | BTREE | 引用 message.id |
| userId | 已读用户ID | string | 否 | 无 | BTREE | 引用 user.id |
| readAt | 已读时间 | Date | 否 | hook生成 |  |  |
| createdAt | 创建时间 | Date | 否 | 无 | BTREE |  |

## 关系
| 关系类型 | 别名 | 外键 | 目标模型 | 更新时 | 删除时 | 说明 |
|---|---|---|---|---|---|---|
| belongsTo | message | messageId | Message | 级联 | 级联 | 已读的消息 |
| belongsTo | user | userId | User | 级联 | 级联 | 已读的用户 |

## 常量
无特定常量定义

## 接口
| 接口名 | 属性 | 类型 |
|---|---|---|
| MessageReadAttributes | id | string |
| MessageReadAttributes | messageId | string |
| MessageReadAttributes | userId | string |
| MessageReadAttributes | readAt | Date |

## DTO/白名单
- 列表字段: id, messageId, userId, readAt, createdAt
- 详情字段: id, messageId, userId, readAt, createdAt
- 可创建字段: messageId, userId, readAt
- 可更新字段: （已读回执不可修改）
- 可筛选字段: messageId, userId
- 可排序字段: readAt, createdAt

## 钩子
- beforeCreate: 自动生成 UUID 作为 id；设置 readAt=now（如未提供）；防止重复插入（同一用户对同一消息只记录一次）

## 索引
- `(messageId, userId)` UNIQUE - 防止重复已读记录
- `(userId, readAt)` BTREE - 查询用户已读历史
- `(messageId)` BTREE - 统计消息已读数

## 业务逻辑
- **私聊已读**: 用户查看消息后创建 MessageRead 记录
- **群聊已读**: 
  - 不主动创建所有成员的 MessageRead 记录（性能考虑）
  - 仅当用户查看"已读/未读列表"时按需统计
  - 使用 Redis 缓存已读人数
- **未读计数**: 
  - 通过 Redis 缓存 `conversation:{id}:unread:{userId}` 维护
  - 定期同步到数据库
- **已读同步**: 
  - 多设备登录时，一个设备已读需通过 WebSocket 通知其他设备
  - 广播已读事件给同一用户的所有在线设备
