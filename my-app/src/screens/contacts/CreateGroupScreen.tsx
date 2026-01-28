import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ContactsStackParamList } from '@/navigation/types';
import { useFriendStore, useGroupStore, useConversationStore } from '@/stores';
import type { Friend } from '@/types';

type Props = NativeStackScreenProps<ContactsStackParamList, 'CreateGroup'>;

export function CreateGroupScreen({ navigation }: Props) {
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const { friends } = useFriendStore();
  const { createGroup } = useGroupStore();
  const { createPrivateChat } = useConversationStore();

  console.log('[CreateGroupScreen] Render:', {
    friendsCount: friends?.length || 0,
    selectedCount: selectedFriends.size,
    groupName
  });

  const toggleFriend = useCallback((friendId: string) => {
    setSelectedFriends((prev) => {
      const next = new Set(prev);
      if (next.has(friendId)) {
        next.delete(friendId);
      } else {
        next.add(friendId);
      }
      return next;
    });
  }, []);

  const handleCreate = async () => {
    if (selectedFriends.size === 0) {
      Alert.alert('提示', '请至少选择一个好友');
      return;
    }

    // 如果只选了一个人，创建私聊而不是群聊
    if (selectedFriends.size === 1) {
      const friendId = Array.from(selectedFriends)[0];
      try {
        console.log('[CreateGroupScreen] Creating private chat with:', friendId);
        const conversation = await createPrivateChat(friendId);
        if (conversation) {
          const friend = friends.find(f => f.friendId === friendId);
          const title = friend?.alias || friend?.friend?.name || '聊天';
          // @ts-ignore - navigation to ChatRoom
          navigation.navigate('ChatRoom', {
            conversationId: conversation.id,
            title,
          });
        }
      } catch (err) {
        console.error('[CreateGroupScreen] Create private chat error:', err);
        Alert.alert('错误', '创建会话失败');
      }
      return;
    }

    // 创建群聊
    if (!groupName.trim()) {
      Alert.alert('提示', '请输入群名称');
      return;
    }

    try {
      console.log('[CreateGroupScreen] Creating group:', {
        name: groupName,
        members: Array.from(selectedFriends)
      });

      const group = await createGroup({
        name: groupName.trim(),
        memberIds: Array.from(selectedFriends),
      });

      if (group) {
        Alert.alert('成功', '群聊创建成功', [
          {
            text: '确定',
            onPress: () => {
              // 跳转到群聊页面
              navigation.replace('ChatRoom', {
                conversationId: group.id,
                title: group.name,
              });
            },
          },
        ]);
      }
    } catch (err) {
      console.error('[CreateGroupScreen] Create group error:', err);
      Alert.alert('错误', '创建群聊失败');
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
        <Text style={styles.title}>发起群聊</Text>
        <TouchableOpacity
          onPress={handleCreate}
          disabled={selectedFriends.size === 0}
          style={[styles.createButton, selectedFriends.size === 0 && styles.createButtonDisabled]}
        >
          <Text style={[styles.createButtonText, selectedFriends.size === 0 && styles.createButtonTextDisabled]}>
            完成
          </Text>
        </TouchableOpacity>
      </View>

      {selectedFriends.size > 1 && (
        <View style={styles.groupNameSection}>
          <Text style={styles.label}>群名称</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入群名称"
            placeholderTextColor="#C7C7CC"
            value={groupName}
            onChangeText={setGroupName}
            maxLength={20}
          />
        </View>
      )}

      <View style={styles.selectedSection}>
        <Text style={styles.selectedCount}>
          已选择 {selectedFriends.size} 人
          {selectedFriends.size === 1 && ' (将创建私聊)'}
        </Text>
      </View>

      <FlatList
        data={friends}
        renderItem={renderFriend}
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
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  createButtonDisabled: {
    opacity: 0.4,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#07C160',
  },
  createButtonTextDisabled: {
    color: '#8E8E93',
  },
  groupNameSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: '#000000',
    paddingVertical: 8,
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
});
