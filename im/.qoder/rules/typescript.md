---
trigger: always_on
---
# TypeScript 开发规范

## 语言要求

- 必须使用 TypeScript 5.6.3
- 必须使用 ESM 模块系统
- 禁止使用 CommonJS (require/module.exports)

## 导入规范

### ESM 导入语法

```typescript
// ✅ 正确 - ESM 导入
import { SomeClass } from './some-module.js';
import type { SomeType } from './some-types.js';

// ❌ 错误 - CommonJS 导入
const SomeClass = require('./some-module');
```

### 路径别名

使用 `@/` 路径别名指向 `src/` 目录：

```typescript
// ✅ 正确
import { UserService } from '@/services/user.js';
import type { User } from '@/models/user/index.js';

// ❌ 错误
import { UserService } from '../../../services/user.js';
```

## 类型安全要求

### 显式类型标注

所有导出的函数、类、变量必须有显式类型标注：

```typescript
// ✅ 正确
export function createUser(data: CreateUserDto): Promise<User> {
  // 实现
}

export class UserController {
  public async getList(req: Request, res: Response): Promise<void> {
    // 实现
  }
}

// ❌ 错误 - 禁止 any
export function processData(data: any): any {
  // 实现
}
```

### 接口定义

接口必须明确定义所有属性：

```typescript
// ✅ 正确
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// ❌ 错误
export interface User {
  [key: string]: any;
}
```

## 目录模块规范

### index.ts 聚合出口

每个目录必须有 `index.ts` 作为唯一聚合出口：

```typescript
// src/services/index.ts
export { default as UserService } from './user.js';
export { default as AuthService } from './auth.js';
export { default as MessageService } from './message.js';
```

### 显式导入/导出

```typescript
// ✅ 正确 - 显式导出
export { UserService } from './user.js';
export { AuthService } from './auth.js';

// ❌ 错误 - 禁止默认导出混合
export * from './user.js';
export default AuthService;
```

## 构建配置

### tsconfig.json 配置

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 构建脚本

```json
{
  "scripts": {
    "build": "tsc && tsc-alias && tsc-esm-fix",
    "dev": "tsx watch src/server.ts"
  }
}
```

## 代码质量要求

### 禁止项

- 禁止使用 `any` 类型
- 禁止使用 `require()` 和 `module.exports`
- 禁止在对外API中依赖TypeScript类型推断
- 禁止猜测和假设实现

### 必须项

- 必须使用 ESM 模块系统
- 必须显式标注所有类型
- 必须通过 `npm run build` 验证类型
- 必须确保代码边界清晰