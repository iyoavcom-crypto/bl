/**
 * 环境变量配置
 * 使用 process.env 访问环境变量
 * 在 .env 中配置: EXPO_PUBLIC_*
 */
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.6:3009',
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'ws://192.168.1.6:3009/ws',
  TIMEOUT: 10000,
};

export const DEFAULT_API_URL = 'http://192.168.1.6:3009';
export const DEFAULT_WS_URL = 'ws://192.168.1.6:3009/ws';

export default {
  API_CONFIG,
  DEFAULT_API_URL,
  DEFAULT_WS_URL,
};