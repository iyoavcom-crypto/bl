/**
 * @packageDocumentation
 * @module mcp-server/tools
 * @description 工具层 - 聚合导出
 */

// ==================== Schema 定义 ====================
export { TOOL_SCHEMAS } from "./schemas.js";

// ==================== 处理函数 ====================
export {
  handleSearchApi,
  handleGetModuleApis,
  handleSearchWsEvent,
  handleGetAllWsEvents,
  handleGetEnums,
  handleGenerateApiCode,
  handleGenerateWsHandler,
  handleGetFlow,
  handleGenerateApiClient,
  handleGenerateWsManager,
  handleGetErrorCodes,
  callTool,
} from "./handlers.js";

export type { ToolResponse } from "./handlers.js";
