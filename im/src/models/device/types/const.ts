/**
 * @const DevicePlatform
 * @description 设备平台枚举
 */
export const DevicePlatform = {
  IOS: "ios",
  ANDROID: "android",
  WEB: "web",
  MACOS: "macos",
  WINDOWS: "windows",
} as const;

export type DevicePlatform = (typeof DevicePlatform)[keyof typeof DevicePlatform];

/**
 * @const PushProvider
 * @description 推送提供商枚举
 */
export const PushProvider = {
  APNS: "apns",
  EXPO: "expo",
  FCM: "fcm",
} as const;

export type PushProvider = (typeof PushProvider)[keyof typeof PushProvider];
