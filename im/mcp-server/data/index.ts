/**
 * @packageDocumentation
 * @module mcp-server/data
 * @description IM API 数据定义 - 聚合导出
 */

// ==================== 类型定义 ====================
export type { ApiEndpoint, ApiModule, WsEventDef, ErrorCodeDef } from "./types.js";

// ==================== 数据常量 ====================
export { API_MODULES } from "./api-modules.js";
export { WS_EVENTS } from "./ws-events.js";
export { ENUMS } from "./enums.js";
export { ERROR_CODES } from "./error-codes.js";

// ==================== 查询函数 ====================
export { findApi, getModuleApis, findWsEvent, findErrorCode } from "./query.js";
