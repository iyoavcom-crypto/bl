import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme, sharedTokens } from '@/theme';

type InputMode = 'text' | 'voice' | 'emoji' | 'more';

interface InputBarProps {
  onSend: (text: string) => void;
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
  onVoiceCancel?: () => void;
  onImagePick?: () => void;
  onCameraPick?: () => void;
  placeholder?: string;
  disabled?: boolean;
  showVoice?: boolean;
  showMore?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function InputBar({
  onSend,
  onVoiceStart,
  onVoiceEnd,
  onVoiceCancel,
  onImagePick,
  onCameraPick,
  placeholder = '输入消息...',
  disabled = false,
  showVoice = true,
  showMore = true,
  style,
}: InputBarProps) {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [mode, setMode] = useState<InputMode>('text');
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (trimmed) {
      onSend(trimmed);
      setText('');
    }
  };

  const toggleVoice = () => {
    if (mode === 'voice') {
      setMode('text');
      inputRef.current?.focus();
    } else {
      setMode('voice');
      Keyboard.dismiss();
    }
  };

  const toggleMore = () => {
    if (mode === 'more') {
      setMode('text');
    } else {
      setMode('more');
      Keyboard.dismiss();
    }
  };

  const handleVoicePressIn = () => {
    setIsRecording(true);
    onVoiceStart?.();
  };

  const handleVoicePressOut = () => {
    setIsRecording(false);
    onVoiceEnd?.();
  };

  const canSend = text.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.divider }, style]}>
      {/* 主输入区域 */}
      <View style={styles.inputRow}>
        {/* 语音切换按钮 */}
        {showVoice && (
          <TouchableOpacity
            onPress={toggleVoice}
            style={styles.iconButton}
            disabled={disabled}
          >
            <Text style={[styles.icon, { color: colors.textSecondary }]}>
              {mode === 'voice' ? '⌨️' : '🎤'}
            </Text>
          </TouchableOpacity>
        )}

        {/* 输入框或语音按钮 */}
        <View style={styles.inputWrapper}>
          {mode === 'voice' ? (
            <TouchableOpacity
              style={[
                styles.voiceButton,
                {
                  backgroundColor: isRecording ? colors.primaryLight : colors.inputBackground,
                  borderColor: colors.inputBorder,
                },
              ]}
              onPressIn={handleVoicePressIn}
              onPressOut={handleVoicePressOut}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Text style={[styles.voiceButtonText, { color: colors.textPrimary }]}>
                {isRecording ? '松开 发送' : '按住 说话'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.textPrimary,
                },
              ]}
              value={text}
              onChangeText={setText}
              placeholder={placeholder}
              placeholderTextColor={colors.placeholder}
              multiline
              maxLength={2000}
              editable={!disabled}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
          )}
        </View>

        {/* 发送按钮或更多按钮 */}
        {canSend ? (
          <TouchableOpacity
            onPress={handleSend}
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            disabled={disabled}
          >
            <Text style={styles.sendButtonText}>发送</Text>
          </TouchableOpacity>
        ) : (
          showMore && (
            <TouchableOpacity
              onPress={toggleMore}
              style={styles.iconButton}
              disabled={disabled}
            >
              <Text style={[styles.icon, { color: colors.textSecondary }]}>
                {mode === 'more' ? '✕' : '＋'}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* 更多功能面板 */}
      {mode === 'more' && (
        <View style={[styles.morePanel, { backgroundColor: colors.backgroundSecondary }]}>
          <TouchableOpacity
            style={styles.moreItem}
            onPress={onImagePick}
          >
            <View style={[styles.moreIcon, { backgroundColor: colors.surface }]}>
              <Text style={styles.moreIconText}>🖼️</Text>
            </View>
            <Text style={[styles.moreLabel, { color: colors.textSecondary }]}>相册</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.moreItem}
            onPress={onCameraPick}
          >
            <View style={[styles.moreIcon, { backgroundColor: colors.surface }]}>
              <Text style={styles.moreIconText}>📷</Text>
            </View>
            <Text style={[styles.moreLabel, { color: colors.textSecondary }]}>拍摄</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: sharedTokens.spacing.sm,
    paddingVertical: sharedTokens.spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: sharedTokens.spacing.xs,
  },
  input: {
    minHeight: 36,
    maxHeight: 100,
    paddingHorizontal: sharedTokens.spacing.md,
    paddingVertical: sharedTokens.spacing.sm,
    borderRadius: sharedTokens.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: sharedTokens.typography.size.md,
  },
  voiceButton: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: sharedTokens.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  voiceButtonText: {
    fontSize: sharedTokens.typography.size.md,
    fontWeight: sharedTokens.typography.weight.medium,
  },
  sendButton: {
    height: 36,
    paddingHorizontal: sharedTokens.spacing.md,
    borderRadius: sharedTokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: sharedTokens.typography.size.md,
    fontWeight: sharedTokens.typography.weight.semibold,
  },
  morePanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: sharedTokens.spacing.lg,
    paddingVertical: sharedTokens.spacing.xl,
  },
  moreItem: {
    width: 64,
    alignItems: 'center',
    marginRight: sharedTokens.spacing.xl,
    marginBottom: sharedTokens.spacing.lg,
  },
  moreIcon: {
    width: 56,
    height: 56,
    borderRadius: sharedTokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sharedTokens.spacing.xs,
  },
  moreIconText: {
    fontSize: 28,
  },
  moreLabel: {
    fontSize: sharedTokens.typography.size.xs,
  },
});
