import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ChatsStackParamList } from '@/navigation/types';
import { useUserStore, useFriendStore, useConversationStore } from '@/stores';

type Props = NativeStackScreenProps<ChatsStackParamList, 'UserInfo'>;

export function UserInfoScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isFriend, setIsFriend] = useState(false);

  const { getUserPublic } = useUserStore();
  const { checkIsFriend, sendRequest, deleteFriend } = useFriendStore();
  const { createPrivateChat } = useConversationStore();

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [userInfo, friendStatus] = await Promise.all([
        getUserPublic(userId),
        checkIsFriend(userId),
      ]);
      setUser(userInfo);
      setIsFriend(friendStatus);
    } catch (error) {
      Alert.alert('错误', '加载用户信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    try {
      const conversation = await createPrivateChat(userId);
      if (conversation) {
        navigation.navigate('ChatRoom', {
          conversationId: conversation.id,
          title: user?.name || '聊天',
        });
      }
    } catch (error) {
      Alert.alert('错误', '创建会话失败');
    }
  };

  const handleAddFriend = async () => {
    try {
      await sendRequest({
        toUserId: userId,
        message: '你好，我想加你为好友',
        source: 'search',
      });
      Alert.alert('成功', '好友申请已发送');
    } catch (error) {
      Alert.alert('失败', '发送好友申请失败');
    }
  };

  const handleDeleteFriend = () => {
    Alert.alert('删除好友', '确定要删除该好友吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteFriend(userId);
            setIsFriend(false);
            Alert.alert('成功', '已删除好友');
          } catch (error) {
            Alert.alert('失败', '删除好友失败');
          }
        },
      },
    ]);
  };

  const handleReport = () => {
    navigation.navigate('Report', {
      targetId: userId,
      targetType: 'user',
      targetName: user?.name,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#07C160" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>用户不存在</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name?.[0] || '?'}</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.code}>包聊号：{user.code || user.id}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSendMessage} activeOpacity={0.6}>
            <Ionicons name="chatbubble-outline" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>发消息</Text>
          </TouchableOpacity>

          {isFriend ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDeleteFriend}
              activeOpacity={0.6}
            >
              <Ionicons name="person-remove-outline" size={20} color="#FF3B30" />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>删除好友</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionButton} onPress={handleAddFriend} activeOpacity={0.6}>
              <Ionicons name="person-add-outline" size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>添加好友</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.reportButton} onPress={handleReport} activeOpacity={0.6}>
          <Ionicons name="warning-outline" size={18} color="#FF3B30" />
          <Text style={styles.reportButtonText}>举报</Text>
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  profile: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#ffffff',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  code: {
    fontSize: 14,
    color: '#8E8E93',
  },
  actions: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    backgroundColor: '#07C160',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  deleteButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
  reportButton: {
    flexDirection: 'row',
    height: 44,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  reportButtonText: {
    fontSize: 15,
    color: '#FF3B30',
  },
});
