import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { soundService } from '@/services/sound';

export function NotificationSettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    checkPermissions();
    loadSettings();
  }, []);

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(status === 'granted');
  };

  const loadSettings = async () => {
    await soundService.init();
    const settings = soundService.getSettings();
    setSoundEnabled(settings.soundEnabled);
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationsEnabled(status === 'granted');
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleToggleSound = async (value: boolean) => {
    setSoundEnabled(value);
    await soundService.saveSettings({ soundEnabled: value });
  };

  const settingsItems = [
    {
      title: '允许通知',
      subtitle: '接收消息、好友申请等通知',
      value: notificationsEnabled,
      onValueChange: handleToggleNotifications,
    },
    {
      title: '声音',
      subtitle: '新消息提示音和振动',
      value: soundEnabled,
      onValueChange: handleToggleSound,
      disabled: !notificationsEnabled,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.section}>
          {settingsItems.map((item, index) => (
            <View
              key={index}
              style={[
                styles.item,
                index < settingsItems.length - 1 && styles.itemBorder,
              ]}
            >
              <View style={styles.content}>
                <Text style={[styles.title, item.disabled && styles.titleDisabled]}>
                  {item.title}
                </Text>
                {item.subtitle && (
                  <Text style={styles.subtitle}>{item.subtitle}</Text>
                )}
              </View>
              <Switch
                value={item.value}
                onValueChange={item.onValueChange}
                disabled={item.disabled}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                thumbColor="#ffffff"
                ios_backgroundColor="#E5E5EA"
              />
            </View>
          ))}
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            如需关闭通知，请前往系统设置 {'>'} 包聊 {'>'} 通知
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  itemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  titleDisabled: {
    color: '#C7C7CC',
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
  notice: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  noticeText: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 20,
    textAlign: 'center',
  },
});
