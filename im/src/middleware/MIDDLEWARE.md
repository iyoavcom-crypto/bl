# 中间件模块 (Middleware)

> 版本：1.0.0 | 更新：2026-01-25

## 概述

中间件模块提供 Express 应用所需的各类中间件功能，包括认证、跨域、日志、限流、请求处理等。

## 目录结构

```
src/middleware/
├── index.ts          # 统一聚合出口
├── auth/             # JWT 认证与权限守卫
│   ├── index.ts      # 认证模块出口
│   ├── extract.ts    # Token 提取
│   ├── verify.ts     # Token 验证
│   ├── guards.ts     # 权限守卫
│   └── types.ts      # Express 类型扩展
├── cors/             # CORS 跨域配置
│   └── index.ts
├── logging/          # 请求日志
│   ├── index.ts      # 日志中间件
│   └── config.ts     # 日志配置
├── rate-limit/       # 限流中间件
│   └── index.ts
├── request/          # 请求处理与响应封装
│   ├── index.ts      # 响应函数
│   ├── pagination.ts # 分页工具
│   └── app.ts        # App ID 中间件
└── request-id/       # 请求标识追踪
    └── index.ts
```

## 使用方式

### 统一导入

```typescript
import {
  // 认证
  requireAuth,
  requireRole,
  requireScopes,
  requireVip,
  requireTeam,
  requireTokenKind,
  requireUserId,
  extractBearerToken,

  // CORS
  useCorsMiddleware,

  // 日志
  requestLogger,
  createRequestLogger,

  // 限流
  rateLimit,
  createRateLimiter,

  // 请求标识
  ensureRequestId,

  // 响应函数
  ok,
  created,
  pagedOk,
  empty,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,

  // 分页
  normalizePagination,
  toLimitOffset,

  // App ID
  extractAppId,
  requireAppId,
} from "@/middleware";
```

## 模块详解

### 1. 认证模块 (auth/)

#### Token 提取

```typescript
import { extractBearerToken } from "@/middleware";

// 从请求头提取 Bearer Token
const result = extractBearerToken(req);
if (result.success) {
  console.log(result.token);
} else {
  console.log(result.error);
}
```

#### 认证中间件

```typescript
import { requireAuth } from "@/middleware";

// 强制认证，验证后 req.user 可用
router.get("/profile", requireAuth, handler);
```

#### 权限守卫

```typescript
import {
  requireRole,
  requireScopes,
  requireVip,
  requireTeam,
  requireTokenKind,
  requireUserId,
} from "@/middleware";

// 角色守卫
router.delete("/users/:id", requireAuth, requireRole(["ADMIN"]), handler);

// 作用域守卫
router.post("/posts", requireAuth, requireScopes(["write"]), handler);

// VIP 守卫
router.get("/premium", requireAuth, requireVip(), handler);

// 团队守卫
router.get("/team-resource", requireAuth, requireTeam(["team-a"]), handler);

// Token 类型守卫
router.post("/refresh", requireAuth, requireTokenKind("refresh"), handler);

// 用户 ID 守卫（资源所有者验证）
router.put(
  "/users/:id",
  requireAuth,
  requireUserId((req) => req.params.id),
  handler
);
```

### 2. CORS 模块 (cors/)

```typescript
import { useCorsMiddleware, createCorsOptions } from "@/middleware";

// 使用默认配置
app.use(useCorsMiddleware());

// 获取配置对象
const options = createCorsOptions();
```

默认配置：
- `origin: true` - 镜像请求来源
- `credentials: true` - 允许携带凭证
- `methods` - GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS
- `allowedHeaders` - Content-Type, Authorization, x-device-id, x-app-id, x-request-id

### 3. 日志模块 (logging/)

```typescript
import { requestLogger, createRequestLogger } from "@/middleware";

// 使用默认日志中间件
app.use(requestLogger);

// 自定义 logger 名称
app.use(createRequestLogger("api"));
```

日志输出示例：
```json
{
  "ts": "2026-01-25T12:00:00.000Z",
  "level": "info",
  "name": "http",
  "msg": "request",
  "ctx": {
    "method": "GET",
    "url": "/api/users",
    "status": 200,
    "durationMs": 15
  },
  "traceId": "abc-123"
}
```

### 4. 限流模块 (rate-limit/)

```typescript
import { rateLimit, createRateLimiter } from "@/middleware";

// 使用默认限流（读取 env 配置）
app.use(rateLimit);

// 自定义限流配置
const customLimiter = createRateLimiter(
  60000,  // 窗口时长 60s
  100     // 最大请求数
);
app.use("/api/sensitive", customLimiter);
```

### 5. 请求标识模块 (request-id/)

```typescript
import { ensureRequestId, REQUEST_ID_HEADER, TRACE_ID_HEADER } from "@/middleware";

// 确保每个请求都有唯一标识
app.use(ensureRequestId);

// 响应头将包含 x-request-id 和 x-trace-id
```

### 6. 响应封装 (request/)

```typescript
import {
  ok,
  created,
  pagedOk,
  empty,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
} from "@/middleware";

// 成功响应 200
ok(res, { id: 1, name: "Alice" });

// 创建成功 201
created(res, { id: 2, name: "Bob" });

// 分页响应
pagedOk(res, items, total, page, pageSize);

// 无内容 204
empty(res);

// 错误响应
badRequest(res, "参数错误", { field: "email" });
unauthorized(res, "未登录");
forbidden(res, "无权限");
notFound(res, "用户不存在");
serverError(res, error);
```

### 7. 分页工具

```typescript
import {
  normalizePagination,
  toLimitOffset,
  clampPagination,
  computePages,
} from "@/middleware";

// 标准化分页参数
const { page, pageSize } = normalizePagination({ page: 1, pageSize: 20 });

// 转换为 LIMIT/OFFSET
const { limit, offset } = toLimitOffset({ page: 2, pageSize: 10 });
// { limit: 10, offset: 10 }

// 计算总页数
const pages = computePages(100, 10); // 10
```

### 8. App ID 中间件

```typescript
import { extractAppId, requireAppId, APP_IDS } from "@/middleware";

// 提取 App ID（可选，默认 web）
app.use(extractAppId);

// 强制要求 App ID
router.use(requireAppId());

// 限制特定 App
router.use(requireAppId([APP_IDS.IOS, APP_IDS.ANDROID]));
```

## 中间件执行顺序

推荐的中间件注册顺序：

```typescript
// 1. 基础解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. 安全与追踪
app.use(useCorsMiddleware());
app.use(ensureRequestId);
app.use(requestLogger);

// 3. 限流（可选）
app.use(rateLimit);

// 4. App ID 提取（可选）
app.use(extractAppId);

// 5. 路由
app.use("/api", routes);
```

## 类型定义

### JwtUserPayload

```typescript
interface JwtUserPayload {
  sub: string;           // 用户 ID
  roleId: string;        // 角色 ID
  tokenType: TokenKind;  // "access" | "refresh"
  iat: number;           // 签发时间
  jti: string;           // Token ID
  deviceId?: string;     // 设备 ID
  scopes?: string[];     // 作用域
  vip?: boolean;         // VIP 状态
  teamId?: string;       // 团队 ID
}
```

### ExtractResult

```typescript
type ExtractResult =
  | { success: true; token: string }
  | { success: false; error: AuthError };
```

## 注意事项

1. **认证中间件顺序**：`requireAuth` 必须在其他守卫之前
2. **类型安全**：使用 `req.user` 前确保已通过 `requireAuth`
3. **错误处理**：所有守卫会自动返回标准错误响应
4. **日志追踪**：确保 `ensureRequestId` 在 `requestLogger` 之前注册
