import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme, sharedTokens } from '@/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  secureTextEntry?: boolean;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  secureTextEntry,
  editable = true,
  ...props
}: InputProps) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const getBorderColor = () => {
    if (error) return colors.danger;
    if (isFocused) return colors.inputFocusBorder;
    return colors.inputBorder;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textPrimary }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: editable ? colors.inputBackground : colors.backgroundTertiary,
            borderColor: getBorderColor(),
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          {...props}
          editable={editable}
          secureTextEntry={isSecure}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor={colors.placeholder}
          style={[
            styles.input,
            {
              color: editable ? colors.textPrimary : colors.textDisabled,
            },
            inputStyle,
          ]}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            style={styles.rightIcon}
          >
            <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
              {isSecure ? '显示' : '隐藏'}
            </Text>
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>
      {error && typeof error === 'string' && (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      )}
      {hint && !error && (
        <Text style={[styles.hint, { color: colors.textTertiary }]}>{hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: sharedTokens.spacing.lg,
  },
  label: {
    fontSize: sharedTokens.typography.size.sm,
    fontWeight: sharedTokens.typography.weight.medium,
    marginBottom: sharedTokens.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: sharedTokens.radius.sm,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: sharedTokens.typography.size.md,
    paddingHorizontal: sharedTokens.spacing.md,
    paddingVertical: sharedTokens.spacing.sm,
  },
  leftIcon: {
    paddingLeft: sharedTokens.spacing.md,
  },
  rightIcon: {
    paddingRight: sharedTokens.spacing.md,
  },
  error: {
    fontSize: sharedTokens.typography.size.xs,
    marginTop: sharedTokens.spacing.xs,
  },
  hint: {
    fontSize: sharedTokens.typography.size.xs,
    marginTop: sharedTokens.spacing.xs,
  },
  toggleText: {
    fontSize: sharedTokens.typography.size.sm,
  },
});
