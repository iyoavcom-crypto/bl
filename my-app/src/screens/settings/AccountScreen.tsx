import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores';
import { api } from '@/config';

export function AccountScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const [showDeleteInput, setShowDeleteInput] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword' as never);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '注销账号',
      '注销账号后，您的所有数据将被永久删除且无法恢复。\n\n此操作不可逆，请谨慎操作。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '继续',
          style: 'destructive',
          onPress: () => setShowDeleteInput(true),
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    if (confirmText !== '删除账号') {
      Alert.alert('提示', '请输入"删除账号"以确认操作');
      return;
    }

    try {
      // 调用后端删除账号接口
      await api.delete('/api/im/users/me');
      
      Alert.alert('账号已注销', '您的账号已被永久删除', [
        {
          text: '确定',
          onPress: async () => {
            await logout();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('操作失败', error instanceof Error ? error.message : '请稍后重试');
    }
  };

  const menuItems = [
    {
      icon: 'lock-closed-outline',
      title: '修改密码',
      onPress: handleChangePassword,
      showArrow: true,
    },
    {
      icon: 'phone-portrait-outline',
      title: '手机号',
      subtitle: user?.phone || '',
      showArrow: false,
    },
    {
      icon: 'finger-print-outline',
      title: '包聊号',
      subtitle: user?.code || user?.id || '',
      showArrow: false,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.section}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder,
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

        {!showDeleteInput ? (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            activeOpacity={0.6}
          >
            <Text style={styles.deleteButtonText}>注销账号</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.deleteSection}>
            <View style={styles.deleteWarning}>
              <Ionicons name="warning" size={24} color="#FF3B30" />
              <Text style={styles.deleteWarningText}>
                此操作将永久删除您的账号和所有数据，且无法恢复。
              </Text>
            </View>

            <View style={styles.confirmInput}>
              <Text style={styles.confirmLabel}>请输入"删除账号"以确认：</Text>
              <TextInput
                style={styles.input}
                placeholder="删除账号"
                placeholderTextColor="#C7C7CC"
                value={confirmText}
                onChangeText={setConfirmText}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteInput(false);
                  setConfirmText('');
                }}
                activeOpacity={0.6}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, confirmText !== '删除账号' && styles.confirmButtonDisabled]}
                onPress={confirmDeleteAccount}
                disabled={confirmText !== '删除账号'}
                activeOpacity={0.6}
              >
                <Text style={styles.confirmButtonText}>确认注销</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>注销说明</Text>
          <Text style={styles.noticeText}>• 注销后，您的账号将被永久删除</Text>
          <Text style={styles.noticeText}>• 所有聊天记录、好友关系将被清空</Text>
          <Text style={styles.noticeText}>• 已加入的群组将自动退出</Text>
          <Text style={styles.noticeText}>• 此操作不可撤销，请谨慎操作</Text>
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
  deleteButton: {
    height: 48,
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
  },
  deleteSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    gap: 16,
  },
  deleteWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#FFF3F3',
    borderRadius: 8,
  },
  deleteWarningText: {
    flex: 1,
    fontSize: 14,
    color: '#FF3B30',
    lineHeight: 20,
  },
  confirmInput: {
    gap: 8,
  },
  confirmLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  input: {
    height: 44,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#000000',
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  confirmButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  notice: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    gap: 8,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});
