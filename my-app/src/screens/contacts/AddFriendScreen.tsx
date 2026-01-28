import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ContactsStackParamList } from '@/navigation/types';
import { useUserStore, useFriendStore } from '@/stores';
import type { FriendSource } from '@/types';

type Props = NativeStackScreenProps<ContactsStackParamList, 'AddFriend'>;

export function AddFriendScreen({ navigation }: Props) {
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [message, setMessage] = useState('你好，我是');

  const { searchUsers } = useUserStore();
  const { sendRequest } = useFriendStore();

  const handleSearch = async () => {
    if (!searchText.trim()) {
      Alert.alert('提示', '请输入手机号或包聊号');
      return;
    }

    setIsSearching(true);
    setResult(null);

    try {
      const users = await searchUsers({ keyword: searchText.trim() });
      if (users.length > 0) {
        setResult(users[0]);
      } else {
        Alert.alert('提示', '未找到该用户');
      }
    } catch (error) {
      Alert.alert('搜索失败', '请稍后重试');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async () => {
    if (!result) return;

    try {
      await sendRequest({
        toUserId: result.id,
        message: message.trim(),
        source: 'search' as FriendSource,
      });
      Alert.alert('成功', '好友申请已发送', [
        { text: '确定', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('发送失败', error instanceof Error ? error.message : '请稍后重试');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="手机号/包聊号"
              placeholderTextColor="#C7C7CC"
              value={searchText}
              onChangeText={setSearchText}
              keyboardType="default"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={isSearching}
              activeOpacity={0.6}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#07C160" />
              ) : (
                <Text style={styles.searchButtonText}>搜索</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {result && (
          <View style={styles.resultSection}>
            <View style={styles.userCard}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>{result.name?.[0] || '?'}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{result.name}</Text>
                <Text style={styles.userPhone}>包聊号：{result.code || result.id}</Text>
              </View>
            </View>

            <View style={styles.messageSection}>
              <Text style={styles.messageLabel}>验证信息</Text>
              <TextInput
                style={styles.messageInput}
                placeholder="输入验证信息"
                placeholderTextColor="#C7C7CC"
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={50}
              />
              <Text style={styles.messageHint}>{message.length}/50</Text>
            </View>

            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendRequest}
              activeOpacity={0.6}
            >
              <Text style={styles.sendButtonText}>发送好友申请</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  searchBar: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000000',
  },
  searchButton: {
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  searchButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
  },
  resultSection: {
    marginTop: 16,
  },
  userCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
  },
  userPhone: {
    fontSize: 14,
    color: '#8E8E93',
  },
  messageSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  messageLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 12,
  },
  messageInput: {
    minHeight: 80,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#000000',
    textAlignVertical: 'top',
  },
  messageHint: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 8,
  },
  sendButton: {
    height: 48,
    margin: 16,
    backgroundColor: '#07C160',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
});
