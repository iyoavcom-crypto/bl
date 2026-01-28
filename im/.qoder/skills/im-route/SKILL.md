---
name: im-route
description: 创建 IM 项目的 Express 路由。当用户要求创建新路由、添加 API 端点、定义接口时使用此技能。
---

# IM 路由创建技能

创建符合项目规范的 Express 路由，支持 RESTful API 和自定义端点。

## 前置确认

创建路由前必须确认以下信息：

1. **路由名称**：资源名称（如 auth、user、message）
2. **路由前缀**：URL 前缀（如 `/api/auth`、`/api/im/messages`）
3. **端点列表**：需要实现的具体端点
   - HTTP 方法（GET/POST/PUT/PATCH/DELETE）
   - 路径
   - 是否需要认证
   - 是否需要权限控制
4. **控制器方法**：对应的处理函数

## 目录结构

```
routes/
├── index.ts         # 路由聚合入口
├── auth.ts          # 认证路由（公开）
├── admin/           # 管理后台路由（需认证）
│   ├── index.ts
│   └── {resource}.ts
└── im/              # IM 业务路由（需认证）
    ├── index.ts
    └── {resource}.ts
```

## 路由文件模板

### 基础路由

```typescript
/**
 * @packageDocumentation
 * @module routes/api/{name}
 * @since 1.0.0
 * @author {author}
 * @tags [路由],[{标签}]
 * @description {路由描述}
 * @path src/routes/{name}.ts
 * @see src/contracts/{name}.controller.ts
 */

import { Router } from "express";
import { requireAuth } from "@/middleware/auth/index.js";
import { handler1, handler2 } from "@/contracts/{name}.controller.js";

const router = Router();

/**
 * @route POST /{resource}
 * @description 创建资源
 * @access Protected
 */
router.post("/", requireAuth, handler1);

/**
 * @route GET /{resource}/:id
 * @description 获取资源详情
 * @access Protected
 */
router.get("/:id", requireAuth, handler2);

export default router;
```

## RESTful 约定

| 操作 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 列表 | GET | `/{resource}` | 分页查询 |
| 详情 | GET | `/{resource}/:id` | 单条查询 |
| 创建 | POST | `/{resource}` | 新增 |
| 更新 | PUT | `/{resource}/:id` | 全量更新 |
| 部分更新 | PATCH | `/{resource}/:id` | 部分更新 |
| 删除 | DELETE | `/{resource}/:id` | 软删除 |

## 中间件使用

### 1. 认证中间件

```typescript
import { requireAuth } from "@/middleware/auth/index.js";

// 单路由
router.get("/me", requireAuth, handler);

// 路由组
router.use("/admin", requireAuth, adminRouter);
```

### 2. 权限守卫

```typescript
import { requireAuth, requireRole, requireVip } from "@/middleware/auth/index.js";

// 角色守卫
router.use("/admin", requireAuth, requireRole(["ADMIN"]), adminRouter);

// VIP 守卫
router.get("/premium", requireAuth, requireVip, handler);
```

### 3. 设备验证

```typescript
import { requireDevice } from "@/middleware/auth/index.js";

// 需要设备信息
router.post("/register-device", requireAuth, requireDevice, handler);
```

## 路由聚合

### routes/index.ts

```typescript
import { Router } from "express";
import authRouter from "./auth.js";
import adminRouter from "./admin/index.js";
import imRouter from "./im/index.js";
import { requireAuth } from "@/middleware/auth/index.js";

const router = Router();

// 公开路由
router.use("/auth", authRouter);

// 受保护路由
router.use("/admin", requireAuth, adminRouter);
router.use("/im", requireAuth, imRouter);

export default router;
```

### routes/admin/index.ts

```typescript
import { Router } from "express";
import userRouter from "./user.js";
import deviceRouter from "./device.js";

const router = Router();

router.use("/users", userRouter);
router.use("/devices", deviceRouter);

export default router;
```

## 完整示例：认证路由

```typescript
/**
 * @packageDocumentation
 * @module routes/api/auth
 * @since 1.0.0
 * @tags [路由],[认证],[登录],[注册]
 * @description 认证路由：注册、登录、退出、获取当前用户
 */

import { Router } from "express";
import { requireAuth } from "@/middleware/auth/index.js";
import { register, login, logout, me, refresh } from "@/contracts/auth.controller.js";

const router = Router();

/**
 * @route POST /auth/register
 * @description 用户注册
 * @access Public
 */
router.post("/register", register);

/**
 * @route POST /auth/login
 * @description 用户登录
 * @access Public
 */
router.post("/login", login);

/**
 * @route POST /auth/logout
 * @description 用户退出
 * @access Protected
 */
router.post("/logout", requireAuth, logout);

/**
 * @route GET /auth/me
 * @description 获取当前用户信息
 * @access Protected
 */
router.get("/me", requireAuth, me);

/**
 * @route POST /auth/refresh
 * @description 刷新令牌
 * @access Public
 */
router.post("/refresh", refresh);

export default router;
```

## CRUD 管理路由示例

```typescript
/**
 * @packageDocumentation
 * @module routes/admin/user
 * @tags [路由],[管理],[用户]
 * @description 用户管理路由
 */

import { Router } from "express";
import UserService from "@/services/user.js";
import { createContract } from "@/contracts/crud/create.js";
import { okContract, failContract } from "@/contracts/index.js";

const router = Router();
const contract = createContract(UserService);

/**
 * @route GET /admin/users
 * @description 用户列表
 */
router.get("/", contract.list);

/**
 * @route GET /admin/users/:id
 * @description 用户详情
 */
router.get("/:id", contract.getById);

/**
 * @route POST /admin/users
 * @description 创建用户
 */
router.post("/", contract.create);

/**
 * @route PUT /admin/users/:id
 * @description 更新用户
 */
router.put("/:id", contract.update);

/**
 * @route DELETE /admin/users/:id
 * @description 删除用户
 */
router.delete("/:id", contract.remove);

export default router;
```

## 命名约定

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 文件名 | 小写，连字符分隔 | `user.ts`, `friend-request.ts` |
| 路由路径 | 小写，连字符分隔 | `/users`, `/friend-requests` |
| URL 参数 | 小驼峰 | `:id`, `:userId`, `:slug` |

## 注意事项

1. 每个路由必须有 JSDoc 注释说明
2. 必须明确标注 `@access Public` 或 `@access Protected`
3. 必须使用 ESM 导入语法，路径带 `.js` 扩展名
4. 创建新路由后需要在对应的 `index.ts` 中注册
5. 公开路由放在 `routes/` 根目录
6. 需认证的路由放在 `routes/admin/` 或 `routes/im/` 目录
