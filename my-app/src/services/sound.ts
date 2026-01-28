/**
 * 音频服务 - 播放消息提示音
 */

import { Audio } from 'expo-av';

class SoundService {
  private messageSound: Audio.Sound | null = null;
  private isInitialized = false;

  /**
   * 初始化音频服务
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 设置音频模式
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // 预加载消息提示音
      const { sound } = await Audio.Sound.createAsync(
        // 使用简单的提示音 - 可替换为本地文件
        { uri: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73467.mp3' },
        { shouldPlay: false, volume: 0.5 }
      );
      this.messageSound = sound;
      this.isInitialized = true;

      console.log('[SoundService] 初始化成功');
    } catch (err) {
      console.error('[SoundService] 初始化失败:', err);
    }
  }

  /**
   * 播放新消息提示音
   */
  async playMessageSound(): Promise<void> {
    try {
      if (!this.messageSound) {
        await this.init();
      }

      if (this.messageSound) {
        // 重置到开头并播放
        await this.messageSound.setPositionAsync(0);
        await this.messageSound.playAsync();
      }
    } catch (err) {
      console.error('[SoundService] 播放提示音失败:', err);
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
