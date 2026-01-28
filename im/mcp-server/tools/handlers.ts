/**
 * @packageDocumentation
 * @module mcp-server/tools/handlers
 * @description 工具处理函数
 */

import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  WS_EVENTS,
  ENUMS,
  ERROR_CODES,
  findApi,
  getModuleApis,
  findWsEvent,
  findErrorCode,
} from "../data/index.js";
import { generateApiCode } from "../generators/api-code.js";
import { generateWsHandler } from "../generators/ws-handler.js";
import { generateApiClient } from "../generators/api-client.js";
import { WS_MANAGER_CODE } from "../generators/ws-manager.js";
import { readFlow, AVAILABLE_FLOWS } from "../guides/reader.js";
import type { FlowName } from "../guides/reader.js";

/** 工具响应类型 */
export type ToolResponse = CallToolResult;

/** 工具参数类型 */
interface SearchApiArgs {
  keyword: string;
}

interface GetModuleApisArgs {
  module: string;
}

interface SearchWsEventArgs {
  keyword: string;
}

interface GenerateApiCodeArgs {
  apiPath: string;
}

interface GenerateWsHandlerArgs {
  eventType: string;
}

interface GetFlowArgs {
  flow: string;
}

interface GenerateApiClientArgs {
  module: string;
}

interface GetErrorCodesArgs {
  keyword: string;
}

/** 搜索 API */
export function handleSearchApi(args: SearchApiArgs): ToolResponse {
  const results = findApi(args.keyword);
  if (results.length === 0) {
    return { content: [{ type: "text", text: `未找到包含 "${args.keyword}" 的 API` }] };
  }
  const text = results
    .map((api) => `${api.method} ${api.path}\n  描述: ${api.description}\n  认证: ${api.auth ? "是" : "否"}${api.requestBody ? `\n  请求: ${api.requestBody}` : ""}${api.responseBody ? `\n  响应: ${api.responseBody}` : ""}`)
    .join("\n\n");
  return { content: [{ type: "text", text }] };
}

/** 获取模块 API */
export function handleGetModuleApis(args: GetModuleApisArgs): ToolResponse {
  const apis = getModuleApis(args.module);
  if (apis.length === 0) {
    return { content: [{ type: "text", text: `未找到模块 "${args.module}"` }] };
  }
  const text = apis
    .map((api) => `${api.method} ${api.path}\n  描述: ${api.description}${api.requestBody ? `\n  请求: ${api.requestBody}` : ""}${api.responseBody ? `\n  响应: ${api.responseBody}` : ""}`)
    .join("\n\n");
  return { content: [{ type: "text", text }] };
}

/** 搜索 WebSocket 事件 */
export function handleSearchWsEvent(args: SearchWsEventArgs): ToolResponse {
  const results = findWsEvent(args.keyword);
  if (results.length === 0) {
    return { content: [{ type: "text", text: `未找到包含 "${args.keyword}" 的 WebSocket 事件` }] };
  }
  const text = results.map((e) => `${e.type}\n  描述: ${e.description}\n  载荷: ${e.payload}`).join("\n\n");
  return { content: [{ type: "text", text }] };
}

/** 获取所有 WebSocket 事件 */
export function handleGetAllWsEvents(): ToolResponse {
  const text = WS_EVENTS.map((e) => `${e.type} - ${e.description}`).join("\n");
  return { content: [{ type: "text", text }] };
}

/** 获取枚举 */
export function handleGetEnums(): ToolResponse {
  const text = Object.entries(ENUMS)
    .map(([name, values]) => `${name}: ${values.join(" | ")}`)
    .join("\n");
  return { content: [{ type: "text", text }] };
}

/** 生成 API 代码 */
export function handleGenerateApiCode(args: GenerateApiCodeArgs): ToolResponse {
  const results = findApi(args.apiPath);
  if (results.length === 0) {
    return { content: [{ type: "text", text: `未找到 API: ${args.apiPath}` }] };
  }
  const code = generateApiCode(results[0]);
  return { content: [{ type: "text", text: code }] };
}

/** 生成 WebSocket 处理器 */
export function handleGenerateWsHandler(args: GenerateWsHandlerArgs): ToolResponse {
  const event = WS_EVENTS.find((e) => e.type === args.eventType);
  if (!event) {
    return { content: [{ type: "text", text: `未找到事件: ${args.eventType}` }] };
  }
  const code = generateWsHandler(event);
  return { content: [{ type: "text", text: code }] };
}

/** 获取业务流程 */
export function handleGetFlow(args: GetFlowArgs): ToolResponse {
  const flowName = args.flow as FlowName;
  if (!AVAILABLE_FLOWS.includes(flowName)) {
    return { content: [{ type: "text", text: `未找到流程: ${args.flow}。可用: ${AVAILABLE_FLOWS.join(", ")}` }] };
  }
  const flow = readFlow(flowName);
  return { content: [{ type: "text", text: flow }] };
}

/** 生成 API 客户端 */
export function handleGenerateApiClient(args: GenerateApiClientArgs): ToolResponse {
  const code = generateApiClient(args.module);
  return { content: [{ type: "text", text: code }] };
}

/** 生成 WebSocket 管理器 */
export function handleGenerateWsManager(): ToolResponse {
  return { content: [{ type: "text", text: WS_MANAGER_CODE }] };
}

/** 获取错误码 */
export function handleGetErrorCodes(args: GetErrorCodesArgs): ToolResponse {
  const results = findErrorCode(args.keyword);
  if (results.length === 0) {
    const text = ERROR_CODES.map((e) => `${e.code} (HTTP ${e.httpStatus})\n  ${e.description}\n  原因: ${e.cause}\n  解决: ${e.solution}`).join("\n\n");
    return { content: [{ type: "text", text: `未找到 "${args.keyword}"，以下是所有错误码:\n\n${text}` }] };
  }
  const text = results.map((e) => `${e.code} (HTTP ${e.httpStatus})\n  ${e.description}\n  原因: ${e.cause}\n  解决: ${e.solution}`).join("\n\n");
  return { content: [{ type: "text", text }] };
}

/** 统一调度函数 */
export function callTool(name: string, args: unknown): ToolResponse {
  switch (name) {
    case "search_api":
      return handleSearchApi(args as SearchApiArgs);
    case "get_module_apis":
      return handleGetModuleApis(args as GetModuleApisArgs);
    case "search_ws_event":
      return handleSearchWsEvent(args as SearchWsEventArgs);
    case "get_all_ws_events":
      return handleGetAllWsEvents();
    case "get_enums":
      return handleGetEnums();
    case "generate_api_code":
      return handleGenerateApiCode(args as GenerateApiCodeArgs);
    case "generate_ws_handler":
      return handleGenerateWsHandler(args as GenerateWsHandlerArgs);
    case "get_flow":
      return handleGetFlow(args as GetFlowArgs);
    case "generate_api_client":
      return handleGenerateApiClient(args as GenerateApiClientArgs);
    case "generate_ws_manager":
      return handleGenerateWsManager();
    case "get_error_codes":
      return handleGetErrorCodes(args as GetErrorCodesArgs);
    default:
      throw new Error(`未知工具: ${name}`);
  }
}
