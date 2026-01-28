# group 模型文档
模块位置：[src/models/group](../../../src/models/group)

## 基本信息
- 表名: "group"
- 模型: "Group"
- 时间戳: true
- 软删除: true

## 字段
| 字段 | 中文名 | 类型 | 空 | 默认值 | 索引 | 备注 |
|---|---|---|---|---|---|---|
| id | 主键 | string | 否 | hook生成 | PRIMARY KEY | UUID 36位 |
| name | 群名称 | string | 否 | 无 |  | 长度 ≤ 50 |
| avatar | 群头像 | string \| null | 是 | 无 |  | URL，长度 ≤ 255 |
| description | 群简介 | string \| null | 是 | 无 |  | 长度 ≤ 500 |
| ownerId | 群主ID | string | 否 | 无 | BTREE | 引用 user.id |
| maxMembers | 最大成员数 | number | 否 | 500 |  |  |
| memberCount | 当前成员数 | number | 否 | 1 | BTREE | 由钩子自动维护 |
| joinMode | 加群方式 | GroupJoinMode | 否 | "invite" |  | invite/approval/open |
| muteAll | 全员禁言 | boolean | 否 | false |  | 仅群主和管理员可发言 |
| createdAt | 创建时间 | Date | 否 | 无 | BTREE |  |
| updatedAt | 更新时间 | Date | 否 | 无 |  |  |
| deletedAt | 删除时间 | Date \| null | 是 | 无 |  | paranoid 软删除（解散群） |

## 关系
| 关系类型 | 别名 | 外键 | 目标模型 | 更新时 | 删除时 | 说明 |
|---|---|---|---|---|---|---|
| belongsTo | owner | ownerId | User | 级联 | 限制 | 群主 |
| hasMany | members | groupId | GroupMember | 级联 | 级联 | 成员列表 |
| hasOne | conversation | groupId | Conversation | 级联 | 级联 | 对应会话 |

## 常量
| 常量名 | 键 | 值 | 说明 |
|---|---|---|---|
| GroupJoinMode | INVITE | "invite" | 仅邀请可加入 |
| GroupJoinMode | APPROVAL | "approval" | 需管理员审批 |
| GroupJoinMode | OPEN | "open" | 公开加入 |

## 接口
| 接口名 | 属性 | 类型 |
|---|---|---|
| GroupAttributes | id | string |
| GroupAttributes | name | string |
| GroupAttributes | avatar | string \| null |
| GroupAttributes | description | string \| null |
| GroupAttributes | ownerId | string |
| GroupAttributes | maxMembers | number |
| GroupAttributes | memberCount | number |
| GroupAttributes | joinMode | GroupJoinMode |
| GroupAttributes | muteAll | boolean |

## DTO/白名单
- 列表字段: id, name, avatar, ownerId, memberCount, joinMode, createdAt
- 详情字段: id, name, avatar, description, ownerId, maxMembers, memberCount, joinMode, muteAll, createdAt, updatedAt
- 可创建字段: name, avatar, description, ownerId, joinMode
- 可更新字段: name, avatar, description, joinMode, muteAll
- 可筛选字段: ownerId, joinMode, muteAll
- 可排序字段: createdAt, memberCount

## 钩子
- beforeCreate: 自动生成 UUID 作为 id
- afterCreate: 创建群主 GroupMember 记录（role='owner'）；创建群 Conversation 记录（type='group'）
- beforeDestroy: 验证只有群主可以解散群

## 索引
- `(ownerId)` BTREE - 查询某人创建的群
- `(memberCount)` BTREE - 按活跃度排序
- `(createdAt)` BTREE - 时间排序

## 业务逻辑
- **成员计数**: `memberCount` 通过 GroupMember 钩子自动维护
- **权限控制**: 只有群主和管理员可修改群信息
- **人数上限**: 创建 GroupMember 前验证 `memberCount < maxMembers`
- **全员禁言**: `muteAll=true` 时，仅群主和管理员（role='owner'或'admin'）可发消息
