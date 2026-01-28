import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/stores';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [modalType, setModalType] = useState<'terms' | 'privacy' | null>(null);
  const { register, isLoading } = useAuthStore();

  const termsContent = `欢迎使用包聊！

在使用我们的服务之前，请仔细阅读本服务协议。

一、服务说明
包聊是一款即时通讯应用，为用户提供文字、语音、视频等多种形式的实时通信服务。

二、用户责任
1. 用户应对其账号信息和密码保密
2. 用户不得利用本服务从事违法违规活动
3. 用户发布的内容应遵守法律法规和社会公德
4. 用户不得传播垃圾信息或骚扰他人

三、隐私保护
我们重视用户隐私，承诺保护用户的个人信息安全。具体请参见《隐私政策》。

四、知识产权
本服务的所有内容，包括但不限于软件、文字、图片等，均受知识产权法律保护。

五、免责声明
1. 因不可抗力导致的服务中断，我们不承担责任
2. 用户之间的纠纷应自行解决
3. 用户违规使用服务造成的损失由用户自行承担

六、协议变更
我们保留随时修改本协议的权利，修改后的协议将在应用内公布。

七、法律适用
本协议适用中华人民共和国法律。

最后更新：2026年1月`;

  const privacyContent = `包聊隐私政策

生效日期：2026年1月

我们重视您的隐私。本隐私政策说明了包聊如何收集、使用和保护您的个人信息。

一、信息收集
我们收集以下信息：
• 账号信息：手机号、昵称
• 使用信息：聊天记录、好友关系
• 设备信息：设备型号、操作系统版本
• 位置信息：仅在您授权时收集

二、信息使用
我们使用收集的信息用于：
• 提供即时通讯服务
• 改善用户体验
• 保障账号安全
• 遵守法律要求

三、信息共享
我们承诺：
• 不会出售您的个人信息
• 不会与第三方共享您的隐私数据
• 仅在法律要求或您授权时共享必要信息

四、信息安全
我们采取的安全措施：
• 数据传输加密
• 服务器安全防护
• 严格的访问控制
• 定期安全审计

五、您的权利
您有权：
• 查看和修改个人信息
• 删除账号和数据
• 撤回隐私授权
• 投诉和举报

六、未成年人保护
我们不会有意收集未满18岁未成年人的个人信息。

七、政策更新
我们可能不时更新本隐私政策，重大变更会提前通知您。

八、联系我们
如对本政策有任何疑问，请联系：
邮箱：privacy@baoliao.im

本政策最后更新于2026年1月`;

  const handleRegister = async () => {
    if (!agreed) {
      Alert.alert('提示', '请先阅读并同意用户协议和隐私政策');
      return;
    }

    if (!phone.trim() || !password.trim() || !confirmPassword.trim() || !pin.trim()) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('提示', '两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      Alert.alert('提示', '密码长度至少为6位');
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      Alert.alert('提示', '二级密码必须为6位数字');
      return;
    }

    try {
      await register({ phone, password, pin });
      Alert.alert('注册成功', '即将自动登录', [
        { text: '确定', onPress: () => navigation.replace('Login') }
      ]);
    } catch (error) {
      Alert.alert('注册失败', error instanceof Error ? error.message : '请稍后重试');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>创建账号</Text>
            <Text style={styles.subtitle}>加入包聊，开始沟通</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>手机号</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入手机号"
                placeholderTextColor="#C7C7CC"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>密码</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入密码（至少6位）"
                placeholderTextColor="#C7C7CC"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>确认密码</Text>
              <TextInput
                style={styles.input}
                placeholder="请再次输入密码"
                placeholderTextColor="#C7C7CC"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>二级密码 (PIN)</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入6位数字二级密码"
                placeholderTextColor="#C7C7CC"
                value={pin}
                onChangeText={setPin}
                secureTextEntry
                keyboardType="number-pad"
                maxLength={6}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.agreementRow}>
              <TouchableOpacity onPress={() => setAgreed(!agreed)} style={styles.checkboxWrapper}>
                <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                  {agreed && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
              <Text style={styles.agreementText}>
                我已阅读并同意
                <Text style={styles.agreementLink} onPress={() => setModalType('terms')}>《用户协议》</Text>
                和
                <Text style={styles.agreementLink} onPress={() => setModalType('privacy')}>《隐私政策》</Text>
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, (isLoading || !agreed) && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading || !agreed}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.registerButtonText}>注册</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Text style={styles.loginLinkText}>已有账号？立即登录</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={modalType !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalType(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {modalType === 'terms' ? '用户协议' : '隐私政策'}
            </Text>
            <TouchableOpacity onPress={() => setModalType(null)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>
              {modalType === 'terms' ? termsContent : privacyContent}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  form: {
    gap: 16,
    paddingBottom: 40,
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
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000000',
  },
  registerButton: {
    height: 48,
    backgroundColor: '#07C160',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 8,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#576B95',
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkboxWrapper: {
    padding: 4,
    marginRight: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#07C160',
    borderColor: '#07C160',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  agreementText: {
    fontSize: 12,
    color: '#8E8E93',
    flex: 1,
  },
  agreementLink: {
    color: '#576B95',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#000000',
  },
});
