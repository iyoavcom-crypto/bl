import { format, formatDistanceToNow, isToday, isYesterday, isThisYear, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 格式化消息时间
 * - 今天: HH:mm
 * - 昨天: 昨天 HH:mm
 * - 今年: MM-dd HH:mm
 * - 往年: yyyy-MM-dd
 */
export function formatMessageTime(dateStr: string): string {
  const date = parseISO(dateStr);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  }
  
  if (isYesterday(date)) {
    return `昨天 ${format(date, 'HH:mm')}`;
  }
  
  if (isThisYear(date)) {
    return format(date, 'MM-dd HH:mm');
  }
  
  return format(date, 'yyyy-MM-dd');
}

/**
 * 格式化会话列表时间
 * - 今天: HH:mm
 * - 昨天: 昨天
 * - 本周: 周x
 * - 今年: MM/dd
 * - 往年: yyyy/MM/dd
 */
export function formatConversationTime(dateStr: string | null): string {
  if (!dateStr) return '';
  
  const date = parseISO(dateStr);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  }
  
  if (isYesterday(date)) {
    return '昨天';
  }
  
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) {
    return format(date, 'EEEE', { locale: zhCN });
  }
  
  if (isThisYear(date)) {
    return format(date, 'MM/dd');
  }
  
  return format(date, 'yyyy/MM/dd');
}

/**
 * 格式化相对时间 (xx分钟前)
 */
export function formatRelativeTime(dateStr: string): string {
  const date = parseISO(dateStr);
  return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
}

/**
 * 格式化通话时长
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * 截断文本
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

// 别名
export const truncateText = truncate;

/**
 * 格式化手机号 (138****8888)
 */
export function maskPhone(phone: string): string {
  if (phone.length !== 11) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
}
