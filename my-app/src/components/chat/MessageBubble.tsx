import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme, sharedTokens } from '@/theme';
import { Avatar } from '../ui/Avatar';
import type { Message, MessageType, UserPublic } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  showAvatar?: boolean;
  showTime?: boolean;
  sender?: UserPublic | null;
  onLongPress?: (message: Message) => void;
  onImagePress?: (url: string) => void;
  onAvatarPress?: (userId: string) => void;
  style?: StyleProp<ViewStyle>;
}

export function MessageBubble({
  message,
  isMine,
  showAvatar = true,
  showTime = false,
  sender,
  onLongPress,
  onImagePress,
  onAvatarPress,
  style,
}: MessageBubbleProps) {
  const { colors } = useTheme();

  // 已撤回消息
  if (message.isRecalled) {
    return (
      <View style={[styles.container, styles.centerContainer, style]}>
        <Text style={[styles.recalledText, { color: colors.textTertiary }]}>
          {isMine ? '你撤回了一条消息' : `${sender?.name || '对方'}撤回了一条消息`}
        </Text>
      </View>
    );
  }

  const renderContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <Text
            style={[
              styles.textContent,
              { color: isMine ? colors.bubbleMineText : colors.bubbleOtherText },
            ]}
          >
            {message.content}
          </Text>
        );

      case 'image':
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => message.mediaUrl && onImagePress?.(message.mediaUrl)}
          >
            <Image
              source={{ uri: message.mediaUrl || '' }}
              style={styles.imageContent}
              resizeMode="cover"
            />
          </TouchableOpacity>
        );

      case 'voice':
        return (
          <View style={styles.voiceContent}>
            <Text
              style={[
                styles.voiceIcon,
                { color: isMine ? colors.bubbleMineText : colors.bubbleOtherText },
              ]}
            >
              🔊
            </Text>
            <Text
              style={[
                styles.voiceDuration,
                { color: isMine ? colors.bubbleMineText : colors.bubbleOtherText },
              ]}
            >
              {message.mediaDuration ? `${Math.ceil(message.mediaDuration)}''` : '0\'\''}
            </Text>
          </View>
        );

      default:
        return (
          <Text style={[styles.textContent, { color: colors.textTertiary }]}>
            [不支持的消息类型]
          </Text>
        );
    }
  };

  const getStatusIcon = () => {
    // 根据localId判断是否发送中
    if ('localId' in message && message.localId) {
      return '⏳'; // 发送中
    }
    if (message.readAt) {
      return '✓✓'; // 已读
    }
    if (message.deliveredAt) {
      return '✓'; // 已送达
    }
    return '';
  };

  return (
    <View style={[styles.container, isMine ? styles.mineContainer : styles.otherContainer, style]}>
      {/* 头像（他人消息显示在左侧） */}
      {!isMine && showAvatar && (
        <TouchableOpacity
          onPress={() => sender?.id && onAvatarPress?.(sender.id)}
          style={styles.avatarLeft}
        >
          <Avatar uri={sender?.avatar} name={sender?.name} size="sm" />
        </TouchableOpacity>
      )}

      <View style={[styles.bubbleWrapper, isMine ? styles.mineBubbleWrapper : styles.otherBubbleWrapper]}>
        {/* 发送者名称（群聊中显示） */}
        {!isMine && sender?.name && (
          <Text style={[styles.senderName, { color: colors.textTertiary }]}>
            {sender.name}
          </Text>
        )}

        {/* 消息气泡 */}
        <TouchableOpacity
          activeOpacity={0.8}
          onLongPress={() => onLongPress?.(message)}
          style={[
            styles.bubble,
            isMine ? styles.mineBubble : styles.otherBubble,
            {
              backgroundColor: isMine ? colors.bubbleMine : colors.bubbleOther,
            },
            message.type === 'image' && styles.imageBubble,
          ]}
        >
          {renderContent()}
        </TouchableOpacity>

        {/* 时间和状态 */}
        {(showTime || isMine) && (
          <View style={[styles.metaRow, isMine ? styles.mineMetaRow : styles.otherMetaRow]}>
            {showTime && (
              <Text style={[styles.time, { color: colors.textTertiary }]}>
                {formatMessageTime(message.createdAt)}
              </Text>
            )}
            {isMine && (
              <Text style={[styles.status, { color: colors.textTertiary }]}>
                {getStatusIcon()}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* 头像（自己消息显示在右侧） */}
      {isMine && showAvatar && (
        <View style={styles.avatarRight}>
          <Avatar uri={sender?.avatar} name={sender?.name} size="sm" />
        </View>
      )}
    </View>
  );
}

// 格式化消息时间
function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (diffDays === 0) {
    return timeStr;
  }
  if (diffDays === 1) {
    return `昨天 ${timeStr}`;
  }
  if (diffDays < 7) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${weekdays[date.getDay()]} ${timeStr}`;
  }

  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}/${day} ${timeStr}`;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: sharedTokens.spacing.md,
    paddingVertical: sharedTokens.spacing.xs,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: sharedTokens.spacing.sm,
  },
  mineContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  avatarLeft: {
    marginRight: sharedTokens.spacing.sm,
    alignSelf: 'flex-end',
  },
  avatarRight: {
    marginLeft: sharedTokens.spacing.sm,
    alignSelf: 'flex-end',
  },
  bubbleWrapper: {
    maxWidth: '70%',
  },
  mineBubbleWrapper: {
    alignItems: 'flex-end',
  },
  otherBubbleWrapper: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: sharedTokens.typography.size.xs,
    marginBottom: sharedTokens.spacing['2xs'],
    marginLeft: sharedTokens.spacing.xs,
  },
  bubble: {
    paddingHorizontal: sharedTokens.spacing.md,
    paddingVertical: sharedTokens.spacing.sm,
    borderRadius: sharedTokens.radius.lg,
  },
  mineBubble: {
    borderBottomRightRadius: sharedTokens.radius.xs,
  },
  otherBubble: {
    borderBottomLeftRadius: sharedTokens.radius.xs,
  },
  imageBubble: {
    padding: 0,
    overflow: 'hidden',
  },
  textContent: {
    fontSize: sharedTokens.typography.size.md,
    lineHeight: 22,
  },
  imageContent: {
    width: 200,
    height: 200,
    borderRadius: sharedTokens.radius.md,
  },
  voiceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
  },
  voiceIcon: {
    fontSize: 16,
    marginRight: sharedTokens.spacing.xs,
  },
  voiceDuration: {
    fontSize: sharedTokens.typography.size.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: sharedTokens.spacing['2xs'],
  },
  mineMetaRow: {
    justifyContent: 'flex-end',
  },
  otherMetaRow: {
    justifyContent: 'flex-start',
  },
  time: {
    fontSize: sharedTokens.typography.size.xs,
  },
  status: {
    fontSize: sharedTokens.typography.size.xs,
    marginLeft: sharedTokens.spacing.xs,
  },
  recalledText: {
    fontSize: sharedTokens.typography.size.sm,
    fontStyle: 'italic',
  },
});
