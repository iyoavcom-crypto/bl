/**
 * @packageDocumentation
 * @module mcp-server/resources/schemas
 * @description 资源 Schema 定义
 */

/** 资源 Schema 定义 */
export const RESOURCE_SCHEMAS = [
  {
    uri: "im://api/all",
    name: "所有 API 列表",
    description: "获取所有 IM API 接口的完整列表",
    mimeType: "text/plain",
  },
  {
    uri: "im://ws/events",
    name: "WebSocket 事件列表",
    description: "获取所有 WebSocket 事件类型",
    mimeType: "text/plain",
  },
  {
    uri: "im://types",
    name: "TypeScript 类型定义",
    description: "获取前端可用的 TypeScript 类型定义",
    mimeType: "text/plain",
  },
  {
    uri: "im://guide/expo",
    name: "Expo 接入指南",
    description: "Expo/iOS 应用接入 IM API 的指南",
    mimeType: "text/plain",
  },
  {
    uri: "im://guide/push",
    name: "推送服务 API",
    description: "ExpoPushService 推送服务完整方法说明",
    mimeType: "text/plain",
  },
] as const;
