/**
 * @packageDocumentation
 * @module mcp-server/generators/api-client
 * @description API 客户端代码生成器
 */

import { API_MODULES } from "../data/index.js";
import { toCamelCase } from "./utils.js";

/** 模块名称映射 */
export const MODULE_MAP: Record<string, string> = {
  auth: "认证",
  user: "用户",
  device: "设备",
  friend: "好友",
  group: "群组",
  conversation: "会话",
  message: "消息",
  call: "通话",
  presence: "在线",
  media: "媒体",
};

/**
 * 生成 API 客户端代码
 * @param moduleName - 模块名称或 "all"
 * @returns TypeScript 代码字符串
 */
export function generateApiClient(moduleName: string): string {
  const isAll = moduleName.toLowerCase() === "all";
  const targetModules = isAll
    ? API_MODULES
    : API_MODULES.filter((m) => {
        const lower = moduleName.toLowerCase();
        const mapped = MODULE_MAP[lower] ?? lower;
        return m.name.includes(mapped) || m.prefix.includes(lower);
      });

  if (targetModules.length === 0) {
    return `未找到模块: ${moduleName}\n可用模块: auth, user, device, friend, group, conversation, message, call, presence, media, all`;
  }

  const imports = `import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

// ============================================================
// 配置
// ============================================================

const API_BASE_URL = __DEV__
  ? 'http://192.168.1.6:3009'
  : 'https://api.yourdomain.com';

// ============================================================
// Axios 实例
// ============================================================

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器 - 自动添加 Token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

// 响应拦截器 - 统一错误处理
api.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<{ code: string; message: string }>) => {
    if (error.response?.status === 401) {
      // Token 过期，尝试刷新
      const refreshed = await refreshToken();
      if (refreshed && error.config) {
        return api.request(error.config);
      }
    }
    return Promise.reject(error.response?.data ?? error);
  }
);

// Token 刷新
async function refreshToken(): Promise<boolean> {
  try {
    const refresh = await SecureStore.getItemAsync('refresh_token');
    if (!refresh) return false;
    
    const res = await axios.post(\`\${API_BASE_URL}/api/auth/refresh\`, {
      refreshToken: refresh,
    });
    
    await SecureStore.setItemAsync('access_token', res.data.data.access);
    await SecureStore.setItemAsync('refresh_token', res.data.data.refresh);
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// 类型定义
// ============================================================

interface ApiResponse<T> {
  code: string;
  data: T;
  message?: string;
}

interface PagedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pages: number;
  };
}

`;

  const functions = targetModules
    .map((m) => {
      const moduleComment = `// ============================================================\n// ${m.name} - ${m.description}\n// ============================================================\n`;
      const funcs = m.endpoints
        .map((e) => {
          const funcName = toCamelCase(e.path);
          const hasBody = e.method === "POST" || e.method === "PUT";
          const paramMatch = e.path.match(/:(\w+)/g);
          const pathParams = paramMatch ? paramMatch.map((p) => p.slice(1)) : [];
          const paramsStr = pathParams.map((p) => `${p}: string`).join(", ");
          const bodyParam = hasBody ? (paramsStr ? ", body: Record<string, unknown>" : "body: Record<string, unknown>") : "";
          const allParams = paramsStr + bodyParam;
          
          let urlPath = e.path;
          pathParams.forEach((p) => {
            urlPath = urlPath.replace(`:${p}`, `\${${p}}`);
          });

          return `/**
 * ${e.description}
 * ${e.method} ${e.path}
 */
export async function ${funcName}(${allParams}): Promise<ApiResponse<unknown>> {
  return api.${e.method.toLowerCase()}(\`${urlPath}\`${hasBody ? ", body" : ""});
}`;
        })
        .join("\n\n");
      return moduleComment + funcs;
    })
    .join("\n\n");

  return imports + functions;
}
