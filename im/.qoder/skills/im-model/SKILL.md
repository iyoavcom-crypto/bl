---
name: im-model
description: 创建 IM 项目的 Sequelize 模型。当用户要求创建新模型、定义数据表、添加数据库实体时使用此技能。
---

# IM 模型创建技能

创建符合项目规范的 Sequelize 模型，包含完整的类型定义、字段配置常量、关联关系和钩子函数。

## 前置确认

创建模型前必须确认以下信息：

1. **模型名称**：英文名称（如 user、message、group）
2. **中文名称**：模型的中文描述
3. **字段列表**：每个字段需要确认
   - 字段名（英文）
   - 中文名
   - 数据类型（STRING、INTEGER、BOOLEAN、DATE、JSON、ENUM 等）
   - 是否允许空（allowNull）
   - 默认值
   - 是否唯一
   - 验证规则
4. **关联关系**：与其他模型的关系（belongsTo、hasMany、hasOne）
5. **敏感字段**：需要在 toJSON 中排除的字段
6. **索引**：需要创建的数据库索引

## 目录结构

```
src/models/{modelName}/
├── index.ts           # 聚合导出
├── {modelName}.ts     # 模型定义
├── types/
│   ├── index.ts       # 类型聚合导出
│   ├── {modelName}.ts # 属性接口 + 6个字段常量
│   └── const.ts       # 枚举常量（可选）
├── association.ts     # 关联关系
└── hook.ts            # 钩子函数
```

## 必须定义的 6 个字段常量

```typescript
export const {MODEL}_LIST = [...] as const;       // 列表查询字段
export const {MODEL}_DETAIL = [...] as const;     // 详情查询字段
export const {MODEL}_CREATABLE = [...] as const;  // 创建时允许字段
export const {MODEL}_UPDATABLE = [...] as const;  // 更新时允许字段
export const {MODEL}_FILTERABLE = [...] as const; // 可筛选字段
export const {MODEL}_SORTABLE = [...] as const;   // 可排序字段
```

## 模型文件模板

### {modelName}.ts

```typescript
import { DataTypes, Model, Sequelize, type Optional } from "sequelize";
import type { {Model}Attributes } from "./types/index.js";
import { {model}BeforeCreateHook } from "./hook.js";
import { gen{Model}Id } from "@/utils/index.js";

export type {Model}CreationAttributes = Optional<
  {Model}Attributes,
  "id" | "createdAt" | "updatedAt"
>;

export class {Model} extends Model<{Model}Attributes, {Model}CreationAttributes> 
  implements {Model}Attributes {
  // 声明所有字段
  declare id: string;
  // ... 其他字段

  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date | null;

  // 如有敏感字段，重写 toJSON
  override toJSON(): Omit<{Model}Attributes, "sensitiveField"> {
    const plain = super.get({ plain: true }) as unknown as {Model}Attributes;
    const { sensitiveField: _, ...safe } = plain;
    return safe;
  }
}

export function init{Model}(sequelize: Sequelize): typeof {Model} {
  {Model}.init(
    {
      id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        primaryKey: true,
        defaultValue: () => gen{Model}Id(),
        comment: "主键",
      },
      // ... 其他字段定义
      createdAt: { type: DataTypes.DATE, allowNull: false, comment: "创建时间" },
      updatedAt: { type: DataTypes.DATE, allowNull: false, comment: "更新时间" },
    },
    {
      sequelize,
      modelName: "{Model}",
      tableName: "{table_name}",
      timestamps: true,
      paranoid: true,  // 软删除
      underscored: false,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      // 敏感字段排除
      defaultScope: { attributes: { exclude: ["sensitiveField"] } },
      scopes: { withSecret: { attributes: { include: ["sensitiveField"] } } },
      indexes: [
        // 索引定义
      ],
      comment: "{中文名}表",
    }
  );

  {Model}.beforeCreate({model}BeforeCreateHook);
  return {Model};
}
```

### types/{modelName}.ts

```typescript
/**
 * @packageDocumentation
 * @module types/models/{modelName}
 */

export interface {Model}Attributes {
  id: string;
  // ... 所有字段类型
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export const {MODEL}_LIST = ["id", ...] as const;
export const {MODEL}_DETAIL = ["id", ...] as const;
export const {MODEL}_CREATABLE = [...] as const;
export const {MODEL}_UPDATABLE = [...] as const;
export const {MODEL}_FILTERABLE = [...] as const;
export const {MODEL}_SORTABLE = ["createdAt"] as const;
```

### association.ts

```typescript
import type { Sequelize } from "sequelize";
import { {Model} } from "./{modelName}.js";
import { OtherModel } from "@/models/other/index.js";

export function setup{Model}Associations(_sequelize: Sequelize): void {
  {Model}.belongsTo(OtherModel, {
    foreignKey: "otherModelId",
    as: "otherModel",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });
}
```

### hook.ts

```typescript
import type { {Model} } from "./{modelName}.js";

export function {model}BeforeCreateHook(instance: {Model}): void {
  // 创建前逻辑
}
```

### index.ts

```typescript
export { {Model}, init{Model} } from "./{modelName}.js";
export { setup{Model}Associations } from "./association.js";
export type { {Model}Attributes } from "./types/index.js";
export {
  {MODEL}_LIST,
  {MODEL}_DETAIL,
  {MODEL}_CREATABLE,
  {MODEL}_UPDATABLE,
  {MODEL}_FILTERABLE,
  {MODEL}_SORTABLE,
} from "./types/index.js";
```

## 注意事项

1. 所有字段必须显式声明类型，禁止使用 `any`
2. 必须使用 ESM 导入语法，路径带 `.js` 扩展名
3. 必须使用 `paranoid: true` 实现软删除
4. 敏感字段必须通过 `defaultScope` 和 `toJSON()` 双重保护
5. 创建完模型后需要在 `src/models/index.ts` 中注册
