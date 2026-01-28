---
trigger: always_on
alwaysApply: true
description: 包聊 (BaoLiao) 通用代码规范
---

# 包聊 (BaoLiao) - 代码规范

## 项目信息

- **产品名称**: 包聊 (BaoLiao)
- **Bundle ID**: com.baoliao.im
- **平台**: iOS (Expo SDK 54)
- **后端协议**: MCP (Mobile Cloud Protocol)

## 语言与框架

- 必须使用 **TypeScript** 严格模式
- .expo 框架
- 状态管理使用 **Zustand**
- 样式使用 **StyleSheet.create**，禁止内联样式

## 命名约定

```
文件命名:
- 组件: PascalCase.tsx     (MessageBubble.tsx)
- Hook: camelCase.ts       (useAuth.ts)
- Store: camelCase.ts      (authStore.ts)
- 工具: camelCase.ts       (format.ts)
- 类型: camelCase.ts       (message.ts)

变量命名:
- 组件: PascalCase         (const MessageBubble = ...)
- 函数: camelCase          (function sendMessage() ...)
- 常量: SCREAMING_SNAKE    (const API_BASE_URL = ...)
- 类型: PascalCase         (interface Message { ... })
```

入 (type)

## 禁止事项

- ❌ 禁止使用 `any` 类型
- ❌ 禁止内联样式 `style={{ ... }}`
- ❌ 禁止硬编码颜色值，必须使用主题 `useTheme()`
- ❌ 禁止在组件中直接调用 API，必须通过 Store
- ❌ 禁止使用 `console.log`，使用 `__DEV__` 条件判断


 