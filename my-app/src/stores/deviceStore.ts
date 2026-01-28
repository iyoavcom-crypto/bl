import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import * as SecureStore from 'expo-secure-store';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { api } from '@/config';
import { STORAGE_KEYS } from '@/config/constants';
import type { 
  Device as DeviceType, 
  DeviceRegisterRequest, 
  DevicePlatform,
  PushProvider 
} from '@/types';

interface DeviceState {
  // 状态
  device: DeviceType | null;
  devices: DeviceType[];
  isLoading: boolean;
  error: string | null;

  // 操作
  registerDevice: () => Promise<DeviceType | null>;
  fetchDevice: (deviceId: string) => Promise<DeviceType | null>;
  fetchDevices: () => Promise<void>;
  updateDevice: (deviceId: string, updates: { deviceName?: string; doNotDisturb?: boolean }) => Promise<DeviceType | null>;
  updatePushToken: (pushToken: string, pushProvider: PushProvider) => Promise<void>;
  deleteDevice: (deviceId: string) => Promise<void>;
  heartbeat: () => Promise<void>;
  offline: () => Promise<void>;
  clearError: () => void;
}

const initialState = {
  device: null,
  devices: [],
  isLoading: false,
  error: null,
};

async function getDeviceId(): Promise<string> {
  let deviceId = await SecureStore.getItemAsync(STORAGE_KEYS.DEVICE_ID);
  
  if (!deviceId) {
    // 生成新的设备ID
    if (Platform.OS === 'ios') {
      const iosId = await Application.getIosIdForVendorAsync();
      deviceId = iosId || crypto.randomUUID();
    } else if (Platform.OS === 'android') {
      deviceId = Application.getAndroidId() || crypto.randomUUID();
    } else {
      deviceId = crypto.randomUUID();
    }
    await SecureStore.setItemAsync(STORAGE_KEYS.DEVICE_ID, deviceId);
  }
  
  return deviceId;
}

function getPlatform(): DevicePlatform {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'web';
}

export const useDeviceStore = create<DeviceState>()(
  immer((set, get) => ({
    ...initialState,

    registerDevice: async (): Promise<DeviceType | null> => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const deviceId = await getDeviceId();
        const platform = getPlatform();
        
        const request: DeviceRegisterRequest = {
          platform,
          deviceId,
          deviceName: Device.deviceName || undefined,
          appVersion: Application.nativeApplicationVersion || undefined,
          osVersion: Device.osVersion || undefined,
        };

        const response = await api.post<DeviceType>('/api/im/devices/register', request);
        const device = response as unknown as DeviceType;

        set((state) => {
          state.device = device;
          state.isLoading = false;
        });

        return device;
      } catch (err) {
        const message = err instanceof Error ? err.message : '设备注册失败';
        set((state) => {
          state.isLoading = false;
          state.error = message;
        });
        return null;
      }
    },

    fetchDevice: async (deviceId: string): Promise<DeviceType | null> => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await api.get<DeviceType>(`/api/im/devices/${deviceId}`);
        const device = response as unknown as DeviceType;

        set((state) => {
          // 更新设备列表中的对应项
          const index = state.devices.findIndex((d) => d.deviceId === deviceId);
          if (index !== -1) {
            state.devices[index] = device;
          }
          // 如果是当前设备，更新当前设备信息
          if (state.device?.deviceId === deviceId) {
            state.device = device;
          }
          state.isLoading = false;
        });

        return device;
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取设备详情失败';
        set((state) => {
          state.isLoading = false;
          state.error = message;
        });
        return null;
      }
    },

    fetchDevices: async (): Promise<void> => {
      set((state) => {
        state.isLoading = true;
      });

      try {
        const response = await api.get<DeviceType[]>('/api/im/devices');
        const devices = response as unknown as DeviceType[];

        set((state) => {
          state.devices = devices;
          state.isLoading = false;
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取设备列表失败';
        set((state) => {
          state.isLoading = false;
          state.error = message;
        });
      }
    },

    updateDevice: async (deviceId: string, updates: { deviceName?: string; doNotDisturb?: boolean }): Promise<DeviceType | null> => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await api.put<DeviceType>(`/api/im/devices/${deviceId}`, updates);
        const device = response as unknown as DeviceType;

        set((state) => {
          // 更新设备列表中的对应项
          const index = state.devices.findIndex((d) => d.deviceId === deviceId);
          if (index !== -1) {
            state.devices[index] = device;
          }
          // 如果是当前设备，更新当前设备信息
          if (state.device?.deviceId === deviceId) {
            state.device = device;
          }
          state.isLoading = false;
        });

        return device;
      } catch (err) {
        const message = err instanceof Error ? err.message : '更新设备信息失败';
        set((state) => {
          state.isLoading = false;
          state.error = message;
        });
        return null;
      }
    },

    updatePushToken: async (pushToken: string, pushProvider: PushProvider): Promise<void> => {
      const { device } = get();
      if (!device) return;

      try {
        await api.post(`/api/im/devices/${device.deviceId}/push-token`, {
          pushToken,
          pushProvider,
        });

        await SecureStore.setItemAsync(STORAGE_KEYS.PUSH_TOKEN, pushToken);

        set((state) => {
          if (state.device) {
            state.device.pushToken = pushToken;
            state.device.pushProvider = pushProvider;
          }
        });
      } catch (err) {
        if (__DEV__) {
          const message = err instanceof Error ? err.message : '更新推送令牌失败';
          set((state) => {
            state.error = message;
          });
        }
      }
    },

    deleteDevice: async (deviceId: string): Promise<void> => {
      try {
        await api.delete(`/api/im/devices/${deviceId}`);

        set((state) => {
          state.devices = state.devices.filter((d) => d.deviceId !== deviceId);
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : '删除设备失败';
        set((state) => {
          state.error = message;
        });
      }
    },

    heartbeat: async (): Promise<void> => {
      const { device } = get();
      if (!device) return;

      try {
        await api.post(`/api/im/devices/${device.deviceId}/heartbeat`);
      } catch {
        // 心跳失败静默处理
      }
    },

    offline: async (): Promise<void> => {
      const { device } = get();
      if (!device) return;

      try {
        await api.post(`/api/im/devices/${device.deviceId}/offline`);
      } catch {
        // 下线失败静默处理
      }
    },

    clearError: (): void => {
      set((state) => {
        state.error = null;
      });
    },
  }))
);

// 选择器
export const selectDevice = (state: DeviceState) => state.device;
export const selectDevices = (state: DeviceState) => state.devices;
