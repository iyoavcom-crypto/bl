
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from './env';
import { STORAGE_KEYS } from '../constants';
import { handleApiError } from './errorHandler';

// 创建 Axios 实例
const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器 - 自动添加 Token
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// 刷新 Token 状态
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// 订阅 Token 刷新
function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

// 通知所有订阅者
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// Token 刷新
async function refreshToken(): Promise<boolean> {
  try {
    const refresh = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refresh) return false;
    
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/api/auth/refresh`,
      { refreshToken: refresh }
    );
    
    const { access, refresh: newRefresh } = response.data.data;
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, String(access));
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, String(newRefresh));
    return true;
  } catch {
    return false;
  }
}

// 退出登录处理
async function handleLogout(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID);
  // 触发全局登出事件 (通过 Store 处理)
}

// 响应拦截器 - Token 刷新 & 错误处理
api.interceptors.response.use(
  (response) => {
    // MCP响应格式: { code: "OK", data: T, message?: string, meta?: Pagination }
    // 如果有 meta（分页），返回 { list, total, page, limit } 格式
    if (response.data?.meta) {
      return {
        list: response.data.data,
        total: response.data.meta.total,
        page: response.data.meta.page,
        limit: response.data.meta.pageSize,
      } as any;
    }
    // 非分页数据直接返回 data
    return response.data?.data ?? response.data;
  },
  async (error: AxiosError<{ code: string; message: string; details?: unknown }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // 401 尝试刷新 Token
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // 等待 Token 刷新完成
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api.request(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshed = await refreshToken();
      isRefreshing = false;

      if (refreshed) {
        const newToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        if (newToken) {
          onTokenRefreshed(newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api.request(originalRequest);
        }
      }
      
      // 刷新失败，退出登录
      await handleLogout();
    }
    
    // 使用MCP错误格式
    return Promise.reject(handleApiError({
      code: error.response?.data?.code,
      status: error.response?.status,
      message: error.response?.data?.message || '网络请求失败',
      details: error.response?.data?.details,
    }));
  }
);

export { api };