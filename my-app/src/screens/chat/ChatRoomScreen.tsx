import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ChatsStackParamList } from '@/navigation/types';
import { useMessageStore, useAuthStore } from '@/stores';
import type { Message } from '@/types';

type Props = NativeStackScreenProps<ChatsStackParamList, 'ChatRoom'>;

export function ChatRoomScreen({ route, navigation }: Props) {
  const { conversationId, title } = route.params;
  const [inputText, setInputText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const flatListRef = useRef<FlatList>(null);
  const headerHeight = useHeaderHeight();
  
  console.log('[ChatRoomScreen] Component rendered:', { conversationId, title });

  const { user } = useAuthStore();
  const messageStore = useMessageStore();
  const messages = messageStore.getMessagesByConversation(conversationId);
  const hasMore = messageStore.hasMore[conversationId] ?? true;
  const isLoading = messageStore.isLoading;

  console.log('[ChatRoomScreen] Store state:', {
    userId: user?.id,
    messagesCount: messages?.length || 0,
    isLoading,
    hasMore,
    currentPage,
    messagesIsArray: Array.isArray(messages)
  });

  useEffect(() => {
    console.log('[ChatRoomScreen] Setting navigation title:', title);
    navigation.setOptions({ title });
  }, [title, navigation]);

  // 初始加载第一页
  useEffect(() => {
    console.log('[ChatRoomScreen] Initial load messages');
    messageStore.fetchMessages(conversationId, 1, 30);
  }, [conversationId]);

  // 加载更多历史消息
  const handleLoadMore = async () => {
    if (isLoading || !hasMore) {
      console.log('[ChatRoomScreen] Skip load more:', { isLoading, hasMore });
      return;
    }

    const nextPage = currentPage + 1;
    console.log('[ChatRoomScreen] Loading more messages, page:', nextPage);
    await messageStore.fetchMessages(conversationId, nextPage, 30);
    setCurrentPage(nextPage);
  };

  const handleLongPress = (message: Message, event: any) => {
    console.log('[ChatRoomScreen] Message long pressed:', message.id);
    setSelectedMessage(message);
    setMenuVisible(true);
  };

  const handleRecall = async () => {
    if (!selectedMessage) return;
    
    setMenuVisible(false);
    
    // 检查是否可以撤回（2分钟内）
    const messageTime = new Date(selectedMessage.createdAt).getTime();
    const now = Date.now();
    const diff = now - messageTime;
    const twoMinutes = 2 * 60 * 1000;
    
    if (diff > twoMinutes) {
      Alert.alert('提示', '消息发送超过2分钟，无法撤回');
      setSelectedMessage(null);
      return;
    }

    Alert.alert('撤回消息', '确定要撤回这条消息吗？', [
      { text: '取消', style: 'cancel', onPress: () => setSelectedMessage(null) },
      {
        text: '撤回',
        style: 'destructive',
        onPress: async () => {
          try {
            console.log('[ChatRoomScreen] Recalling message:', selectedMessage.id);
            await messageStore.recallMessage(selectedMessage.id, conversationId);
            Alert.alert('成功', '消息已撤回');
          } catch (err) {
            console.error('[ChatRoomScreen] Recall error:', err);
            Alert.alert('失败', '撤回消息失败');
          } finally {
            setSelectedMessage(null);
          }
        },
      },
    ]);
  };

  const handleCopy = () => {
    setMenuVisible(false);
    if (selectedMessage?.content) {
      // TODO: 实现复制到剪贴板
      Alert.alert('提示', '复制功能待实现');
    }
    setSelectedMessage(null);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    // TODO: 实现删除消息（本地删除）
    Alert.alert('提示', '删除功能待实现');
    setSelectedMessage(null);
  };

  const handleSend = async () => {
    if (!inputText.trim()) {
      console.log('[ChatRoomScreen] handleSend: empty input, skipping');
      return;
    }

    const text = inputText.trim();
    console.log('[ChatRoomScreen] handleSend:', { conversationId, text });
    setInputText('');

    try {
      await messageStore.sendMessage({
        conversationId,
        content: text,
        type: 'text',
      });

      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (err) {
      console.error('[ChatRoomScreen] handleSend error:', err);
    }
  };

  const renderFooter = () => {
    if (!hasMore) return null;
    
    return (
      <View style={styles.loadMoreContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#07C160" />
        ) : (
          <TouchableOpacity onPress={handleLoadMore} activeOpacity={0.6}>
            <Text style={styles.loadMoreText}>加载更多消息</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    try {
      const isMe = item.senderId === user?.id;
      
      // 调试日志
      console.log('[ChatRoomScreen] renderMessage isMe check:', {
        itemSenderId: item.senderId,
        userId: user?.id,
        isMe,
        messageContent: item.content?.substring(0, 20)
      });
      
      const timeStr = new Date(item.createdAt).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const senderName = item.sender?.name || '未知';

      // 如果消息被撤回
      if (item.isRecalled) {
        return (
          <View style={styles.recalledMessage}>
            <Text style={styles.recalledText}>
              {isMe ? '你撤回了一条消息' : `${senderName} 撤回了一条消息`}
            </Text>
          </View>
        );
      }

      return (
        <TouchableOpacity
          style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}
          onLongPress={(e) => handleLongPress(item, e)}
          activeOpacity={0.9}
        >
          {!isMe && (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{senderName[0] || '?'}</Text>
            </View>
          )}

          <View style={[styles.messageContainer, isMe && styles.messageContainerMe]}>
            <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
              <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
                {item.content}
              </Text>
            </View>
            <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>{timeStr}</Text>
          </View>

          {isMe && (
            <View style={[styles.avatar, styles.avatarMe]}>
              <Text style={styles.avatarText}>{user?.name?.[0] || '?'}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    } catch (err) {
      console.error('[ChatRoomScreen] renderMessage error:', {
        error: err,
        messageId: item.id
      });
      return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight - 20 : 0}
    >
      <View style={styles.container}>
        {isLoading && messages.length === 0 ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#07C160" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            inverted
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={renderFooter}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
          />
        )}

        <SafeAreaView edges={['bottom']} style={styles.inputSafeArea}>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="发送消息..."
                placeholderTextColor="#C7C7CC"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
            </View>
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.6}
            >
              <Ionicons name="send" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* 消息长按菜单 */}
        <Modal
          transparent
          visible={menuVisible}
          onRequestClose={() => setMenuVisible(false)}
          animationType="fade"
        >
          <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
            <View style={styles.menuContainer}>
              {selectedMessage?.senderId === user?.id && (
                <TouchableOpacity style={styles.menuItem} onPress={handleRecall} activeOpacity={0.6}>
                  <Ionicons name="arrow-undo" size={20} color="#000000" />
                  <Text style={styles.menuText}>撤回</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.menuItem} onPress={handleCopy} activeOpacity={0.6}>
                <Ionicons name="copy-outline" size={20} color="#000000" />
                <Text style={styles.menuText}>复制</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleDelete} activeOpacity={0.6}>
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                <Text style={[styles.menuText, styles.menuTextDanger]}>删除</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </View>
    </KeyboardAvoidingView>
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
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMe: {
    backgroundColor: '#576B95',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  messageContainer: {
    maxWidth: '70%',
    marginLeft: 8,
  },
  messageContainerMe: {
    marginLeft: 0,
    marginRight: 8,
    alignItems: 'flex-end',
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bubbleOther: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 2,
  },
  bubbleMe: {
    backgroundColor: '#07C160',
    borderTopRightRadius: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#000000',
  },
  messageTextMe: {
    color: '#ffffff',
  },
  messageTime: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
  },
  messageTimeMe: {
    textAlign: 'right',
  },
  inputSafeArea: {
    backgroundColor: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: '#000000',
    maxHeight: 84,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#07C160',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  loadMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 14,
    color: '#07C160',
  },
  recalledMessage: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  recalledText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    minWidth: 160,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  menuText: {
    fontSize: 16,
    color: '#000000',
  },
  menuTextDanger: {
    color: '#FF3B30',
  },
});
