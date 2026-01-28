// 存储键常量
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
  DEVICE_ID: 'device_id',
  THEME_MODE: '@baoliao_theme_mode',
  PUSH_TOKEN: 'push_token',
  NOTIFICATION_SETTINGS: 'notification_settings',
} as const;

// 连接配置常量
export const CONNECTION_CONFIG = {
  // 心跳间隔 (毫秒)
  HEARTBEAT_INTERVAL: 30000,
  
  // 重连最大次数
  MAX_RECONNECT_ATTEMPTS: 10,
  
  // 重连初始延迟 (毫秒)
  RECONNECT_DELAY: 1000,
} as const;
