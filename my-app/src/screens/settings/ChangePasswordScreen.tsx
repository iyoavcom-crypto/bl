import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { api } from '@/config';

export function ChangePasswordScreen() {
  const navigation = useNavigation();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('提示', '两次输入的新密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('提示', '新密码长度至少为6位');
      return;
    }

    if (oldPassword === newPassword) {
      Alert.alert('提示', '新密码不能与旧密码相同');
      return;
    }

    setIsLoading(true);

    try {
      await api.put('/api/im/users/me/password', {
        oldPassword,
        newPassword,
      });

      Alert.alert('成功', '密码修改成功', [
        { text: '确定', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('修改失败', error instanceof Error ? error.message : '请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>当前密码</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入当前密码"
            placeholderTextColor="#C7C7CC"
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>新密码</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入新密码（至少6位）"
            placeholderTextColor="#C7C7CC"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>确认新密码</Text>
          <TextInput
            style={styles.input}
            placeholder="请再次输入新密码"
            placeholderTextColor="#C7C7CC"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleChangePassword}
          disabled={isLoading}
          activeOpacity={0.6}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>确认修改</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>密码安全提示</Text>
        <Text style={styles.tipsText}>• 密码长度至少为6位</Text>
        <Text style={styles.tipsText}>• 建议使用字母、数字和符号组合</Text>
        <Text style={styles.tipsText}>• 定期更换密码以保障账号安全</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  form: {
    margin: 16,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginLeft: 4,
  },
  input: {
    height: 48,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000000',
  },
  button: {
    height: 48,
    backgroundColor: '#07C160',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  tips: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});
