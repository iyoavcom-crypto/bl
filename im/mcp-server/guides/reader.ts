/**
 * @packageDocumentation
 * @module mcp-server/guides/reader
 * @description Markdown 文件读取工具
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname: string = dirname(fileURLToPath(import.meta.url));

/** 可用的流程名称 */
export type FlowName = "auth" | "message" | "call" | "friend" | "group";

/** 可用的指南名称 */
export type GuideName = "expo" | "push" | "types" | "response";

/** 可用的功能名称 */
export type FeatureName = "login" | "register" | "send_message" | "make_call" | "add_friend" | "create_group";

/** 读取指南文件 */
export function readGuide(name: GuideName): string {
  const filePath = join(__dirname, `${name}.md`);
  return readFileSync(filePath, "utf-8");
}

/** 读取流程文件 */
export function readFlow(name: FlowName): string {
  const filePath = join(__dirname, "flows", `${name}.md`);
  return readFileSync(filePath, "utf-8");
}

/** 读取功能指南文件 */
export function readFeature(name: FeatureName): string {
  const filePath = join(__dirname, "features", `${name}.md`);
  return readFileSync(filePath, "utf-8");
}

/** 获取所有可用流程名称 */
export const AVAILABLE_FLOWS: readonly FlowName[] = ["auth", "message", "call", "friend", "group"] as const;

/** 获取所有可用指南名称 */
export const AVAILABLE_GUIDES: readonly GuideName[] = ["expo", "push", "types", "response"] as const;

/** 获取所有可用功能名称 */
export const AVAILABLE_FEATURES: readonly FeatureName[] = ["login", "register", "send_message", "make_call", "add_friend", "create_group"] as const;
