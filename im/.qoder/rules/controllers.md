---
trigger: glob
glob: src/contracts/**/*.ts
---

# 控制器模块编写规范

## 一、目录结构

```
contracts/
├── index.ts              # 统一导出
├── {resource}.controller.ts  # 控制器
└── crud/                 # 通用响应工具
    ├── ok.ts             # 成功响应
    ├── fail.ts           # 失败响应
    ├── wrap.ts           # 错误包装
    └── create.ts         # 创建响应
```

## 二、文档注释（强制）

```typescript
/**
 * @packageDocumentation
 * @module contracts/{name}.controller
 * @since 1.0.0
 * @author {author}
 * @tags [controller],[标签1],[标签2]
 * @description 控制器描述
 * @path src/contracts/{name}.controller.ts
 * @see 对应路由路径
 * @see 对应服务路径
 */
```

## 三、控制器定义

### 1. 使用 wrap 包装（强制）

```typescript
import { wrap } from "./crud/wrap.js";
import { ok, created } from "./crud/ok.js";
import { badRequest, unauthorized } from "./crud/fail.js";

/**
 * @route {METHOD} /{path}
 * @description 接口描述
 * @access Public | Protected
 */
export const handlerName = wrap(
  async (req: Request, res: Response, _next: NextFunction) => {
    // 业务逻辑
    ok(res, data, "成功消息");
  }
);
```

### 2. 每个处理器必须有路由注释

```typescript
/**
 * @route POST /auth/register
 * @description 用户注册接口
 * @access Public
 */
export const register = wrap(async (req, res, _next) => { ... });
```

## 四、请求处理流程

### 1. 参数验证

```typescript
export const handler = wrap(async (req, res, _next) => {
  const body = req.body as RequestType;

  // 必填字段验证
  if (!body.field1 || !body.field2) {
    badRequest(res, "字段1和字段2不能为空");
    return;
  }

  // 格式验证
  if (!/^[0-9]+$/.test(body.phone)) {
    badRequest(res, "手机号格式不正确");
    return;
  }

  // 调用服务层
  const result = await Service.method(body);
  ok(res, result, "成功消息");
});
```

### 2. 认证用户访问

```typescript
export const protectedHandler = wrap(async (req, res, _next) => {
  const userPayload = req.user;

  if (!userPayload) {
    unauthorized(res, "未认证");
    return;
  }

  // 使用 userPayload.sub 获取用户ID
  const data = await Service.getData(userPayload.sub);
  ok(res, data, "获取成功");
});
```

## 五、响应工具

### 1. 成功响应

```typescript
import { ok, created } from "./crud/ok.js";

ok(res, data, "操作成功");           // 200
created(res, data, "创建成功");      // 201
```

### 2. 失败响应

```typescript
import { badRequest, unauthorized, notFound, forbidden } from "./crud/fail.js";

badRequest(res, "参数错误");         // 400
unauthorized(res, "未认证");         // 401
forbidden(res, "无权限");            // 403
notFound(res, "资源不存在");         // 404
```

## 六、类型处理

### 1. 请求体类型

```typescript
import type { RequestType } from "@/models/{resource}/index.js";

const body = req.body as RequestType;
```

### 2. 路径参数

```typescript
const { id } = req.params;
```

### 3. 查询参数

```typescript
const { page, limit } = req.query;
```

## 七、导入规范

```typescript
// 1. Express 类型
import type { Request, Response, NextFunction } from "express";

// 2. 服务层
import Service from "@/services/{resource}.js";

// 3. 类型
import type { RequestType, ResponseType } from "@/models/{resource}/index.js";

// 4. 响应工具
import { wrap } from "./crud/wrap.js";
import { ok, created } from "./crud/ok.js";
import { badRequest, unauthorized } from "./crud/fail.js";
```

## 八、命名约定

- 文件名：`{resource}.controller.ts`
- 处理器：动词形式（`create`、`list`、`update`、`remove`）
- 未使用参数：`_next`、`_req`（下划线前缀）
