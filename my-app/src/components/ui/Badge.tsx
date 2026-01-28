import React from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme, sharedTokens } from '@/theme';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  count?: number;
  dot?: boolean;
  variant?: BadgeVariant;
  size?: BadgeSize;
  maxCount?: number;
  showZero?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function Badge({
  count,
  dot = false,
  variant = 'danger',
  size = 'md',
  maxCount = 99,
  showZero = false,
  style,
  children,
}: BadgeProps) {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'danger':
        return colors.danger;
      default:
        return colors.backgroundTertiary;
    }
  };

  const getTextColor = () => {
    return variant === 'default' ? colors.textSecondary : '#FFFFFF';
  };

  const badgeSize = size === 'sm' ? 16 : 18;
  const dotSize = size === 'sm' ? 6 : 8;
  const fontSize = size === 'sm' ? 10 : 12;

  const shouldShow = dot || (count !== undefined && (count > 0 || showZero));

  if (!shouldShow && !children) {
    return null;
  }

  const displayCount = count !== undefined 
    ? (count > maxCount ? `${maxCount}+` : String(count))
    : '';

  // 独立使用（无children）
  if (!children) {
    if (dot) {
      return (
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: getBackgroundColor(),
            },
            style,
          ]}
        />
      );
    }

    return (
      <View
        style={[
          styles.badge,
          {
            minWidth: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: getBackgroundColor(),
            paddingHorizontal: (displayCount?.length ?? 0) > 1 ? 6 : 0,
          },
          style,
        ]}
      >
        <Text style={[styles.text, { fontSize, color: getTextColor() }]}>
          {displayCount}
        </Text>
      </View>
    );
  }

  // 作为包裹容器使用
  return (
    <View style={[styles.container, style]}>
      {children}
      {shouldShow && (
        dot ? (
          <View
            style={[
              styles.dot,
              styles.positioned,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: getBackgroundColor(),
              },
            ]}
          />
        ) : (
          <View
            style={[
              styles.badge,
              styles.positioned,
              {
                minWidth: badgeSize,
                height: badgeSize,
                borderRadius: badgeSize / 2,
                backgroundColor: getBackgroundColor(),
                paddingHorizontal: (displayCount?.length ?? 0) > 1 ? 6 : 0,
              },
            ]}
          >
            <Text style={[styles.text, { fontSize, color: getTextColor() }]}>
              {displayCount}
            </Text>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {},
  positioned: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  text: {
    fontWeight: sharedTokens.typography.weight.bold,
    textAlign: 'center',
  },
});
