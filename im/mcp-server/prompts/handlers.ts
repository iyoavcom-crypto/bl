/**
 * @packageDocumentation
 * @module mcp-server/prompts/handlers
 * @description 提示处理函数
 */

import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import { findApi } from "../data/index.js";
import { readFeature, AVAILABLE_FEATURES } from "../guides/index.js";
import type { FeatureName } from "../guides/index.js";

/** 提示响应类型 */
export type PromptResponse = GetPromptResult;

/** 实现功能提示 */
export function handleImplementFeature(args: { feature?: string }): PromptResponse {
  const feature = args.feature ?? "";
  const featureName = feature as FeatureName;
  
  if (!AVAILABLE_FEATURES.includes(featureName)) {
    return {
      messages: [
        {
          role: "user",
          content: { type: "text", text: `请帮我实现 IM 功能: ${feature}\n\n可用功能: ${AVAILABLE_FEATURES.join(", ")}` },
        },
      ],
    };
  }
  
  const guide = readFeature(featureName);
  return {
    messages: [
      {
        role: "user",
        content: { type: "text", text: guide },
      },
    ],
  };
}

/** 调试 API 提示 */
export function handleDebugApi(args: { api_path?: string; error?: string }): PromptResponse {
  const apiPath = args.api_path ?? "";
  const error = args.error ?? "";
  const apis = findApi(apiPath);
  const apiInfo = apis.length > 0
    ? `\n\nAPI 信息:\n${apis.map((a) => `${a.method} ${a.path}\n请求: ${a.requestBody}\n响应: ${a.responseBody}`).join("\n")}`
    : "";

  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `调试 API 问题:\nAPI: ${apiPath}\n错误: ${error}${apiInfo}\n\n请分析可能的原因和解决方案。`,
        },
      },
    ],
  };
}

/** 统一调度函数 */
export function getPrompt(name: string, args: Record<string, unknown>): PromptResponse {
  switch (name) {
    case "implement_feature":
      return handleImplementFeature(args as { feature?: string });
    case "debug_api":
      return handleDebugApi(args as { api_path?: string; error?: string });
    default:
      throw new Error(`未知提示: ${name}`);
  }
}
