/**
 * @packageDocumentation
 * @module mcp-server/data/query
 * @description 数据查询函数
 */

import type { ApiEndpoint, WsEventDef, ErrorCodeDef } from "./types.js";
import { API_MODULES } from "./api-modules.js";
import { WS_EVENTS } from "./ws-events.js";
import { ERROR_CODES } from "./error-codes.js";

/** 查找 API */
export function findApi(keyword: string): ApiEndpoint[] {
  const lowerKeyword = keyword.toLowerCase();
  const results: ApiEndpoint[] = [];

  for (const module of API_MODULES) {
    for (const endpoint of module.endpoints) {
      if (
        endpoint.path.toLowerCase().includes(lowerKeyword) ||
        endpoint.description.toLowerCase().includes(lowerKeyword)
      ) {
        results.push(endpoint);
      }
    }
  }

  return results;
}

/** 获取模块的所有 API */
export function getModuleApis(moduleName: string): ApiEndpoint[] {
  const lowerName = moduleName.toLowerCase();
  const module = API_MODULES.find(
    (m) => m.name.toLowerCase().includes(lowerName) || m.prefix.toLowerCase().includes(lowerName)
  );
  return module?.endpoints ?? [];
}

/** 查找 WebSocket 事件 */
export function findWsEvent(keyword: string): WsEventDef[] {
  const lowerKeyword = keyword.toLowerCase();
  return WS_EVENTS.filter(
    (e) => e.type.toLowerCase().includes(lowerKeyword) || e.description.toLowerCase().includes(lowerKeyword)
  );
}

/** 查找错误码 */
export function findErrorCode(keyword: string): ErrorCodeDef[] {
  const lowerKeyword = keyword.toLowerCase();
  return ERROR_CODES.filter(
    (e) =>
      e.code.toLowerCase().includes(lowerKeyword) ||
      e.description.toLowerCase().includes(lowerKeyword) ||
      e.cause.toLowerCase().includes(lowerKeyword)
  );
}
