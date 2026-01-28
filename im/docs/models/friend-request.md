# friend-request 模型文档
模块位置：[src/models/friend-request](../../../src/models/friend-request)

## 基本信息
- 表名: "friend_request"
- 模型: "FriendRequest"
- 时间戳: true
- 软删除: true

## 字段
| 字段 | 中文名 | 类型 | 空 | 默认值 | 索引 | 备注 |
|---|---|---|---|---|---|---|
| id | 主键 | string | 否 | hook生成 | PRIMARY KEY | UUID 36位 |
| fromUserId | 发起人ID | string | 否 | 无 | BTREE | 引用 user.id |
| toUserId | 接收人ID | string | 否 | 无 | BTREE | 引用 user.id |
| message | 验证消息 | string \| null | 是 | 无 |  | 长度 ≤ 200 |
| source | 来源 | FriendSource | 否 | 无 |  | search/qr/phone/invite |
| status | 状态 | FriendRequestStatus | 否 | "pending" | BTREE | pending/accepted/rejected/ignored |
| respondedAt | 响应时间 | Date \| null | 是 | 无 |  |  |
| createdAt | 请求时间 | Date | 否 | 无 | BTREE |  |
| updatedAt | 更新时间 | Date | 否 | 无 |  |  |
| deletedAt | 删除时间 | Date \| null | 是 | 无 |  | paranoid 软删除 |

## 关系
| 关系类型 | 别名 | 外键 | 目标模型 | 更新时 | 删除时 | 说明 |
|---|---|---|---|---|---|---|
| belongsTo | requester | fromUserId | User | 级联 | 级联 | 发起人 |
| belongsTo | recipient | toUserId | User | 级联 | 级联 | 接收人 |

## 常量
| 常量名 | 键 | 值 | 说明 |
|---|---|---|---|
| FriendRequestStatus | PENDING | "pending" | 待处理 |
| FriendRequestStatus | ACCEPTED | "accepted" | 已同意 |
| FriendRequestStatus | REJECTED | "rejected" | 已拒绝 |
| FriendRequestStatus | IGNORED | "ignored" | 已忽略 |

## 接口
| 接口名 | 属性 | 类型 |
|---|---|---|
| FriendRequestAttributes | id | string |
| FriendRequestAttributes | fromUserId | string |
| FriendRequestAttributes | toUserId | string |
| FriendRequestAttributes | message | string \| null |
| FriendRequestAttributes | source | FriendSource |
| FriendRequestAttributes | status | FriendRequestStatus |
| FriendRequestAttributes | respondedAt | Date \| null |

## DTO/白名单
- 列表字段: id, fromUserId, toUserId, message, source, status, createdAt
- 详情字段: id, fromUserId, toUserId, message, source, status, respondedAt, createdAt, updatedAt
- 可创建字段: fromUserId, toUserId, message, source
- 可更新字段: status, respondedAt
- 可筛选字段: fromUserId, toUserId, status
- 可排序字段: createdAt, respondedAt

## 钩子
- beforeCreate: 自动生成 UUID 作为 id；验证 fromUserId !== toUserId；检查是否已是好友；检查是否存在待处理的请求
- beforeUpdate: 当 status 变为 accepted 时，创建双向 Friend 记录，设置 respondedAt

## 索引
- `(toUserId, status)` BTREE - 查询待处理请求
- `(fromUserId, toUserId)` BTREE + 部分索引 WHERE status='pending' - 防止重复请求
- `(createdAt)` BTREE - 时间排序

## 业务逻辑
- **防重复**: 通过部分唯一索引防止重复发送 pending 请求
- **隐私保护**: 用户可设置 `User.searchable=false` 拒绝被搜索添加
- **自动过期**: 可定期清理 30 天未响应的 pending 请求
- **状态流转**: pending → accepted/rejected/ignored（不可逆）
