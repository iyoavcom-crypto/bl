---
trigger: glob
globs: "**/theme/**/*, **/ThemeContext*, **/tokens*"
description: 双主题系统规范
---

# 主题系统规范

## 架构

```
ThemeProvider → ThemeContext → useTheme() → 组件消费
```

## 主题模式

- `'light'` - 始终浅色
- `'dark'` - 始终深色
- `'system'` - 跟随系统 (默认)

## 颜色令牌

### 品牌色
```typescript
primary: '#007AFF'        // 浅色
primary: '#0A84FF'        // 深色
```

**使用克制**: 仅用于主按钮、选中状态、链接

### 文字层级
```typescript
textPrimary    // 主文字
textSecondary  // 次要文字
textTertiary   // 辅助文字
textDisabled   // 禁用文字
textInverse    // 反色文字
textLink       // 链接文字
```

### 背景层级
```typescript
background          // 主背景
backgroundSecondary // 次级背景
backgroundTertiary  // 第三层背景
backgroundElevated  // 抬升背景
```

### 消息气泡
```typescript
bubbleMine      // 我的消息背景
bubbleMineText  // 我的消息文字
bubbleOther     // 对方消息背景
bubbleOtherText // 对方消息文字
```

## 间距系统 (8px 基准)

| Token | 值 | 用途 |
|-------|-----|------|
| xs | 4 | 图标与文字间距 |
| sm | 8 | 紧凑间距 |
| md | 12 | 标准间距 |
| lg | 16 | 屏幕边距 |
| xl | 20 | 分组间距 |
| 2xl | 24 | 大分组间距 |

## 圆角规范

| Token | 值 | 用途 |
|-------|-----|------|
| sm | 6 | 输入框 |
| md | 8 | 按钮、卡片 |
| lg | 12 | 大卡片 |
| xl | 16 | 底部 Sheet |
| full | 9999 | 圆形 |

## 字号层级

| Token | 值 | 用途 |
|-------|-----|------|
| xs | 11 | 小标签、时间 |
| sm | 13 | 次要信息 |
| md | 15 | 正文 (默认) |
| lg | 17 | 标题、列表项 |
| xl | 20 | 页面标题 |

## 使用方式

```typescript
import { useTheme } from '@/theme/ThemeContext';

function Component() {
  const { colors, spacing, typography, isDark, setMode } = useTheme();
  
  return (
    <View style={{ 
      backgroundColor: colors.background,
      padding: spacing.lg,
    }}>
      <Text style={{ 
        color: colors.textPrimary,
        fontSize: typography.size.lg,
      }}>
        内容
      </Text>
    </View>
  );
}
```

## 禁止事项

- ❌ 禁止硬编码颜色值
- ❌ 禁止硬编码间距值
- ❌ 禁止直接使用 `useColorScheme()`，使用 `useTheme().isDark`
