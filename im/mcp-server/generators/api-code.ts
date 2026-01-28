/**
 * @packageDocumentation
 * @module mcp-server/generators/api-code
 * @description API 调用代码生成器
 */

import type { ApiEndpoint } from "../data/index.js";
import { toCamelCase } from "./utils.js";

/**
 * 生成 API 调用代码示例
 * @param api - API 端点定义
 * @returns TypeScript 代码字符串
 */
export function generateApiCode(api: ApiEndpoint): string {
  const hasBody = api.method === "POST" || api.method === "PUT";

  return `// ${api.description}
// ${api.method} ${api.path}
// 需要认证: ${api.auth ? "是" : "否"}

async function ${toCamelCase(api.path)}(${hasBody ? "body: RequestBody" : ""}): Promise<Response> {
  const response = await fetch(\`\${API_BASE_URL}${api.path}\`, {
    method: "${api.method}",
    headers: {
      "Content-Type": "application/json",
      ${api.auth ? '"Authorization": `Bearer ${accessToken}`,' : ""}
    },
    ${hasBody ? "body: JSON.stringify(body)," : ""}
  });

  if (!response.ok) {
    throw new Error(\`API 错误: \${response.status}\`);
  }

  return response.json();
}

${api.requestBody ? `// 请求体类型: ${api.requestBody}` : ""}
${api.responseBody ? `// 响应类型: ${api.responseBody}` : ""}`;
}
