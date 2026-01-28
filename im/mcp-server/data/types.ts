/**
 * @packageDocumentation
 * @module mcp-server/data/types
 * @description IM API 数据类型定义
 */

/** API 接口定义 */
export interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  auth: boolean;
  requestBody?: string;
  responseBody?: string;
  params?: string;
}

/** API 模块定义 */
export interface ApiModule {
  name: string;
  prefix: string;
  description: string;
  endpoints: ApiEndpoint[];
}

/** WebSocket 事件定义 */
export interface WsEventDef {
  type: string;
  description: string;
  payload: string;
}

/** 错误码定义 */
export interface ErrorCodeDef {
  code: string;
  httpStatus: number;
  description: string;
  cause: string;
  solution: string;
}
