import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ChatsStackParamList } from '@/navigation/types';
import { useConversationStore } from '@/stores';
import type { Conversation } from '@/types';

type NavigationProp = NativeStackNavigationProp<ChatsStackParamList>;

export function ConversationsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { conversations, isLoading, fetchConversations } = useConversationStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('[ConversationsScreen] Component mounted, fetching conversations');
    fetchConversations().catch(err => {
      console.error('[ConversationsScreen] fetchConversations error:', err);
    });
  }, [fetchConversations]);

  const handleRefresh = useCallback(async () => {
    console.log('[ConversationsScreen] Refreshing conversations');
    setRefreshing(true);
    try {
      await fetchConversations();
    } catch (err) {
      console.error('[ConversationsScreen] handleRefresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchConversations]);

  const handlePress = (item: Conversation) => {
    console.log('[ConversationsScreen] Conversation pressed:', {
      id: item.id,
      type: item.type,
      hasTargetUser: !!item.targetUser,
      hasGroup: !!item.group
    });

    try {
      const title = item.type === 'private' 
        ? (item.targetUser?.name || '聊天')
        : (item.group?.name || '群聊');
        
      navigation.navigate('ChatRoom', {
        conversationId: item.id,
        title,
      });
    } catch (err) {
      console.error('[ConversationsScreen] handlePress error:', err);
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    
    return messageDate.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    try {
      const displayName = item.type === 'private' 
        ? (item.targetUser?.name || '未命名会话')
        : (item.group?.name || '群聊');
      const lastMessageText = typeof item.lastMessage === 'string' 
        ? item.lastMessage 
        : item.lastMessage?.content || '暂无消息';
      
      console.log('[ConversationsScreen] renderItem:', {
        id: item.id,
        displayName,
        lastMessageText,
        unreadCount: item.unreadCount
      });
      
      return (
        <TouchableOpacity style={styles.item} onPress={() => handlePress(item)} activeOpacity={0.6}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName[0] || '?'}</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.name} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.time}>{formatTime(item.lastMessageAt || item.createdAt)}</Text>
            </View>

            <View style={styles.footer}>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {lastMessageText}
              </Text>
              {item.unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {item.unreadCount > 99 ? '99+' : item.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    } catch (err) {
      console.error('[ConversationsScreen] renderItem error:', {
        error: err,
        item: JSON.stringify(item).substring(0, 200)
      });
      return null;
    }
  };

  if (isLoading && conversations.length === 0) {
    console.log('[ConversationsScreen] Showing loading state');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#07C160" />
        </View>
      </SafeAreaView>
    );
  }

  console.log('[ConversationsScreen] Rendering conversations:', {
    count: conversations.length,
    conversationIds: conversations.map(c => c.id).slice(0, 5)
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>包聊</Text>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>暂无会话</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  titleBar: {
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
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
  item: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#8E8E93',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginLeft: 76,
  },
});
