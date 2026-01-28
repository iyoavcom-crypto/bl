# friend 模型文档
模块位置：[src/models/friend](../../../src/models/friend)

## 基本信息
- 表名: "friend"
- 模型: "Friend"
- 时间戳: true
- 软删除: true

## 字段
| 字段 | 中文名 | 类型 | 空 | 默认值 | 索引 | 备注 |
|---|---|---|---|---|---|---|
| id | 主键 | string | 否 | hook生成 | PRIMARY KEY | UUID 36位 |
| userId | 用户ID | string | 否 | 无 | BTREE | 引用 user.id，关系持有者 |
| friendId | 好友ID | string | 否 | 无 | BTREE | 引用 user.id，好友方 |
| alias | 备注名 | string \| null | 是 | 无 |  | 长度 ≤ 50 |
| isBlocked | 是否拉黑 | boolean | 否 | false | BTREE | 单向拉黑 |
| doNotDisturb | 免打扰 | boolean | 否 | false |  |  |
| isPinned | 是否置顶 | boolean | 否 | false | BTREE |  |
| source | 添加来源 | FriendSource | 否 | 无 |  | search/qr/phone/invite |
| createdAt | 成为好友时间 | Date | 否 | 无 | BTREE |  |
| updatedAt | 更新时间 | Date | 否 | 无 |  |  |
| deletedAt | 删除时间 | Date \| null | 是 | 无 |  | paranoid 软删除（解除好友） |

## 关系
| 关系类型 | 别名 | 外键 | 目标模型 | 更新时 | 删除时 | 说明 |
|---|---|---|---|---|---|---|
| belongsTo | user | userId | User | 级联 | 级联 | 关系持有者 |
| belongsTo | friend | friendId | User | 级联 | 级联 | 好友方 |

## 常量
| 常量名 | 键 | 值 | 说明 |
|---|---|---|---|
| FriendSource | SEARCH | "search" | 搜索添加 |
| FriendSource | QR | "qr" | 扫码添加 |
| FriendSource | PHONE | "phone" | 通讯录添加 |
| FriendSource | INVITE | "invite" | 邀请链接添加 |

## 接口
| 接口名 | 属性 | 类型 |
|---|---|---|
| FriendAttributes | id | string |
| FriendAttributes | userId | string |
| FriendAttributes | friendId | string |
| FriendAttributes | alias | string \| null |
| FriendAttributes | isBlocked | boolean |
| FriendAttributes | doNotDisturb | boolean |
| FriendAttributes | isPinned | boolean |
| FriendAttributes | source | FriendSource |

## DTO/白名单
- 列表字段: id, userId, friendId, alias, isBlocked, doNotDisturb, isPinned, createdAt
- 详情字段: id, userId, friendId, alias, isBlocked, doNotDisturb, isPinned, source, createdAt, updatedAt
- 可创建字段: userId, friendId, source
- 可更新字段: alias, isBlocked, doNotDisturb, isPinned
- 可筛选字段: userId, friendId, isBlocked, isPinned
- 可排序字段: createdAt

## 钩子
- beforeCreate: 自动生成 UUID 作为 id；验证 userId !== friendId（不能添加自己为好友）
- afterCreate: 创建对应的私聊 Conversation
- afterDestroy: 软删除对应的私聊 Conversation

## 索引
- `(userId, friendId)` UNIQUE - 防止重复添加好友
- `(userId, isBlocked)` BTREE - 查询黑名单
- `(userId, isPinned)` BTREE - 查询置顶好友
- `(friendId)` BTREE - 反向查询

## 业务逻辑
- **双向好友关系**: 成为好友时需在表中创建两条记录（A→B 和 B→A），使用事务保证一致性
- **黑名单机制**: `isBlocked=true` 时，对方无法发送消息，但仍保留好友关系
- **好友查询**: 通过 `userId` 查询所有 `friendId`，联表 User 获取好友信息
