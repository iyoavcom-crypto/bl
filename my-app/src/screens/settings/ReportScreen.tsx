import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { api } from '@/config';

type Props = NativeStackScreenProps<RootStackParamList, 'Report'>;

type ReportType = 'user' | 'message' | 'group';
type ReportReason = 'spam' | 'harassment' | 'inappropriate' | 'fraud' | 'other';

export function ReportScreen({ route, navigation }: Props) {
  const { targetId, targetType, targetName } = route.params;
  
  const [selectedReason, setSelectedReason] = useState<ReportReason>('spam');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons: { value: ReportReason; label: string; description: string }[] = [
    { value: 'spam', label: '垃圾信息', description: '广告、营销、垃圾内容' },
    { value: 'harassment', label: '骚扰辱骂', description: '人身攻击、侮辱、骚扰' },
    { value: 'inappropriate', label: '不当内容', description: '色情、暴力、低俗内容' },
    { value: 'fraud', label: '欺诈诈骗', description: '虚假信息、诈骗行为' },
    { value: 'other', label: '其他', description: '其他违规行为' },
  ];

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('提示', '请选择举报原因');
      return;
    }

    if (selectedReason === 'other' && !description.trim()) {
      Alert.alert('提示', '请详细描述举报原因');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/api/im/reports', {
        targetId,
        targetType,
        reason: selectedReason,
        description: description.trim(),
      });

      Alert.alert('举报成功', '感谢您的反馈，我们会尽快处理', [
        { text: '确定', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('举报失败', '请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTargetTypeText = () => {
    switch (targetType) {
      case 'user':
        return '用户';
      case 'message':
        return '消息';
      case 'group':
        return '群组';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        <View style={styles.header}>
          <Ionicons name="warning" size={48} color="#FF9500" />
          <Text style={styles.headerTitle}>举报{getTargetTypeText()}</Text>
          {targetName && <Text style={styles.headerSubtitle}>{targetName}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>请选择举报原因</Text>
          {reasons.map((reason) => (
            <TouchableOpacity
              key={reason.value}
              style={[
                styles.reasonItem,
                selectedReason === reason.value && styles.reasonItemSelected,
              ]}
              onPress={() => setSelectedReason(reason.value)}
              activeOpacity={0.6}
            >
              <View style={styles.reasonContent}>
                <Text style={[
                  styles.reasonLabel,
                  selectedReason === reason.value && styles.reasonLabelSelected,
                ]}>
                  {reason.label}
                </Text>
                <Text style={styles.reasonDescription}>{reason.description}</Text>
              </View>
              <Ionicons
                name={selectedReason === reason.value ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={selectedReason === reason.value ? '#07C160' : '#C7C7CC'}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>详细说明（选填）</Text>
          <TextInput
            style={styles.textInput}
            placeholder="请详细描述违规行为..."
            placeholderTextColor="#C7C7CC"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.textCount}>{description.length}/500</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.6}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>提交举报</Text>
          )}
        </TouchableOpacity>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>举报须知</Text>
          <Text style={styles.noticeText}>• 我们会严格保护您的隐私</Text>
          <Text style={styles.noticeText}>• 被举报方不会收到任何通知</Text>
          <Text style={styles.noticeText}>• 我们会在24小时内审核处理</Text>
          <Text style={styles.noticeText}>• 恶意举报将受到处罚</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 8,
  },
  section: {
    marginBottom: 16,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 8,
  },
  reasonItemSelected: {
    borderColor: '#07C160',
    backgroundColor: '#F0FFF4',
  },
  reasonContent: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  reasonLabelSelected: {
    color: '#07C160',
  },
  reasonDescription: {
    fontSize: 13,
    color: '#8E8E93',
  },
  textInput: {
    minHeight: 100,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#000000',
  },
  textCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 8,
  },
  submitButton: {
    height: 48,
    margin: 16,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  notice: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    gap: 8,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});
