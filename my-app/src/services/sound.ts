/**
 * 音频和震动服务 - 播放消息提示音和震动反馈
 */

import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@notification_settings';

interface NotificationSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

class SoundService {
  private messageSound: Audio.Sound | null = null;
  private isInitialized = false;
  private settings: NotificationSettings = {
    soundEnabled: true,
    vibrationEnabled: true,
  };

  /**
   * 初始化音频服务
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 加载设置
      await this.loadSettings();

      // 设置音频模式
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      this.isInitialized = true;
      console.log('[SoundService] 初始化成功');
    } catch (err) {
      console.error('[SoundService] 初始化失败:', err);
    }
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
   * 播放新消息提示音和震动
   */
  async playMessageSound(): Promise<void> {
    try {
      // 震动反馈
      if (this.settings.vibrationEnabled) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // 播放声音 - 使用系统触觉反馈代替音频
      if (this.settings.soundEnabled) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (err) {
      console.error('[SoundService] 播放提示失败:', err);
    }
  }

  /**
   * 释放音频资源
   */
  async cleanup(): Promise<void> {
    try {
      if (this.messageSound) {
        await this.messageSound.unloadAsync();
        this.messageSound = null;
      }
      this.isInitialized = false;
    } catch (err) {
      console.error('[SoundService] 清理失败:', err);
    }
  }
}

export const soundService = new SoundService();
