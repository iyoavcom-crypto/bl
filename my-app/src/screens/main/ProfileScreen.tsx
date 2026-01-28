import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { useAuthStore, useUserStore } from '@/stores';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuthStore();
  const { profile } = useUserStore();

  const displayUser = profile || user;

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const menuSections = [
    {
      items: [
        {
          icon: 'person-outline',
          title: '账号管理',
          onPress: () => navigation.navigate('Account'),
        },
        {
          icon: 'settings-outline',
          title: '设置',
          onPress: () => navigation.navigate('Settings'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>我</Text>
      </View>

      <ScrollView>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayUser?.name?.[0] || '?'}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{displayUser?.name || '未知用户'}</Text>
            <Text style={styles.phone}>包聊号：{displayUser?.code || displayUser?.id || ''}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </View>

        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.menuItem,
                  itemIndex === 0 && styles.menuItemFirst,
                  itemIndex === section.items.length - 1 && styles.menuItemLast,
                ]}
                onPress={item.onPress}
                activeOpacity={0.6}
              >
                <Ionicons name={item.icon as any} size={20} color="#000000" />
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.6}>
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  phone: {
    fontSize: 14,
    color: '#8E8E93',
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
    height: 56,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemFirst: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  menuItemLast: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  logoutButton: {
    height: 56,
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
  },
});
