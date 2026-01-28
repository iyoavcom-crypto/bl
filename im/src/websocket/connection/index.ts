/**
 * @packageDocumentation
 * @module websocket/connection
 * @description WebSocket 连接管理模块聚合导出
 */

export * from "./authenticator.js";
export * from "./manager.js";
export { startHeartbeat, stopHeartbeat, handlePong } from "./heartbeat.js";
