import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ChatsStackParamList } from '@/navigation/types';
import { useGroupStore, useAuthStore } from '@/stores';
import type { GroupMember } from '@/types';

type Props = NativeStackScreenProps<ChatsStackParamList, 'GroupInfo'>;

export function GroupInfoScreen({ route, navigation }: Props) {
  const { groupId } = route.params;
  const { user } = useAuthStore();
  const { fetchGroup, fetchMembers, leaveGroup, members } = useGroupStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);

  const groupMembers = members[groupId] || [];
  const isOwner = group?.ownerId === user?.id;
  const userRole = group?.membership?.role || 'member';

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

  const handleLeaveGroup = () => {
    if (isOwner) {
      Alert.alert('提示', '群主不能退出群组，请先转让群主或解散群组');
      return;
    }

    Alert.alert('退出群组', '确定要退出该群组吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        style: 'destructive',
        onPress: async () => {
          try {
            await leaveGroup(groupId);
            Alert.alert('成功', '已退出群组', [
              { text: '确定', onPress: () => navigation.goBack() },
            ]);
          } catch (error) {
            Alert.alert('失败', '退出群组失败');
          }
        },
      },
    ]);
  };

  const handleInviteMembers = () => {
    navigation.navigate('InviteMembers', { groupId });
  };

  const handleManageMembers = () => {
    navigation.navigate('ManageMembers', { groupId });
  };

  const handleReport = () => {
    navigation.navigate('Report', {
      targetId: groupId,
      targetType: 'group',
      targetName: group?.name,
    });
  };

  const renderMember = ({ item }: { item: GroupMember }) => (
    <TouchableOpacity style={styles.memberItem} activeOpacity={0.6}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>{item.user?.name?.[0] || '?'}</Text>
      </View>
      <Text style={styles.memberName} numberOfLines={1}>
        {item.nickname || item.user?.name || '未知用户'}
      </Text>
      {item.role === 'owner' && <Text style={styles.memberRole}>群主</Text>}
      {item.role === 'admin' && <Text style={styles.memberRole}>管理员</Text>}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#07C160" />
        </View>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>群组不存在</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{group.name?.[0] || '?'}</Text>
          </View>
          <Text style={styles.name}>{group.name}</Text>
          <Text style={styles.count}>{group.memberCount} 人</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={20} color="#8E8E93" />
            <Text style={styles.infoLabel}>群成员</Text>
            <Text style={styles.infoValue}>{group.memberCount} 人</Text>
          </View>
          <View style={[styles.infoItem, styles.infoItemBorder]}>
            <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" />
            <Text style={styles.infoLabel}>加入方式</Text>
            <Text style={styles.infoValue}>
              {group.joinMode === 'open' ? '直接加入' : group.joinMode === 'approval' ? '需要审批' : '仅邀请'}
            </Text>
          </View>
        </View>

        {groupMembers.length > 0 && (
          <View style={styles.membersSection}>
            <View style={styles.membersSectionHeader}>
              <Text style={styles.membersTitle}>群成员</Text>
              {(isOwner || userRole === 'admin') && (
                <TouchableOpacity onPress={handleManageMembers} activeOpacity={0.6}>
                  <Text style={styles.manageText}>管理</Text>
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={groupMembers.slice(0, 10)}
              renderItem={renderMember}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.membersList}
            />
            <View style={styles.memberActions}>
              <TouchableOpacity style={styles.memberActionButton} onPress={handleInviteMembers} activeOpacity={0.6}>
                <Ionicons name="person-add-outline" size={20} color="#07C160" />
                <Text style={styles.memberActionText}>邀请</Text>
              </TouchableOpacity>
              {groupMembers.length > 10 && (
                <TouchableOpacity style={styles.memberActionButton} activeOpacity={0.6}>
                  <Text style={styles.membersMore}>查看全部 {group.memberCount} 人</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.reportButton} onPress={handleReport} activeOpacity={0.6}>
          <Ionicons name="warning-outline" size={18} color="#FF3B30" />
          <Text style={styles.reportButtonText}>举报群组</Text>
        </TouchableOpacity>

        {!isOwner && (
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveGroup} activeOpacity={0.6}>
            <Text style={styles.leaveButtonText}>退出群组</Text>
          </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#576B95',
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
  count: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 16,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  infoItemBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  infoLabel: {
    fontSize: 16,
    color: '#000000',
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'right',
  },
  membersSection: {
    marginBottom: 16,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  membersList: {
    gap: 12,
  },
  memberItem: {
    alignItems: 'center',
    width: 64,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  memberName: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
  },
  memberRole: {
    fontSize: 10,
    color: '#FF9500',
    marginTop: 2,
  },
  membersMore: {
    fontSize: 14,
    color: '#576B95',
    textAlign: 'center',
    marginTop: 12,
  },
  membersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  manageText: {
    fontSize: 14,
    color: '#576B95',
  },
  memberActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  memberActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberActionText: {
    fontSize: 14,
    color: '#07C160',
  },
  reportButton: {
    flexDirection: 'row',
    height: 44,
    marginHorizontal: 16,
    marginBottom: 16,
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
  leaveButton: {
    height: 48,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
  },
});
