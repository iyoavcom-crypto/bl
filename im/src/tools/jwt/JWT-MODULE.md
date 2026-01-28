# JWT 模块技术文档

> 版本：1.0.1 | 更新日期：2026-01-25

## 1. 模块概述

JWT 模块提供完整的 JSON Web Token 签发、验证和守卫功能，支持 HS256 和 RS256 两种签名算法。

### 目录结构

```
src/tools/jwt/
├── index.ts           # 统一导出入口
├── service.ts         # JWT 服务核心类
├── utils.ts           # 工具函数（TTL解析、ID生成）
├── errors/
│   └── index.ts       # 错误码与 AuthError 类
├── guards/
│   ├── index.ts       # 守卫函数统一导出
│   ├── device.ts      # 设备绑定断言
│   ├── id.ts          # 用户ID断言
│   ├── role.ts        # 角色断言
│   ├── scopes.ts      # 作用域断言
│   ├── team.ts        # 团队断言
│   └── vip.ts         # VIP断言
├── keys/
│   └── index.ts       # 密钥提供器（HS/RS）
└── jwt-env/
    ├── index.ts       # 环境变量加载
    └── types.ts       # 类型定义
```

---

## 2. 快速开始

### 2.1 基于环境变量创建服务

```typescript
import { createJwtServiceFromEnv } from "@/tools/jwt";

const jwtService = createJwtServiceFromEnv();
```

### 2.2 环境变量配置

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `JWT_ALGORITHM` | 否 | `HS256` | 签名算法（HS256/RS256） |
| `JWT_SECRET` | 生产必填 | `dev-secret` | HS256 对称密钥 |
| `JWT_PRIVATE_KEY_PATH` | RS256必填 | - | RSA 私钥路径 |
| `JWT_PUBLIC_KEY_PATH` | RS256必填 | - | RSA 公钥路径 |
| `JWT_ACCESS_TTL` | 否 | `15m` | Access Token 有效期 |
| `JWT_REFRESH_TTL` | 否 | `7d` | Refresh Token 有效期 |

**安全警告**：生产环境必须配置 `JWT_SECRET`，禁止使用默认值。

---

## 3. 核心 API

### 3.1 JwtService

```typescript
class JwtService {
  // 签发 JWT
  async signAsync(kind: TokenKind, payload: JwtUserPayload): Promise<string>;
  
  // 验证 JWT
  async verifyAsync(token: string): Promise<JwtUserPayload>;
  
  // 刷新令牌轮转
  async rotateRefreshAsync(
    refreshToken: string,
    mutate?: (p: JwtUserPayload) => JwtUserPayload
  ): Promise<{ access: string; refresh: string; payload: JwtUserPayload }>;
}
```

### 3.2 守卫函数

所有守卫函数位于 `Guards` 命名空间：

```typescript
import { Guards } from "@/tools/jwt";

// 使用示例
Guards.assertUserId(payload, "user_123");
Guards.assertRole(payload, ["ADMIN", "EDITOR"]);
Guards.assertScopes(payload, ["read", "write"]);
Guards.assertVip(payload);
Guards.assertDevice(payload, "device_id", true);
Guards.assertTokenKind(payload, "access");
Guards.assertTeam(payload, ["team_a", "team_b"]);
```

| 函数 | 说明 | 失败错误码 |
|------|------|-----------|
| `assertUserId` | 校验用户 ID (sub) | `Forbidden` |
| `assertRole` | 校验角色（满足其一） | `Forbidden` |
| `assertScopes` | 校验作用域（满足其一） | `Forbidden` |
| `assertVip` | 校验 VIP 资格 | `Forbidden` |
| `assertDevice` | 校验设备绑定 | `DeviceMismatch` |
| `assertTokenKind` | 校验令牌类型 | `Forbidden` |
| `assertTeam` | 校验团队 ID | `Forbidden` |

---

## 4. 错误处理

### 4.1 AuthErrorCode 枚举

| 错误码 | 值 | HTTP状态 | 说明 |
|--------|-----|---------|------|
| `MissingToken` | `MISSING_TOKEN` | 401 | 缺少授权令牌 |
| `Malformed` | `MALFORMED` | 400 | 令牌格式错误 |
| `Invalid` | `INVALID` | 401 | 无效令牌 |
| `Expired` | `EXPIRED` | 401 | 令牌已过期 |
| `Forbidden` | `FORBIDDEN` | 403 | 禁止访问 |
| `DeviceMismatch` | `DEVICE_MISMATCH` | 401 | 设备不匹配 |
| `Revoked` | `REVOKED` | 401 | 令牌已撤销 |

### 4.2 错误工厂方法

```typescript
import { AuthError } from "@/tools/jwt";

// 静态工厂
throw AuthError.missingToken();
throw AuthError.expired();
throw AuthError.forbidden({ reason: "权限不足" });
throw AuthError.deviceMismatch();
throw AuthError.businessError("自定义业务错误", 400);
throw AuthError.validationError("验证失败", { email: ["格式错误"] });
```

### 4.3 类型守卫

```typescript
import { isAuthError } from "@/tools/jwt";

try {
  await jwtService.verifyAsync(token);
} catch (e) {
  if (isAuthError(e)) {
    console.log(e.code, e.status, e.toJSON());
  }
}
```

---

## 5. 工具函数

```typescript
import { ttlToSeconds, nowSec, nanoid, shortId } from "@/tools/jwt";

// TTL 转秒
ttlToSeconds("15m");  // 900
ttlToSeconds("7d");   // 604800
ttlToSeconds("1h");   // 3600

// 当前时间戳（秒）
nowSec();  // 1737792000

// 随机 ID
nanoid(16);  // "a1b2c3d4e5f6g7h8"
shortId();   // 16字符 URL-safe ID
```

---

## 6. 密钥提供器

### 6.1 HS256 密钥

```typescript
import { createHSKeyProvider } from "@/tools/jwt";

const provider = createHSKeyProvider({
  secret: "your-secret-key",
  // 或从环境变量读取
  secretEnv: "JWT_HS_SECRET",
  // 或从文件读取
  secretPath: "/path/to/secret.txt",
  kid: "key-id-optional",
});
```

### 6.2 RS256 密钥

```typescript
import { createRSKeyProvider } from "@/tools/jwt";

const provider = createRSKeyProvider({
  privateKeyPath: "/path/to/private.pem",
  publicKeyPath: "/path/to/public.pem",
  // 或从环境变量
  privateKeyEnv: "JWT_RS_PRIVATE",
  publicKeyEnv: "JWT_RS_PUBLIC",
  kid: "key-id-optional",
});
```

---

## 7. 类型导出

```typescript
import type {
  JwtUserPayload,
  JwtAppPayload,
  TokenKind,
  UserState,
  KeyProvider,
  SecurityConfig,
  AuthProblem,
} from "@/tools/jwt";
```

---

## 8. 变更日志

### v1.0.1 (2026-01-25)

**整改项：**
- 删除未使用的 `serializeUnknown` 函数
- 删除 `assertAppCode` 守卫（依赖缺失模块 `@/types/jwt/app-types`）
- 删除 `assertUserCode` 守卫
- 修复 `assertDevice` 守卫错误码（`Forbidden` → `DeviceMismatch`）
- 补充 `assertTokenKind` 函数文档注释
- 增强 `loadJwtEnv` 安全校验：生产环境强制要求配置密钥

### v1.0.0 (2025-09-14)

- 初始版本发布
