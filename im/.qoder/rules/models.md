---
trigger: glob
glob: ./src/models/**/*.md
---
# 模型文档生成规则

## 文件命名
- 路径：`docs/project/models/{modelName}.md`
- 文件名：模型名小写（如 user.md、role.md）

## 文档结构

```markdown
# {modelName} 模型文档
模块位置：[src/models/{modelName}](../../../src/models/{modelName})

## 基本信息
- 表名: "{tableName}"
- 模型: "{ModelClass}"
- 时间戳: true/false
- 软删除: true/false

## 字段
| 字段 | 中文名 | 类型 | 空 | 默认值 | 索引 | 备注 |
|---|---|---|---|---|---|---|
| {fieldName} | {中文名} | {TypeScript类型} | 是/否 | {默认值/无/hook生成} | {索引类型} | {备注} |

## 关系
| 关系类型 | 别名 | 外键 | 目标模型 | 更新时 | 删除时 | 说明 |
|---|---|---|---|---|---|---|
| belongsTo/hasMany/hasOne | {alias} | {foreignKey} | {TargetModel} | 级联/限制/置空 | 级联/限制/置空 | {说明} |

## 常量
| 常量名 | 键 | 值 | 说明 |
|---|---|---|---|
| {ConstName} | {KEY} | "{value}" | {中文说明} |

## 接口
| 接口名 | 属性 | 类型 |
|---|---|---|
| {InterfaceName} | {property} | {type} |

## DTO/白名单
- 列表字段: {LIST常量字段}
- 详情字段: {DETAIL常量字段}
- 可创建字段: {CREATABLE常量字段}
- 可更新字段: {UPDATABLE常量字段}
- 可筛选字段: {FILTERABLE常量字段}
- 可排序字段: {SORTABLE常量字段}

## 钩子
- beforeCreate: {描述}
- beforeSave: {描述}
```

## 字段规则
| 列名 | 说明 |
|---|---|
| 空 | 是/否（allowNull） |
| 默认值 | 具体值、无、hook生成 |
| 索引 | BTREE/UNIQUE/BTREE(DESC)，无索引留空 |
| 备注 | 验证规则、加密方式、引用关系等 |

## 常量规则
- 从 `types/const.ts` 提取
- 说明必须取自代码中文注释

## 数据来源
- 字段：`{modelName}.ts` 中 `init()` 定义
- 关系：`association.ts`
- 常量：`types/const.ts`
- 钩子：`hook.ts`
- DTO：`types/{modelName}.ts` 中 LIST/DETAIL/CREATABLE 等常量
