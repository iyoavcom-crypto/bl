import React, { useState } from 'react';
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
import { useFriendStore, useGroupStore } from '@/stores';
import type { Friend } from '@/types';

type Props = NativeStackScreenProps<ChatsStackParamList, 'InviteMembers'>;

export function InviteMembersScreen({ route, navigation }: Props) {
  const { groupId } = route.params;
  const { friends } = useFriendStore();
  const { inviteMembers, members } = useGroupStore();
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [isInviting, setIsInviting] = useState(false);

  const groupMembers = members[groupId] || [];
  const groupMemberIds = new Set(groupMembers.map(m => m.userId));
  
  // 过滤出不在群里的好友
  const availableFriends = friends.filter(f => !groupMemberIds.has(f.friendId));

  console.log('[InviteMembersScreen] Render:', {
    groupId,
    availableFriendsCount: availableFriends.length,
    selectedCount: selectedFriends.size
  });

  const toggleFriend = (friendId: string) => {
    setSelectedFriends((prev) => {
      const next = new Set(prev);
      if (next.has(friendId)) {
        next.delete(friendId);
      } else {
        next.add(friendId);
      }
      return next;
    });
  };

  const handleInvite = async () => {
    if (selectedFriends.size === 0) {
      Alert.alert('提示', '请选择要邀请的好友');
      return;
    }

    setIsInviting(true);
    try {
      console.log('[InviteMembersScreen] Inviting members:', Array.from(selectedFriends));
      await inviteMembers(groupId, Array.from(selectedFriends));
      Alert.alert('成功', `已邀请 ${selectedFriends.size} 位好友`, [
        { text: '确定', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('[InviteMembersScreen] Invite error:', err);
      Alert.alert('失败', '邀请好友失败');
    } finally {
      setIsInviting(false);
    }
  };

  const renderFriend = ({ item }: { item: Friend }) => {
    const isSelected = selectedFriends.has(item.friendId);
    const displayName = item.alias || item.friend?.name || '未知用户';

    return (
      <TouchableOpacity
        style={styles.friendItem}
        onPress={() => toggleFriend(item.friendId)}
        activeOpacity={0.6}
      >
        <View style={styles.friendLeft}>
          <View style={styles.friendAvatar}>
            <Text style={styles.friendAvatarText}>{displayName[0] || '?'}</Text>
          </View>
          <Text style={styles.friendName}>{displayName}</Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#ffffff" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.title}>邀请成员</Text>
        <TouchableOpacity
          onPress={handleInvite}
          disabled={selectedFriends.size === 0 || isInviting}
          style={[styles.inviteButton, (selectedFriends.size === 0 || isInviting) && styles.inviteButtonDisabled]}
        >
          {isInviting ? (
            <ActivityIndicator size="small" color="#07C160" />
          ) : (
            <Text style={[styles.inviteButtonText, selectedFriends.size === 0 && styles.inviteButtonTextDisabled]}>
              邀请
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.selectedSection}>
        <Text style={styles.selectedCount}>已选择 {selectedFriends.size} 人</Text>
      </View>

      {availableFriends.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>没有可邀请的好友</Text>
        </View>
      ) : (
        <FlatList
          data={availableFriends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
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
  inviteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inviteButtonDisabled: {
    opacity: 0.4,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#07C160',
  },
  inviteButtonTextDisabled: {
    color: '#8E8E93',
  },
  selectedSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  selectedCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  list: {
    backgroundColor: '#ffffff',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  friendName: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#07C160',
    borderColor: '#07C160',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginLeft: 68,
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
});
