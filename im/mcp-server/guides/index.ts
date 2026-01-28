/**
 * @packageDocumentation
 * @module mcp-server/guides
 * @description 指南文档 - 聚合导出
 */

// ==================== 文件读取工具 ====================
export {
  readGuide,
  readFlow,
  readFeature,
  AVAILABLE_FLOWS,
  AVAILABLE_GUIDES,
  AVAILABLE_FEATURES,
} from "./reader.js";

export type { FlowName, GuideName, FeatureName } from "./reader.js";
