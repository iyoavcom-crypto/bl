# role 模型文档
模块位置：[src/models/role](../../../src/models/role)

## 基本信息
- 表名: "role"
- 模型: "Role"
- 时间戳: false
- 软删除: false

## 字段
| 字段 | 中文名 | 类型 | 空 | 默认值 | 索引 | 备注 |
|---|---|---|---|---|---|---|
| id | 主键 | string | 否 | 无 | PRIMARY KEY | 36 位字符串主键 |
| name | 角色名称 | string | 否 | 无 | UNIQUE | 唯一角色名称，长度 ≤ 30 |
| group | 角色分组 | "system" \| "project" \| "user" \| "admin" | 否 | "user" | BTREE | 参考 RoleGroup 枚举 |

## 关系
- 当前模型文件中未显式定义 Sequelize 关联。
- User 模型通过字段 roleId (外键) 引用本模型的 id 字段。

## 常量
| 常量名 | 键 | 值 | 说明 |
|---|---|---|---|
| RoleGroup | SYSTEM | "system" | 系统级角色 |
| RoleGroup | PROJECT | "project" | 项目级角色 |
| RoleGroup | USER | "user" | 普通用户角色 |
| RoleGroup | ADMIN | "admin" | 管理员角色 |

## 接口
| 接口名 | 属性 | 类型 |
|---|---|---|
| RoleAttributes | id | string |
| RoleAttributes | name | string |
| RoleAttributes | group | RoleGroup |

## DTO/白名单
- 列表字段: id, name, group
- 可筛选字段: id, name, group

## 钩子
- 当前模型未定义 Sequelize 钩子。

