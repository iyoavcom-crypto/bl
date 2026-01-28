import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type TouchableOpacityProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTheme, sharedTokens } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();

  const isDisabled = disabled || loading;

  const getBackgroundColor = () => {
    if (isDisabled) {
      return variant === 'outline' || variant === 'ghost'
        ? 'transparent'
        : colors.primaryDisabled;
    }
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.backgroundSecondary;
      case 'outline':
      case 'ghost':
        return 'transparent';
      case 'danger':
        return colors.danger;
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (isDisabled) {
      return colors.textDisabled;
    }
    switch (variant) {
      case 'primary':
      case 'danger':
        return colors.textInverse;
      case 'secondary':
        return colors.textPrimary;
      case 'outline':
        return colors.primary;
      case 'ghost':
        return colors.textPrimary;
      default:
        return colors.textInverse;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return isDisabled ? colors.borderLight : colors.primary;
    }
    return 'transparent';
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: sharedTokens.spacing.sm,
          paddingHorizontal: sharedTokens.spacing.md,
        };
      case 'lg':
        return {
          paddingVertical: sharedTokens.spacing.lg,
          paddingHorizontal: sharedTokens.spacing['2xl'],
        };
      default:
        return {
          paddingVertical: sharedTokens.spacing.md,
          paddingHorizontal: sharedTokens.spacing.xl,
        };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return sharedTokens.typography.size.sm;
      case 'lg':
        return sharedTokens.typography.size.lg;
      default:
        return sharedTokens.typography.size.md;
    }
  };

  return (
    <TouchableOpacity
      {...props}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        getSizeStyles(),
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: getFontSize(),
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: sharedTokens.radius.md,
    minHeight: 44,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: sharedTokens.typography.weight.semibold,
    textAlign: 'center',
  },
});
