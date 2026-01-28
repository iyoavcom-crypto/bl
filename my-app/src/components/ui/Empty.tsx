import React from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme, sharedTokens } from '@/theme';
import { Button } from './Button';

type EmptyType = 'default' | 'noData' | 'noNetwork' | 'noMessage' | 'noFriend' | 'noGroup' | 'error';

interface EmptyProps {
  type?: EmptyType;
  title?: string;
  description?: string;
  icon?: string;
  actionText?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

const defaultContent: Record<EmptyType, { icon: string; title: string; description?: string }> = {
  default: {
    icon: '📭',
    title: '暂无内容',
  },
  noData: {
    icon: '📂',
    title: '暂无数据',
    description: '数据为空',
  },
  noNetwork: {
    icon: '📡',
    title: '网络不可用',
    description: '请检查网络连接后重试',
  },
  noMessage: {
    icon: '💬',
    title: '暂无消息',
    description: '快去和好友聊天吧',
  },
  noFriend: {
    icon: '👥',
    title: '暂无好友',
    description: '添加好友开始聊天',
  },
  noGroup: {
    icon: '👨‍👩‍👧‍👦',
    title: '暂无群组',
    description: '创建或加入群组',
  },
  error: {
    icon: '⚠️',
    title: '加载失败',
    description: '请稍后重试',
  },
};

export function Empty({
  type = 'default',
  title,
  description,
  icon,
  actionText,
  onAction,
  style,
}: EmptyProps) {
  const { colors } = useTheme();

  const content = defaultContent[type];
  const displayIcon = icon || content.icon;
  const displayTitle = title || content.title;
  const displayDescription = description || content.description;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{displayIcon}</Text>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {displayTitle}
      </Text>
      {displayDescription && (
        <Text style={[styles.description, { color: colors.textTertiary }]}>
          {displayDescription}
        </Text>
      )}
      {actionText && onAction && (
        <Button
          title={actionText}
          variant="outline"
          size="sm"
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
}

// 列表空状态
interface ListEmptyProps {
  type?: EmptyType;
  title?: string;
  description?: string;
}

export function ListEmpty({ type = 'noData', title, description }: ListEmptyProps) {
  return (
    <Empty
      type={type}
      title={title}
      description={description}
      style={styles.listEmpty}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: sharedTokens.spacing['3xl'],
  },
  icon: {
    fontSize: 48,
    marginBottom: sharedTokens.spacing.lg,
  },
  title: {
    fontSize: sharedTokens.typography.size.lg,
    fontWeight: sharedTokens.typography.weight.semibold,
    textAlign: 'center',
    marginBottom: sharedTokens.spacing.sm,
  },
  description: {
    fontSize: sharedTokens.typography.size.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: sharedTokens.spacing.xl,
  },
  listEmpty: {
    paddingVertical: sharedTokens.spacing['5xl'],
  },
});
