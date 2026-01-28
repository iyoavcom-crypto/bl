import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  type ModalProps as RNModalProps,
} from 'react-native';
import { useTheme, sharedTokens } from '@/theme';

interface ModalProps extends Omit<RNModalProps, 'transparent'> {
  title?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  children: React.ReactNode;
}

export function Modal({
  visible,
  title,
  onClose,
  showCloseButton = true,
  closeOnBackdrop = true,
  children,
  ...props
}: ModalProps) {
  const { colors, shadows } = useTheme();

  const handleBackdropPress = () => {
    if (closeOnBackdrop && onClose) {
      onClose();
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...props}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.content,
                shadows.lg,
                {
                  backgroundColor: colors.surface,
                },
              ]}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <View style={[styles.header, { borderBottomColor: colors.divider }]}>
                  {title && (
                    <Text style={[styles.title, { color: colors.textPrimary }]}>
                      {title}
                    </Text>
                  )}
                  {showCloseButton && onClose && (
                    <TouchableOpacity
                      onPress={onClose}
                      style={styles.closeButton}
                      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                      <Text style={[styles.closeIcon, { color: colors.textTertiary }]}>
                        ✕
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Body */}
              <View style={styles.body}>{children}</View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

// Alert 对话框
interface AlertAction {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertProps {
  visible: boolean;
  title?: string;
  message?: string;
  actions?: AlertAction[];
  onClose?: () => void;
}

export function Alert({
  visible,
  title,
  message,
  actions = [{ text: '确定', style: 'default' }],
  onClose,
}: AlertProps) {
  const { colors } = useTheme();

  const getButtonColor = (style?: AlertAction['style']) => {
    switch (style) {
      case 'destructive':
        return colors.danger;
      case 'cancel':
        return colors.textSecondary;
      default:
        return colors.primary;
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      showCloseButton={false}
      closeOnBackdrop={false}
    >
      {title && (
        <Text style={[styles.alertTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
      )}
      {message && typeof message === 'string' && (
        <Text style={[styles.alertMessage, { color: colors.textSecondary }]}>
          {message}
        </Text>
      )}
      <View style={[styles.alertActions, { borderTopColor: colors.divider }]}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.alertButton,
              index > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.divider },
            ]}
            onPress={() => {
              action.onPress?.();
              onClose?.();
            }}
          >
            <Text
              style={[
                styles.alertButtonText,
                {
                  color: getButtonColor(action.style),
                  fontWeight: action.style === 'cancel'
                    ? sharedTokens.typography.weight.regular
                    : sharedTokens.typography.weight.semibold,
                },
              ]}
            >
              {action.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: sharedTokens.spacing['2xl'],
  },
  content: {
    width: '100%',
    maxWidth: 320,
    borderRadius: sharedTokens.radius.xl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sharedTokens.spacing.lg,
    paddingVertical: sharedTokens.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: sharedTokens.typography.size.lg,
    fontWeight: sharedTokens.typography.weight.semibold,
    flex: 1,
  },
  closeButton: {
    padding: sharedTokens.spacing.xs,
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: sharedTokens.typography.weight.bold,
  },
  body: {
    padding: sharedTokens.spacing.lg,
  },
  // Alert styles
  alertTitle: {
    fontSize: sharedTokens.typography.size.lg,
    fontWeight: sharedTokens.typography.weight.semibold,
    textAlign: 'center',
    marginBottom: sharedTokens.spacing.sm,
  },
  alertMessage: {
    fontSize: sharedTokens.typography.size.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  alertActions: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: sharedTokens.spacing.lg,
    marginHorizontal: -sharedTokens.spacing.lg,
    marginBottom: -sharedTokens.spacing.lg,
  },
  alertButton: {
    flex: 1,
    paddingVertical: sharedTokens.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertButtonText: {
    fontSize: sharedTokens.typography.size.lg,
  },
});
