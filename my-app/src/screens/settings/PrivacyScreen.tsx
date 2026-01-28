import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores';
import { api } from '@/config';

export function PrivacyScreen() {
  const { user } = useAuthStore();
  const [searchable, setSearchable] = React.useState(user?.searchable ?? true);

  const handleToggleSearchable = async (value: boolean) => {
    try {
      await api.put('/api/im/users/me', { searchable: value });
      setSearchable(value);
    } catch (error) {
      Alert.alert('操作失败', '请稍后重试');
      setSearchable(!value);
    }
  };

  const privacyItems = [
    {
      icon: 'search-outline',
      title: '允许通过手机号搜索',
      subtitle: '关闭后其他用户无法通过手机号搜索到你',
      value: searchable,
      onValueChange: handleToggleSearchable,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.section}>
          {privacyItems.map((item, index) => (
            <View
              key={index}
              style={[
                styles.item,
                index < privacyItems.length - 1 && styles.itemBorder,
              ]}
            >
              <Ionicons name={item.icon as any} size={22} color="#000000" />
              <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                {item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
              </View>
              <Switch
                value={item.value}
                onValueChange={item.onValueChange}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                thumbColor="#ffffff"
                ios_backgroundColor="#E5E5EA"
              />
            </View>
          ))}
        </View>

        <View style={styles.notice}>
          <Ionicons name="shield-checkmark" size={32} color="#34C759" />
          <Text style={styles.noticeTitle}>您的隐私受到保护</Text>
          <Text style={styles.noticeText}>
            我们承诺保护您的隐私和数据安全，不会将您的个人信息用于任何未经授权的用途。
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoTitle}>隐私说明</Text>
          <Text style={styles.infoText}>• 您可以随时控制谁能找到您</Text>
          <Text style={styles.infoText}>• 您的聊天记录采用端到端加密</Text>
          <Text style={styles.infoText}>• 我们不会读取或分享您的私人信息</Text>
          <Text style={styles.infoText}>• 您可以随时删除您的数据</Text>
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
  subtitle: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
  notice: {
    margin: 16,
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
    gap: 12,
  },
  noticeTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  noticeText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  info: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    gap: 8,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});
