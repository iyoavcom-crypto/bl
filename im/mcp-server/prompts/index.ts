/**
 * @packageDocumentation
 * @module mcp-server/prompts
 * @description 提示层 - 聚合导出
 */

// ==================== Schema 定义 ====================
export { PROMPT_SCHEMAS } from "./schemas.js";

// ==================== 处理函数 ====================
export {
  handleImplementFeature,
  handleDebugApi,
  getPrompt,
} from "./handlers.js";

export type { PromptResponse } from "./handlers.js";
