import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 安全存储 (敏感数据使用 Keychain)
 */
export const secureStorage = {
  /**
   * 存储
   */
  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },

  /**
   * 读取
   */
  async get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },

  /**
   * 删除
   */
  async remove(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};

/**
 * 普通存储 (非敏感数据)
 */
export const storage = {
  /**
   * 存储字符串
   */
  async set(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  },

  /**
   * 读取字符串
   */
  async get(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  },

  /**
   * 存储对象
   */
  async setObject<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  /**
   * 读取对象
   */
  async getObject<T>(key: string): Promise<T | null> {
    const value = await AsyncStorage.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  /**
   * 删除
   */
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  /**
   * 批量删除
   */
  async multiRemove(keys: string[]): Promise<void> {
    await AsyncStorage.multiRemove(keys);
  },

  /**
   * 清空所有
   */
  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },
};
