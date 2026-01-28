/**
 * @packageDocumentation
 * @module mcp-server/resources
 * @description 资源层 - 聚合导出
 */

// ==================== Schema 定义 ====================
export { RESOURCE_SCHEMAS } from "./schemas.js";

// ==================== 处理函数 ====================
export {
  readAllApis,
  readWsEvents,
  readTypes,
  readExpoGuide,
  readResource,
} from "./handlers.js";

export type { ResourceContent } from "./handlers.js";
