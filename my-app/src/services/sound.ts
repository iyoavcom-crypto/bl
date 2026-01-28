/**
 * 音频和震动服务 - 播放消息提示音和震动反馈
 */

import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@notification_settings';

interface NotificationSettings {
  soundEnabled: boolean;
}

class SoundService {
  private isInitialized = false;
  private settings: NotificationSettings = {
    soundEnabled: true,
  };

  /**
   * 初始化服务
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;
    await this.loadSettings();
    this.isInitialized = true;
  }

  /**
   * 加载通知设置
   */
  async loadSettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        this.settings = JSON.parse(stored);
      }
    } catch (err) {
      console.error('[SoundService] 加载设置失败:', err);
    }
  }

  /**
   * 保存通知设置
   */
  async saveSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      this.settings = { ...this.settings, ...settings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (err) {
      console.error('[SoundService] 保存设置失败:', err);
    }
  }

  /**
   * 获取当前设置
   */
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * 播放新消息提示（声音+震动）
   */
  async playMessageSound(): Promise<void> {
    try {
      // 每次播放前重新加载设置
      await this.loadSettings();

      // 声音开关控制：打开则有声音+震动，关闭则静默
      if (this.settings.soundEnabled) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      console.error('[SoundService] 播放提示失败:', err);
    }
  }

  /**
   * 释放资源
   */
  async cleanup(): Promise<void> {
    this.isInitialized = false;
  }
}

export const soundService = new SoundService();
