---
trigger: glob
glob: src/routes/**/*.ts
---

# 路由模块编写规范

## 一、目录结构

```
routes/
├── index.ts         # 路由聚合入口
├── {resource}.ts    # 资源路由（如 auth.ts）
└── admin/           # 管理后台路由
    └── {resource}.ts
```

## 二、文档注释（强制）

```typescript
/**
 * @packageDocumentation
 * @module routes/api/{name}
 * @since 1.0.0
 * @author {author}
 * @tags [路由],[标签1],[标签2]
 * @description 路由描述
 * @path src/routes/{name}.ts
 * @see 对应控制器路径
 */
```

## 三、路由定义

### 1. 基本结构

```typescript
import { Router } from "express";
import { requireAuth } from "@/middleware/auth/index.js";
import { handler1, handler2 } from "@/contracts/{resource}.controller";

const router = Router();

// 公开路由（无需认证）
router.post("/action", handler1);

// 受保护路由（需要认证）
router.get("/protected", requireAuth, handler2);

export default router;
```

### 2. 路由注释（每个路由必须）

```typescript
/**
 * @route {METHOD} /{path}
 * @description 接口描述
 * @access Public | Protected
 */
router.{method}("/{path}", ...middlewares, handler);
```

## 四、路由聚合（index.ts）

```typescript
import { Router } from "express";
import authRouter from "./auth.js";
import { requireAuth } from "@/middleware/auth/index.js";

const router = Router();

// 公开路由
router.use("/auth", authRouter);

// 受保护路由
router.use("/admin/users", requireAuth, userRouter);

export default router;
```

## 五、RESTful 约定

| 操作 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 列表 | GET | `/{resource}` | 分页查询 |
| 详情 | GET | `/{resource}/:id` | 单条查询 |
| 创建 | POST | `/{resource}` | 新增 |
| 更新 | PUT | `/{resource}/:id` | 全量更新 |
| 部分更新 | PATCH | `/{resource}/:id` | 部分更新 |
| 删除 | DELETE | `/{resource}/:id` | 软删除 |

## 六、中间件使用

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

## 七、导入规范

```typescript
// 1. Express Router
import { Router } from "express";

// 2. 中间件
import { requireAuth } from "@/middleware/auth/index.js";

// 3. 控制器
import { handler } from "@/contracts/{resource}.controller";
```

## 八、命名约定

- 文件名：`{resource}.ts`（小写，复数形式可选）
- 路由路径：`/{resource}`（小写，连字符分隔）
- 参数：`:id`、`:slug`（小驼峰）
