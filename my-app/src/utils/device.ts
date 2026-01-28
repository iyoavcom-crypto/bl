import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { nanoid } from 'nanoid/non-secure';
import { secureStorage } from './storage';
import { STORAGE_KEYS } from '@/config/constants';

/**
 * 获取或生成设备 ID
 */
export async function getDeviceId(): Promise<string> {
  let deviceId = await secureStorage.get(STORAGE_KEYS.DEVICE_ID);
  
  if (!deviceId) {
    deviceId = nanoid();
    await secureStorage.set(STORAGE_KEYS.DEVICE_ID, deviceId);
  }
  
  return deviceId;
}

/**
 * 获取设备信息
 */
export function getDeviceInfo() {
  return {
    platform: Platform.OS as 'ios' | 'android',
    osVersion: Platform.Version.toString(),
    deviceName: Device.deviceName || 'Unknown',
    deviceModel: Device.modelName || 'Unknown',
    appVersion: Application.nativeApplicationVersion || '1.0.0',
    buildNumber: Application.nativeBuildVersion || '1',
  };
}

/**
 * 判断是否为真机
 */
export function isRealDevice(): boolean {
  return !Device.isDevice;
}
