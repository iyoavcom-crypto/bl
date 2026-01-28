import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ChatsStackParamList } from '@/navigation/types';
import { useGroupStore, useAuthStore } from '@/stores';
import type { GroupMember } from '@/types';

type Props = NativeStackScreenProps<ChatsStackParamList, 'ManageMembers'>;

export function ManageMembersScreen({ route, navigation }: Props) {
  const { groupId } = route.params;
  const { user } = useAuthStore();
  const { fetchGroup, fetchMembers, removeMember, members } = useGroupStore();
  const [group, setGroup] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const groupMembers = members[groupId] || [];
  const isOwner = group?.ownerId === user?.id;
  const userRole = group?.membership?.role || 'member';
  const canManage = isOwner || userRole === 'admin';

  useEffect(() => {
    loadData();
  }, [groupId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [groupInfo] = await Promise.all([
        fetchGroup(groupId),
        fetchMembers(groupId),
      ]);
      setGroup(groupInfo);
    } catch (error) {
      Alert.alert('错误', '加载群组信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = (member: GroupMember) => {
    if (member.userId === user?.id) {
      Alert.alert('提示', '不能移除自己');
      return;
    }

    if (member.role === 'owner') {
      Alert.alert('提示', '不能移除群主');
      return;
    }

    if (!isOwner && member.role === 'admin') {
      Alert.alert('提示', '管理员不能移除其他管理员');
      return;
    }

    const displayName = member.nickname || member.user?.name || '该成员';
    Alert.alert('移除成员', `确定要将 ${displayName} 移出群组吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '移除',
        style: 'destructive',
        onPress: async () => {
          setRemovingId(member.userId);
          try {
            console.log('[ManageMembersScreen] Removing member:', member.userId);
            await removeMember(groupId, member.userId);
            Alert.alert('成功', '已移除该成员');
          } catch (err) {
            console.error('[ManageMembersScreen] Remove member error:', err);
            Alert.alert('失败', '移除成员失败');
          } finally {
            setRemovingId(null);
          }
        },
      },
    ]);
  };

  const renderMember = ({ item }: { item: GroupMember }) => {
    const displayName = item.nickname || item.user?.name || '未知用户';
    const isRemoving = removingId === item.userId;
    const canRemove = canManage && item.userId !== user?.id && item.role !== 'owner';

    return (
      <View style={styles.memberItem}>
        <View style={styles.memberLeft}>
          <View style={styles.memberAvatar}>
            <Text style={styles.memberAvatarText}>{displayName[0] || '?'}</Text>
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{displayName}</Text>
            {item.role === 'owner' && <Text style={styles.memberRole}>群主</Text>}
            {item.role === 'admin' && <Text style={styles.memberRole}>管理员</Text>}
          </View>
        </View>
        {canRemove && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveMember(item)}
            disabled={isRemoving}
            activeOpacity={0.6}
          >
            {isRemoving ? (
              <ActivityIndicator size="small" color="#FF3B30" />
            ) : (
              <Ionicons name="close-circle" size={24} color="#FF3B30" />
            )}
          </TouchableOpacity>
        )}
      </View>
    );
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

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.title}>成员管理</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>共 {groupMembers.length} 名成员</Text>
      </View>

      <FlatList
        data={groupMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  list: {
    backgroundColor: '#ffffff',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 12,
    color: '#FF9500',
  },
  removeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginLeft: 68,
  },
});
