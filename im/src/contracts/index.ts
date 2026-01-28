/**
 * @packageDocumentation
 * @module contracts
 * @since 1.0.0
 * @author Z-Kali
 * @tags [contracts],[export],[crud],[auth]
 * @description Contracts 模块统一导出入口
 * @path src/contracts/index.ts
 */

// CRUD 控制器工厂
export { createCrudController } from "./crud/create.js";

// CRUD 类型
export type { CrudHttpController, AsyncHandler } from "./crud/types.js";

// 认证控制器
export { register, login, logout, me } from "./auth.controller.js";
