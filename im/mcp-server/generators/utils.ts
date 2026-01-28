/**
 * @packageDocumentation
 * @module mcp-server/generators/utils
 * @description 代码生成工具函数
 */

/**
 * 将 API 路径转换为驼峰格式函数名
 * @param path - API 路径，如 /api/auth/login
 * @returns 驼峰格式字符串，如 authLogin
 */
export function toCamelCase(path: string): string {
  return path
    .replace(/^\/api\//, "")
    .replace(/\//g, "_")
    .replace(/:(\w+)/g, "By$1")
    .replace(/-(\w)/g, (_, c: string) => c.toUpperCase())
    .replace(/_(\w)/g, (_, c: string) => c.toUpperCase());
}
