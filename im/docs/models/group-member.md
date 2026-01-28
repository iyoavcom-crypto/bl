# group-member 模型文档
模块位置：[src/models/group-member](../../../src/models/group-member)

## 基本信息
- 表名: "group_member"
- 模型: "GroupMember"
- 时间戳: true
- 软删除: true

## 字段
| 字段 | 中文名 | 类型 | 空 | 默认值 | 索引 | 备注 |
|---|---|---|---|---|---|---|
| id | 主键 | string | 否 | hook生成 | PRIMARY KEY | UUID 36位 |
| groupId | 群组ID | string | 否 | 无 | BTREE | 引用 group.id |
| userId | 用户ID | string | 否 | 无 | BTREE | 引用 user.id |
| role | 角色 | GroupMemberRole | 否 | "member" | BTREE | owner/admin/member |
| groupNickname | 群昵称 | string \| null | 是 | 无 |  | 长度 ≤ 50 |
| isMuted | 是否被禁言 | boolean | 否 | false | BTREE |  |
| muteUntil | 禁言截止时间 | Date \| null | 是 | 无 |  | null 表示永久禁言 |
| doNotDisturb | 免打扰 | boolean | 否 | false |  |  |
| joinedAt | 加群时间 | Date | 否 | hook生成 | BTREE |  |
| updatedAt | 更新时间 | Date | 否 | 无 |  |  |
| deletedAt | 删除时间 | Date \| null | 是 | 无 |  | paranoid 软删除（退群） |

## 关系
| 关系类型 | 别名 | 外键 | 目标模型 | 更新时 | 删除时 | 说明 |
|---|---|---|---|---|---|---|
| belongsTo | group | groupId | Group | 级联 | 级联 | 所属群组 |
| belongsTo | user | userId | User | 级联 | 级联 | 成员用户 |

## 常量
| 常量名 | 键 | 值 | 说明 |
|---|---|---|---|
| GroupMemberRole | OWNER | "owner" | 群主 |
| GroupMemberRole | ADMIN | "admin" | 管理员 |
| GroupMemberRole | MEMBER | "member" | 普通成员 |

## 接口
| 接口名 | 属性 | 类型 |
|---|---|---|
| GroupMemberAttributes | id | string |
| GroupMemberAttributes | groupId | string |
| GroupMemberAttributes | userId | string |
| GroupMemberAttributes | role | GroupMemberRole |
| GroupMemberAttributes | groupNickname | string \| null |
| GroupMemberAttributes | isMuted | boolean |
| GroupMemberAttributes | muteUntil | Date \| null |
| GroupMemberAttributes | doNotDisturb | boolean |
| GroupMemberAttributes | joinedAt | Date |

## DTO/白名单
- 列表字段: id, groupId, userId, role, groupNickname, isMuted, joinedAt
- 详情字段: id, groupId, userId, role, groupNickname, isMuted, muteUntil, doNotDisturb, joinedAt, updatedAt
- 可创建字段: groupId, userId, role
- 可更新字段: role, groupNickname, isMuted, muteUntil, doNotDisturb
- 可筛选字段: groupId, userId, role, isMuted
- 可排序字段: joinedAt

## 钩子
- beforeCreate: 自动生成 UUID 作为 id；设置 joinedAt=now；验证群人数上限
- afterCreate: 更新 Group.memberCount (+1)
- afterDestroy: 更新 Group.memberCount (-1)；验证群主不能直接退群

## 索引
- `(groupId, userId)` UNIQUE - 防止重复加群
- `(userId)` BTREE - 查询用户加入的所有群
- `(groupId, role)` BTREE - 查询群管理员
- `(groupId, isMuted)` BTREE - 查询被禁言成员
- `(joinedAt)` BTREE - 时间排序

## 禁言逻辑
- `isMuted=true && muteUntil=null` → 永久禁言
- `isMuted=true && muteUntil > now` → 定时禁言中
- `isMuted=true && muteUntil <= now` → 禁言已过期，查询时自动解禁
- `isMuted=false` → 未被禁言

## 业务逻辑
- **角色管理**: 群主可设置管理员，管理员只能操作普通成员
- **退群限制**: 群主必须先转让群主身份才能退群
- **踢人权限**: 群主可踢任何人，管理员只能踢普通成员
- **禁言权限**: 群主可禁言管理员和成员，管理员只能禁言成员
