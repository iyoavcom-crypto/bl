import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme, sharedTokens } from '@/theme';

type LoadingSize = 'small' | 'large';

interface LoadingProps {
  visible?: boolean;
  size?: LoadingSize;
  text?: string;
  overlay?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Loading({
  visible = true,
  size = 'large',
  text,
  overlay = false,
  style,
}: LoadingProps) {
  const { colors } = useTheme();

  if (!visible) {
    return null;
  }

  const content = (
    <View
      style={[
        styles.container,
        overlay && styles.overlayContainer,
        overlay && { backgroundColor: colors.overlay },
        style,
      ]}
    >
      <View
        style={[
          styles.content,
          overlay && styles.overlayContent,
          overlay && { backgroundColor: colors.backgroundElevated },
        ]}
      >
        <ActivityIndicator
          size={size}
          color={colors.primary}
        />
        {text && (
          <Text style={[styles.text, { color: colors.textSecondary }]}>
            {text}
          </Text>
        )}
      </View>
    </View>
  );

  if (overlay) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        {content}
      </Modal>
    );
  }

  return content;
}

// 内联加载指示器
interface InlineLoadingProps {
  size?: LoadingSize;
  color?: string;
}

export function InlineLoading({ size = 'small', color }: InlineLoadingProps) {
  const { colors } = useTheme();
  return <ActivityIndicator size={size} color={color || colors.primary} />;
}

// 骨架屏组件
interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({
  width = 100,
  height = 16,
  borderRadius = sharedTokens.radius.sm,
  style,
}: SkeletonProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.backgroundTertiary,
        },
        style,
      ]}
    />
  );
}

// 页面加载状态
interface PageLoadingProps {
  text?: string;
}

export function PageLoading({ text = '加载中...' }: PageLoadingProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.pageLoading, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.pageLoadingText, { color: colors.textSecondary }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContainer: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: sharedTokens.spacing.lg,
  },
  overlayContent: {
    borderRadius: sharedTokens.radius.lg,
    minWidth: 100,
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  text: {
    marginTop: sharedTokens.spacing.md,
    fontSize: sharedTokens.typography.size.md,
  },
  skeleton: {
    overflow: 'hidden',
  },
  pageLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageLoadingText: {
    marginTop: sharedTokens.spacing.md,
    fontSize: sharedTokens.typography.size.md,
  },
});
