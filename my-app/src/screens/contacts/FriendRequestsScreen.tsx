import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFriendStore } from '@/stores';
import type { FriendRequest } from '@/types';

export function FriendRequestsScreen() {
  const { receivedRequests, isLoading, fetchReceivedRequests, acceptRequest, rejectRequest } = useFriendStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReceivedRequests();
  }, [fetchReceivedRequests]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReceivedRequests();
    setRefreshing(false);
  };

  const handleAccept = async (requestId: string) => {
    try {
      await acceptRequest(requestId);
      Alert.alert('成功', '已添加为好友');
    } catch (error) {
      Alert.alert('操作失败', '请稍后重试');
    }
  };

  const handleReject = async (requestId: string) => {
    Alert.alert('拒绝申请', '确定要拒绝该好友申请吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '拒绝',
        style: 'destructive',
        onPress: async () => {
          try {
            await rejectRequest(requestId);
          } catch (error) {
            Alert.alert('操作失败', '请稍后重试');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: FriendRequest }) => {
    const isPending = item.status === 'pending';

    return (
      <View style={styles.item}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.fromUser?.name?.[0] || '?'}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.name}>{item.fromUser?.name || '未知用户'}</Text>
          {item.message && <Text style={styles.message}>{item.message}</Text>}
          <Text style={styles.time}>
            {new Date(item.createdAt).toLocaleDateString('zh-CN', {
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {isPending ? (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleReject(item.id)}
              activeOpacity={0.6}
            >
              <Text style={styles.rejectButtonText}>拒绝</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => handleAccept(item.id)}
              activeOpacity={0.6}
            >
              <Text style={styles.acceptButtonText}>接受</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.statusText}>
            {item.status === 'accepted' ? '已接受' : '已拒绝'}
          </Text>
        )}
      </View>
    );
  };

  if (isLoading && receivedRequests.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#07C160" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {receivedRequests.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>暂无好友申请</Text>
        </View>
      ) : (
        <FlatList
          data={receivedRequests}
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
    alignItems: 'center',
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
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  message: {
    fontSize: 14,
    color: '#8E8E93',
  },
  time: {
    fontSize: 12,
    color: '#C7C7CC',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    paddingHorizontal: 16,
    height: 32,
    backgroundColor: '#07C160',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  rejectButton: {
    paddingHorizontal: 16,
    height: 32,
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  statusText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginLeft: 76,
  },
});
