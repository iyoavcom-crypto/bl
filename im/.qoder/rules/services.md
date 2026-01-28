---
trigger: glob
glob: src/services/**/*.ts
---

# 服务层编写规范

## 一、文件结构

```
services/
├── {service}.ts     # 单文件服务（简单场景）
└── {service}/       # 多文件服务（复杂场景）
    ├── index.ts     # 统一导出
    └── {sub}.ts     # 子模块
```

## 二、文档注释（强制）

文件头必须包含完整 JSDoc：

```typescript
/**
 * @packageDocumentation
 * @module services/{name}
 * @since 1.0.0
 * @author {author}
 * @tags [服务],[标签1],[标签2]
 * @description 服务描述
 * @path src/services/{name}.ts
 * @see 相关模块路径
 */
```

## 三、服务类型

### 1. CRUD 服务（推荐）

使用 `createCrudService` 工厂函数：

```typescript
import { Model } from '@/models';
import { createCrudService } from '@/repo';
import type { CrudConfig } from '@/repo';
import { MODEL_LIST, MODEL_FILTERABLE } from "@/models/{model}/types/index";

const crudConfig: CrudConfig<Model> = {
  listFields: [...MODEL_LIST],
  detailFields: [...MODEL_LIST],
  creatableFields: ["field1", "field2"],
  updatableFields: ["field1", "field2"],
  searchFields: ["name"],
  filterableFields: [...MODEL_FILTERABLE],
  defaultOrder: [["id", "ASC"]],
};

const ModelService = createCrudService(Model, crudConfig);
export default ModelService;
```

### 2. 业务服务（类形式）

复杂业务逻辑使用类封装：

```typescript
class AuthService {
  /**
   * @function methodName
   * @description 方法描述
   * @param {ParamType} param - 参数说明
   * @returns {Promise<ReturnType>} 返回说明
   * @throws {Error} 异常说明
   */
  async methodName(param: ParamType): Promise<ReturnType> {
    // 业务逻辑
  }
}

export default new AuthService();
```

## 四、依赖注入

### 单例模式（延迟初始化）

```typescript
let instance: SomeService | null = null;

function getInstance(): SomeService {
  if (!instance) {
    instance = createSomeService();
  }
  return instance;
}
```

## 五、错误处理

### 1. 业务错误

```typescript
const error = new Error("错误描述") as Error & { status?: number };
error.status = 409; // HTTP 状态码
throw error;
```

### 2. 错误状态码约定

- `400` - 参数错误
- `401` - 未认证
- `403` - 无权限
- `404` - 资源不存在
- `409` - 冲突（如重复）

## 六、导入规范

```typescript
// 1. 模型
import { Model } from '@/models';

// 2. 仓储层
import { createCrudService } from '@/repo';
import type { CrudConfig } from '@/repo';

// 3. 工具模块
import { someUtil } from '@/tools/{module}/index.js';

// 4. 类型（使用 type 导入）
import type { SomeType } from '@/models/{model}/index.js';
```

## 七、命名约定

- 文件名：`{service}.ts`（小驼峰）
- 类名：`{Service}Service`（大驼峰）
- 方法名：`{action}`（小驼峰，动词开头）
- 配置变量：`{model}CrudConfig`
