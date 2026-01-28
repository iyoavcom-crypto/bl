/**
 * @packageDocumentation
 * @module mcp-server/resources/handlers
 * @description 资源处理函数
 */

import type { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import { API_MODULES, WS_EVENTS } from "../data/index.js";
import { readGuide } from "../guides/reader.js";

/** 资源内容类型 */
export type ResourceContent = ReadResourceResult;

/** 获取所有 API 列表 */
export function readAllApis(uri: string): ResourceContent {
  const text = API_MODULES.map((m) => {
    const apis = m.endpoints
      .map((e) => `  ${e.method} ${e.path} - ${e.description}`)
      .join("\n");
    return `## ${m.name} (${m.prefix})\n${m.description}\n\n${apis}`;
  }).join("\n\n");
  return { contents: [{ uri, mimeType: "text/plain", text }] };
}

/** 获取 WebSocket 事件列表 */
export function readWsEvents(uri: string): ResourceContent {
  const text = WS_EVENTS.map((e) => `${e.type}\n  描述: ${e.description}\n  载荷: ${e.payload}`).join("\n\n");
  return { contents: [{ uri, mimeType: "text/plain", text }] };
}

/** 获取 TypeScript 类型定义 */
export function readTypes(uri: string): ResourceContent {
  return { contents: [{ uri, mimeType: "text/markdown", text: readGuide("types") }] };
}

/** 获取 Expo 指南 */
export function readExpoGuide(uri: string): ResourceContent {
  return { contents: [{ uri, mimeType: "text/markdown", text: readGuide("expo") }] };
}

/** 获取推送服务指南 */
export function readPushGuide(uri: string): ResourceContent {
  return { contents: [{ uri, mimeType: "text/markdown", text: readGuide("push") }] };
}

/** 统一调度函数 */
export function readResource(uri: string): ResourceContent {
  switch (uri) {
    case "im://api/all":
      return readAllApis(uri);
    case "im://ws/events":
      return readWsEvents(uri);
    case "im://types":
      return readTypes(uri);
    case "im://guide/expo":
      return readExpoGuide(uri);
    case "im://guide/push":
      return readPushGuide(uri);
    default:
      throw new Error(`未知资源: ${uri}`);
  }
}
