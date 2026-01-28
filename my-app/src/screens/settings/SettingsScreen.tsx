import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();

  const menuSections = [
    {
      items: [
        {
          icon: 'notifications-outline',
          title: '通知',
          onPress: () => navigation.navigate('NotificationSettings'),
          showArrow: true,
        },
      ],
    },
    {
      items: [
        {
          icon: 'shield-checkmark-outline',
          title: '隐私',
          subtitle: '隐私设置',
          onPress: () => navigation.navigate('Privacy'),
          showArrow: true,
        },
        {
          icon: 'lock-closed-outline',
          title: '账号与安全',
          onPress: () => navigation.navigate('Account'),
          showArrow: true,
        },
      ],
    },
    {
      items: [
        {
          icon: 'document-text-outline',
          title: '服务协议',
          onPress: () => navigation.navigate('About', { type: 'terms' }),
          showArrow: true,
        },
        {
          icon: 'shield-outline',
          title: '隐私政策',
          onPress: () => navigation.navigate('About', { type: 'privacy' }),
          showArrow: true,
        },
        {
          icon: 'information-circle-outline',
          title: '关于包聊',
          onPress: () => navigation.navigate('About', { type: 'about' }),
          showArrow: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.menuItem,
                  itemIndex < section.items.length - 1 && styles.menuItemBorder,
                ]}
                onPress={item.onPress}
                activeOpacity={0.6}
                disabled={!item.onPress}
              >
                <Ionicons name={item.icon as any} size={22} color="#000000" />
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  {item.subtitle && <Text style={styles.menuSubtitle}>{item.subtitle}</Text>}
                </View>
                {item.showArrow && <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.version}>版本 1.0.0</Text>
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: '#000000',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  version: {
    fontSize: 13,
    color: '#8E8E93',
  },
});
