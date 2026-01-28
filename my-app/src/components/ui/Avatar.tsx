import React from 'react';
import { View, Text, Image, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme, sharedTokens } from '@/theme';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  online?: boolean;
  showBadge?: boolean;
  badgeCount?: number;
  style?: StyleProp<ViewStyle>;
}

const sizeMap: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

const fontSizeMap: Record<AvatarSize, number> = {
  xs: 10,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

export function Avatar({
  uri,
  name = '',
  size = 'md',
  online,
  showBadge = false,
  badgeCount = 0,
  style,
}: AvatarProps) {
  const { colors } = useTheme();
  const dimension = sizeMap[size];
  const fontSize = fontSizeMap[size];

  // 获取名字的第一个字符（支持中文）
  const initial = name.charAt(0).toUpperCase() || '?';

  // 根据名字生成背景色
  const getBackgroundColor = () => {
    if (!name) return colors.backgroundTertiary;
    const colors_palette = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    ];
    const index = name.charCodeAt(0) % colors_palette.length;
    return colors_palette[index];
  };

  const badgeSize = Math.max(16, dimension * 0.35);
  const onlineSize = Math.max(8, dimension * 0.2);

  return (
    <View style={[styles.container, { width: dimension, height: dimension }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              backgroundColor: getBackgroundColor(),
            },
          ]}
        >
          <Text style={[styles.initial, { fontSize, color: colors.textInverse }]}>
            {initial}
          </Text>
        </View>
      )}

      {/* 在线状态指示器 */}
      {online !== undefined && (
        <View
          style={[
            styles.onlineIndicator,
            {
              width: onlineSize,
              height: onlineSize,
              borderRadius: onlineSize / 2,
              backgroundColor: online ? colors.online : colors.offline,
              borderColor: colors.background,
              borderWidth: 2,
              right: 0,
              bottom: 0,
            },
          ]}
        />
      )}

      {/* 角标 */}
      {showBadge && badgeCount > 0 && (
        <View
          style={[
            styles.badge,
            {
              minWidth: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: colors.danger,
              borderColor: colors.background,
              right: -2,
              top: -2,
            },
          ]}
        >
          <Text style={[styles.badgeText, { fontSize: badgeSize * 0.6 }]}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontWeight: sharedTokens.typography.weight.semibold,
  },
  onlineIndicator: {
    position: 'absolute',
  },
  badge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: sharedTokens.typography.weight.bold,
  },
});
