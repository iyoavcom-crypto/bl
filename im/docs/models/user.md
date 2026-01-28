# user 模型文档
模块位置：[src/models/user](../../../src/models/user)

## 基本信息
- 表名: "user"
- 模型: "User"
- 时间戳: true
- 软删除: true

## 字段
| 字段 | 中文名 | 类型 | 空 | 默认值 | 索引 | 备注 |
|---|---|---|---|---|---|---|
| id | 主键 | string | 否 | hook生成 |  | 7位随机数字 |
| pid | 上级用户ID | string \| null | 是 | 无 | BTREE | 自关联父级 |
| searchable | 是否允许被搜索 | boolean | 否 | true | BTREE |  |
| code | 邀请码 | string \| null | 是 | 无 | UNIQUE |  |
| phone | 手机号 | string | 否 | 无 | BTREE, UNIQUE | 验证: /^[0-9]+$/ |
| password | 密码哈希 | string | 否 | 无 |  | scrypt 哈希（beforeSave hook） |
| pin | 二级密码 | string | 否 | 无 |  | AES-256-GCM 加密（beforeSave hook） |
| roleId | 角色ID | string | 否 | "user" | BTREE | 引用 role.id |
| telegramId | Telegram ID | string \| null | 是 | 无 |  |  |
| teamId | 团队ID | string \| null | 是 | 无 |  |  |
| state | 用户状态 | UserState | 否 | "normal" | BTREE |  |
| vip | 是否VIP | boolean | 否 | false |  |  |
| name | 昵称 | string | 否 | hook生成 |  | 自动生成 |
| avatar | 头像 | string \| null | 是 | 无 |  |  |
| gender | 性别 | "male" \| "female" \| "unknown" | 否 | "unknown" |  |  |
| location | 位置信息 | UserLocation \| null | 是 | null |  | 用户自选 |
| ip | IP地址 | string \| null | 是 | 无 |  |  |
| ua | User-Agent | string \| null | 是 | 无 |  |  |
| longSession | 长期登录 | boolean | 否 | false |  |  |
| lastOnlineAt | 最后在线时间 | Date \| null | 是 | 无 | BTREE |  |
| privateMuted | 私聊禁言 | boolean | 否 | false | BTREE | 全局私聊禁言 |
| privateMuteUntil | 私聊禁言截止时间 | Date \| null | 是 | 无 |  | null 表示永久禁言 |
| createdAt | 创建时间 | Date | 否 | 无 | BTREE(DESC) | 复合索引 createdAt+id |
| updatedAt | 更新时间 | Date | 否 | 无 |  |  |
| deletedAt | 删除时间 | Date \| null | 是 | 无 |  | paranoid 软删除 |

## 关系
| 关系类型 | 别名 | 外键 | 目标模型 | 更新时 | 删除时 | 说明 |
|---|---|---|---|---|---|---|
| belongsTo | role | roleId | Role | 级联 | 限制 | 所属角色 |
| belongsTo | parent | pid | User | 级联 | 置空 | 上级用户 |
| hasMany | children | pid | User | 级联 | 置空 | 下级用户列表 |
| hasMany | devices | userId | Device | 级联 | 级联 | 设备列表 |
| hasMany | friendships | userId | Friend | 级联 | 级联 | 好友关系列表 |
| hasMany | sentRequests | fromUserId | FriendRequest | 级联 | 级联 | 发送的好友请求 |
| hasMany | receivedRequests | toUserId | FriendRequest | 级联 | 级联 | 收到的好友请求 |
| hasMany | groupMemberships | userId | GroupMember | 级联 | 级联 | 群成员关系列表 |
| hasMany | sentMessages | senderId | Message | 级联 | 置空 | 发送的消息 |
| hasMany | initiatedCalls | callerId | Call | 级联 | 级联 | 发起的通话 |
| hasMany | receivedCalls | calleeId | Call | 级联 | 级联 | 接收的通话 |

## 常量
| 常量名 | 键 | 值 | 说明 |
|---|---|---|---|
| UserState | NORMAL | "normal" | 正常 |
| UserState | MUTED | "muted" | 禁言 |
| UserState | BANNED | "banned" | 封禁 |
| UserState | CANCELED | "canceled" | 注销 |
| UserState | RISK_CONTROLLED | "risk_controlled" | 风控 |
| Gender | MALE | "male" | 男性 |
| Gender | FEMALE | "female" | 女性 |
| Gender | UNKNOWN | "unknown" | 未知 |

## 接口
| 接口名 | 属性 | 类型 |
|---|---|---|
| UserLocation | country | string |
| UserLocation | province | string |
| UserLocation | city | string |

## DTO/白名单
- 列表字段: id, pid, phone, name, avatar, state, vip, roleId, searchable, privateMuted, createdAt
- 详情字段: id, pid, searchable, code, phone, name, avatar, state, vip, roleId, telegramId, teamId, gender, location, longSession, lastOnlineAt, privateMuted, privateMuteUntil, createdAt, updatedAt
- 可创建字段: phone, password, pin, name, avatar, roleId
- 可更新字段: pid, name, avatar, state, vip, roleId, gender, location, longSession, searchable, privateMuted, privateMuteUntil
- 可筛选字段: state, vip, roleId, gender, searchable, pid, privateMuted
- 可排序字段: createdAt, lastOnlineAt, name

## 钩子
- beforeCreate: 自动生成 id（7位随机数字）、name
- beforeSave: password 变更时自动 scrypt 哈希；pin 变更时自动 AES-256-GCM 加密

## 禁言逻辑
### 全局禁言（state='muted'）
- 用户无法发送任何消息（私聊+群聊）
- 由管理员设置

### 私聊禁言（privateMuted=true）
- 用户无法向任何人发送私聊消息
- 群聊不受影响
- 由管理员设置

### 禁言时间判断
- `privateMuted=true && privateMuteUntil=null` → 永久禁言
- `privateMuted=true && privateMuteUntil > now` → 定时禁言中
- `privateMuted=true && privateMuteUntil <= now` → 禁言已过期，查询时自动解禁
- `privateMuted=false` → 未被禁言
