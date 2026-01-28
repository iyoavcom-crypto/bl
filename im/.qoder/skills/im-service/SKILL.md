---
name: im-service
description: 创建 IM 项目的业务服务层。当用户要求创建新服务、添加业务逻辑、实现 CRUD 服务时使用此技能。
---

# IM 服务层创建技能

创建符合项目规范的业务服务，支持 CRUD 工厂服务和自定义业务服务两种模式。

## 前置确认

创建服务前必须确认以下信息：

1. **服务名称**：英文名称（如 auth、user、message）
2. **服务类型**：
   - CRUD 服务：基于 `createCrudService` 工厂函数
   - 业务服务：自定义类形式
3. **依赖的模型**：需要操作的数据模型
4. **业务方法**：需要实现的具体方法列表

## 目录结构

```
services/
├── {service}.ts         # 单文件服务（简单场景）
└── {service}/           # 多文件服务（复杂场景）
    ├── index.ts         # 统一导出
    └── {sub}.ts         # 子模块
```

## 服务类型

### 1. CRUD 服务（推荐）

适用于标准的增删改查操作：

```typescript
/**
 * @packageDocumentation
 * @module services/{name}
 * @since 1.0.0
 * @author {author}
 * @tags [服务],[{标签}]
 * @description {服务描述}
 * @path src/services/{name}.ts
 * @see src/models/{model}/index.ts
 */

import { {Model} } from '@/models/{model}/index.js';
import { createCrudService } from '@/repo/index.js';
import type { CrudConfig } from '@/repo/index.js';
import {
  {MODEL}_LIST,
  {MODEL}_DETAIL,
  {MODEL}_CREATABLE,
  {MODEL}_UPDATABLE,
  {MODEL}_FILTERABLE,
  {MODEL}_SORTABLE,
} from "@/models/{model}/types/index.js";

const {model}CrudConfig: CrudConfig<{Model}> = {
  listFields: [...{MODEL}_LIST],
  detailFields: [...{MODEL}_DETAIL],
  creatableFields: [...{MODEL}_CREATABLE],
  updatableFields: [...{MODEL}_UPDATABLE],
  searchFields: ["name"], // 可搜索字段
  filterableFields: [...{MODEL}_FILTERABLE],
  sortableFields: [...{MODEL}_SORTABLE],
  defaultOrder: [["createdAt", "DESC"]],
};

const {Model}Service = createCrudService({Model}, {model}CrudConfig);
export default {Model}Service;
```

### 2. 业务服务（类形式）

适用于复杂业务逻辑：

```typescript
/**
 * @packageDocumentation
 * @module services/{name}
 * @since 1.0.0
 * @author {author}
 * @tags [服务],[{标签}]
 * @description {服务描述}
 * @path src/services/{name}.ts
 */

import { {Model} } from '@/models/{model}/index.js';
import type { {Type} } from '@/models/{model}/types/index.js';

/**
 * @class {Name}Service
 * @description {服务描述}
 */
class {Name}Service {
  /**
   * @function methodName
   * @description 方法描述
   * @param {ParamType} param - 参数说明
   * @returns {Promise<ReturnType>} 返回说明
   * @throws {Error} 异常说明
   */
  async methodName(param: ParamType): Promise<ReturnType> {
    // 业务逻辑实现
  }
}

export default new {Name}Service();
```

## 单例模式（延迟初始化）

需要延迟初始化的服务：

```typescript
let instance: SomeService | null = null;

function getInstance(): SomeService {
  if (!instance) {
    instance = createSomeService();
  }
  return instance;
}
```

## 错误处理

### 业务错误抛出

```typescript
const error = new Error("错误描述") as Error & { status?: number };
error.status = 409; // HTTP 状态码
throw error;
```

### 错误状态码约定

| 状态码 | 含义 |
|--------|------|
| 400 | 参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 冲突（如重复） |

## 导入规范

```typescript
// 1. 模型
import { Model } from '@/models/{model}/index.js';

// 2. 仓储层
import { createCrudService } from '@/repo/index.js';
import type { CrudConfig } from '@/repo/index.js';

// 3. 工具模块
import { someUtil } from '@/tools/{module}/index.js';

// 4. 类型（使用 type 导入）
import type { SomeType } from '@/models/{model}/types/index.js';
```

## 命名约定

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 文件名 | 小驼峰 | `user.ts`, `friendRequest.ts` |
| 类名 | 大驼峰 + Service | `UserService`, `AuthService` |
| 方法名 | 小驼峰，动词开头 | `create`, `getById`, `updateStatus` |
| 配置变量 | 模型名 + CrudConfig | `userCrudConfig` |

## 完整示例：认证服务

```typescript
/**
 * @packageDocumentation
 * @module services/auth
 * @since 1.0.0
 * @tags [服务],[认证],[JWT]
 * @description 认证服务：处理用户注册、登录、令牌签发
 */

import { User } from "@/models/user/index.js";
import { createJwtServiceFromEnv } from "@/tools/jwt/index.js";
import { verifyPassword } from "@/tools/crypto/password.js";
import type { RegisterRequest, LoginRequest, AuthSuccessData } from "@/models/auth/index.js";

// JWT 服务实例（单例）
let jwtService: ReturnType<typeof createJwtServiceFromEnv> | null = null;

function getJwtService() {
  if (!jwtService) {
    jwtService = createJwtServiceFromEnv();
  }
  return jwtService;
}

class AuthService {
  /**
   * @function register
   * @description 用户注册
   */
  async register(data: RegisterRequest): Promise<AuthSuccessData> {
    const { phone, password, pin } = data;

    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      const error = new Error("该手机号已被注册") as Error & { status?: number };
      error.status = 409;
      throw error;
    }

    const user = await User.create({ phone, password, pin });
    return await this.issueTokens(user);
  }

  /**
   * @function login
   * @description 用户登录
   */
  async login(data: LoginRequest): Promise<AuthSuccessData> {
    const { phone, password } = data;

    const user = await User.scope("withSecret").findOne({ where: { phone } });
    if (!user) {
      const error = new Error("用户不存在或密码错误") as Error & { status?: number };
      error.status = 401;
      throw error;
    }

    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      const error = new Error("用户不存在或密码错误") as Error & { status?: number };
      error.status = 401;
      throw error;
    }

    const safeUser = await User.findByPk(user.id);
    if (!safeUser) throw new Error("用户不存在");

    return await this.issueTokens(safeUser);
  }

  private async issueTokens(user: User): Promise<AuthSuccessData> {
    const jwt = getJwtService();
    // 签发令牌逻辑...
  }
}

export default new AuthService();
```

## 注意事项

1. 所有方法必须显式声明参数类型和返回类型
2. 禁止使用 `any` 类型
3. 必须使用 ESM 导入语法
4. 业务错误必须附加 `status` 状态码
5. 敏感操作需要使用 `scope("withSecret")` 获取完整数据
