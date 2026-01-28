---
trigger: always_on
---

## 环境依赖
- Node 22 esm
- dotenv
- sequelize
- sqlite3
- express
- typescript 5.6.3
- tsx
- ioredis 5.4
- ws 8.18.3
- APNs

## 必须遵守（must）
- 编写代码前确保信息及上下文重组，缺少关键信息时，不准开始生产代码。询问后确保信息充足
- 仅允许输出可直接用于生产的代码
- ESM only：使用 import/export
- 目录模块必须 index.ts 为唯一聚合出口：显式 import/export
- 确保代码边界


## 禁止（must No）
- 禁止猜测，假设，TODO / mock / 占位实现
- 禁止 any；所有导出类型/函数参数/返回值必须显式标注
- 禁止 CommonJS（require / module.exports）
- 禁止在对外 API 中依赖 TypeScript 类型推断









