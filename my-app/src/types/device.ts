// 设备平台
export type DevicePlatform = 'ios' | 'android' | 'web' | 'macos' | 'windows';

// 推送服务提供商
export type PushProvider = 'apns' | 'expo' | 'fcm';

// 设备实体
export interface Device {
  id: string;
  userId: string;
  platform: DevicePlatform;
  deviceId: string;
  deviceName: string | null;
  pushToken: string | null;
  pushProvider: PushProvider | null;
  appVersion: string | null;
  osVersion: string | null;
  isOnline: boolean;
  doNotDisturb: boolean;
  lastActiveAt: string | null;
  createdAt: string;
}

// 设备注册请求
export interface DeviceRegisterRequest {
  platform: DevicePlatform;
  deviceId: string;
  deviceName?: string;
  pushToken?: string;
  pushProvider?: PushProvider;
  appVersion?: string;
  osVersion?: string;
}
