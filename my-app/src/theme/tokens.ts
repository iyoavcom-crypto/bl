// 浅色主题
export const lightTheme = {
  mode: 'light' as const,
  
  colors: {
    // 品牌色 - 克制的蓝色
    primary: '#007AFF',
    primaryPressed: '#0056B3',
    primaryDisabled: '#B4D5FF',
    
    // 语义色
    success: '#30B94E',
    warning: '#F5A623',
    danger: '#E53935',
    info: '#2196F3',
    
    // 文字层级
    textPrimary: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textDisabled: '#CCCCCC',
    textInverse: '#FFFFFF',
    textLink: '#007AFF',
    
    // 背景层级
    background: '#FFFFFF',
    backgroundSecondary: '#F7F7F7',
    backgroundTertiary: '#F2F2F2',
    backgroundElevated: '#FFFFFF',
    
    // 表面色
    surface: '#FFFFFF',
    surfaceHover: '#F5F5F5',
    surfacePressed: '#EBEBEB',
    
    // 边框与分隔
    border: '#E5E5E5',
    borderLight: '#F0F0F0',
    divider: '#EEEEEE',
    
    // 消息气泡
    bubbleMine: '#007AFF',
    bubbleMineText: '#FFFFFF',
    bubbleOther: '#F0F0F0',
    bubbleOtherText: '#1A1A1A',
    bubbleReceived: '#F0F0F0',
    
    // 品牌色变体
    primaryLight: '#E5F1FF',
    
    // 状态指示
    online: '#30B94E',
    offline: '#CCCCCC',
    busy: '#F5A623',
    
    // 输入框
    inputBackground: '#F7F7F7',
    inputBorder: '#E5E5E5',
    inputFocusBorder: '#007AFF',
    placeholder: '#AAAAAA',
    
    // 导航栏
    navBar: '#FFFFFF',
    navBarBorder: '#E5E5E5',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E5E5E5',
    tabBarActive: '#007AFF',
    tabBarInactive: '#999999',
    
    // 卡片和分组
    card: '#FFFFFF',
    separator: '#E5E5E5',
    groupedBackground: '#F2F2F7',
    
    // 遮罩
    overlay: 'rgba(0, 0, 0, 0.4)',
    overlayLight: 'rgba(0, 0, 0, 0.1)',
  },
  
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

// 深色主题
export const darkTheme = {
  mode: 'dark' as const,
  
  colors: {
    // 品牌色 - 深色模式略微提亮
    primary: '#0A84FF',
    primaryPressed: '#409CFF',
    primaryDisabled: '#1A4B7C',
    
    // 语义色
    success: '#32D74B',
    warning: '#FFD60A',
    danger: '#FF453A',
    info: '#64D2FF',
    
    // 文字层级
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textTertiary: '#6C6C6C',
    textDisabled: '#4A4A4A',
    textInverse: '#1A1A1A',
    textLink: '#0A84FF',
    
    // 背景层级 - 纯黑背景
    background: '#000000',
    backgroundSecondary: '#1C1C1E',
    backgroundTertiary: '#2C2C2E',
    backgroundElevated: '#1C1C1E',
    
    // 表面色
    surface: '#1C1C1E',
    surfaceHover: '#2C2C2E',
    surfacePressed: '#3A3A3C',
    
    // 边框与分隔
    border: '#3A3A3C',
    borderLight: '#2C2C2E',
    divider: '#3A3A3C',
    
    // 消息气泡
    bubbleMine: '#0A84FF',
    bubbleMineText: '#FFFFFF',
    bubbleOther: '#2C2C2E',
    bubbleOtherText: '#FFFFFF',
    bubbleReceived: '#2C2C2E',
    
    // 品牌色变体
    primaryLight: '#1A3A5C',
    
    // 状态指示
    online: '#32D74B',
    offline: '#6C6C6C',
    busy: '#FFD60A',
    
    // 输入框
    inputBackground: '#1C1C1E',
    inputBorder: '#3A3A3C',
    inputFocusBorder: '#0A84FF',
    placeholder: '#6C6C6C',
    
    // 导航栏
    navBar: '#1C1C1E',
    navBarBorder: '#3A3A3C',
    tabBar: '#1C1C1E',
    tabBarBorder: '#3A3A3C',
    tabBarActive: '#0A84FF',
    tabBarInactive: '#6C6C6C',
    
    // 卡片和分组
    card: '#1C1C1E',
    separator: '#3A3A3C',
    groupedBackground: '#000000',
    
    // 遮罩
    overlay: 'rgba(0, 0, 0, 0.6)',
    overlayLight: 'rgba(255, 255, 255, 0.05)',
  },
  
  shadows: {
    none: lightTheme.shadows.none,
    sm: { ...lightTheme.shadows.sm, shadowOpacity: 0.3 },
    md: { ...lightTheme.shadows.md, shadowOpacity: 0.4 },
    lg: { ...lightTheme.shadows.lg, shadowOpacity: 0.5 },
    xl: { ...lightTheme.shadows.xl, shadowOpacity: 0.6 },
  },
};

// 不随主题变化的共享令牌
export const sharedTokens = {
  // 间距系统 - 8px 基准
  spacing: {
    none: 0,
    '2xs': 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
  },
  
  // 圆角系统
  radius: {
    none: 0,
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
  },
  
  // 字体系统
  typography: {
    size: {
      '2xs': 10,
      xs: 11,
      sm: 13,
      md: 15,
      lg: 17,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 34,
    },
    weight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
    // iOS 预设样式
    largeTitle: { fontSize: 34, fontWeight: '700' as const },
    title1: { fontSize: 28, fontWeight: '700' as const },
    title2: { fontSize: 22, fontWeight: '700' as const },
    title3: { fontSize: 20, fontWeight: '600' as const },
    headline: { fontSize: 17, fontWeight: '600' as const },
    body: { fontSize: 17, fontWeight: '400' as const },
    callout: { fontSize: 16, fontWeight: '400' as const },
    subhead: { fontSize: 15, fontWeight: '400' as const },
    footnote: { fontSize: 13, fontWeight: '400' as const },
    caption1: { fontSize: 12, fontWeight: '400' as const },
    caption2: { fontSize: 11, fontWeight: '400' as const },
  },
  
  // 动画时长
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
  },
  
  // Z 轴层级
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    modal: 300,
    toast: 400,
    tooltip: 500,
  },
};

export type Theme = typeof lightTheme | typeof darkTheme;
export type ThemeColors = typeof lightTheme.colors;
export type ThemeShadows = typeof lightTheme.shadows;
export type ThemeMode = 'light' | 'dark' | 'system';
