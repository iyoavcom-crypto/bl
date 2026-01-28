import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme, sharedTokens } from '@/theme';

type ToastType = 'info' | 'success' | 'warning' | 'error';
type ToastPosition = 'top' | 'center' | 'bottom';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
  onHide?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Toast({
  visible,
  message,
  type = 'info',
  duration = 2000,
  position = 'center',
  onHide,
  style,
}: ToastProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      // 显示动画
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // 自动隐藏
      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          hideToast();
        }, duration);
      }
    } else {
      opacity.setValue(0);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible, duration]);

  const hideToast = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onHide?.();
    });
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '!';
      case 'error':
        return '✕';
      default:
        return 'ℹ';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.danger;
      default:
        return colors.info;
    }
  };

  const getPositionStyle = (): ViewStyle => {
    switch (position) {
      case 'top':
        return { top: 100 };
      case 'bottom':
        return { bottom: 100 };
      default:
        return {};
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.container, getPositionStyle()]} pointerEvents="none">
      <Animated.View
        style={[
          styles.toast,
          {
            backgroundColor: colors.backgroundElevated,
            opacity,
          },
          style,
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: getIconColor() }]}>
          <Text style={styles.icon}>{getIcon()}</Text>
        </View>
        <Text style={[styles.message, { color: colors.textPrimary }]} numberOfLines={3}>
          {typeof message === 'string' ? message : ''}
        </Text>
      </Animated.View>
    </View>
  );
}

// Toast 管理器的 Hook
interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const show = React.useCallback((message: string, type: ToastType = 'info') => {
    setState({ visible: true, message, type });
  }, []);

  const hide = React.useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  const success = React.useCallback((message: string) => show(message, 'success'), [show]);
  const error = React.useCallback((message: string) => show(message, 'error'), [show]);
  const warning = React.useCallback((message: string) => show(message, 'warning'), [show]);
  const info = React.useCallback((message: string) => show(message, 'info'), [show]);

  return {
    ...state,
    show,
    hide,
    success,
    error,
    warning,
    info,
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: sharedTokens.zIndex.toast,
    top: 0,
    bottom: 0,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sharedTokens.spacing.md,
    paddingHorizontal: sharedTokens.spacing.lg,
    borderRadius: sharedTokens.radius.lg,
    maxWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sharedTokens.spacing.sm,
  },
  icon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: sharedTokens.typography.weight.bold,
  },
  message: {
    fontSize: sharedTokens.typography.size.md,
    lineHeight: 20,
    flex: 1,
  },
});
