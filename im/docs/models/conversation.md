# conversation 模型文档
模块位置：[src/models/conversation](../../../src/models/conversation)

## 基本信息
- 表名: "conversation"
- 模型: "Conversation"
- 时间戳: true
- 软删除: true

## 字段
| 字段 | 中文名 | 类型 | 空 | 默认值 | 索引 | 备注 |
|---|---|---|---|---|---|---|
| id | 主键 | string | 否 | hook生成 | PRIMARY KEY | UUID 36位 |
| type | 会话类型 | ConversationType | 否 | 无 | BTREE | private/group |
| userId | 用户A ID | string \| null | 是 | 无 | BTREE | 私聊时引用 user.id |
| friendId | 用户B ID | string \| null | 是 | 无 | BTREE | 私聊时引用 user.id |
| groupId | 群组ID | string \| null | 是 | 无 | BTREE | 群聊时引用 group.id |
| lastMessageId | 最后消息ID | string \| null | 是 | 无 |  | 引用 message.id |
| lastMessageAt | 最后消息时间 | Date \| null | 是 | 无 | BTREE |  |
| createdAt | 创建时间 | Date | 否 | 无 | BTREE |  |
| updatedAt | 更新时间 | Date | 否 | 无 |  |  |
| deletedAt | 删除时间 | Date \| null | 是 | 无 |  | paranoid 软删除 |

## 关系
| 关系类型 | 别名 | 外键 | 目标模型 | 更新时 | 删除时 | 说明 |
|---|---|---|---|---|---|---|
| belongsTo | user | userId | User | 级联 | 级联 | 私聊用户A |
| belongsTo | friend | friendId | User | 级联 | 级联 | 私聊用户B |
| belongsTo | group | groupId | Group | 级联 | 级联 | 群聊群组 |
| belongsTo | lastMessage | lastMessageId | Message | 级联 | 置空 | 最后消息 |
| hasMany | messages | conversationId | Message | 级联 | 级联 | 会话消息列表 |

## 常量
| 常量名 | 键 | 值 | 说明 |
|---|---|---|---|
| ConversationType | PRIVATE | "private" | 私聊会话 |
| ConversationType | GROUP | "group" | 群聊会话 |

## 接口
| 接口名 | 属性 | 类型 |
|---|---|---|
| ConversationAttributes | id | string |
| ConversationAttributes | type | ConversationType |
| ConversationAttributes | userId | string \| null |
| ConversationAttributes | friendId | string \| null |
| ConversationAttributes | groupId | string \| null |
| ConversationAttributes | lastMessageId | string \| null |
| ConversationAttributes | lastMessageAt | Date \| null |

## DTO/白名单
- 列表字段: id, type, userId, friendId, groupId, lastMessageId, lastMessageAt, createdAt
- 详情字段: id, type, userId, friendId, groupId, lastMessageId, lastMessageAt, createdAt, updatedAt
- 可创建字段: type, userId, friendId, groupId
- 可更新字段: lastMessageId, lastMessageAt
- 可筛选字段: userId, friendId, groupId, type
- 可排序字段: lastMessageAt, createdAt

## 钩子
- beforeCreate: 自动生成 UUID 作为 id；验证 type 与对应外键一致（private 需有 userId+friendId，group 需有 groupId）

## 索引
- `(userId, friendId)` UNIQUE + 部分索引 WHERE type='private' - 私聊唯一性
- `(groupId)` UNIQUE + 部分索引 WHERE type='group' - 群聊唯一性
- `(userId, lastMessageAt)` BTREE - 用户会话列表排序
- `(type)` BTREE - 按类型筛选

## 业务逻辑
- **会话查询**: 客户端通过 `userId` 查询所有会话（私聊查 userId 或 friendId，群聊通过 GroupMember 关联）
- **排序规则**: 按 `lastMessageAt` 降序排列
- **未读计数**: 不在 Conversation 表存储，通过 MessageRead 表实时计算或使用 Redis 缓存
- **会话创建时机**: 
  - Friend 创建时自动创建 type='private' 会话
  - Group 创建时自动创建 type='group' 会话
