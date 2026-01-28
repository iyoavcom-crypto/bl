// 布局常量
export const layout = {
  screen: {
    paddingHorizontal: 16,
  },
  
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  
  listItem: {
    height: 56,
    heightCompact: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  form: {
    inputHeight: 48,
    inputSpacing: 16,
    labelSpacing: 8,
    sectionSpacing: 24,
  },
  
  button: {
    heightLarge: 52,
    heightMedium: 44,
    heightSmall: 36,
    minWidth: 80,
    iconSpacing: 8,
  },
  
  avatar: {
    xs: 24,
    sm: 32,
    md: 44,
    lg: 64,
    xl: 88,
  },
  
  chat: {
    bubbleMaxWidth: '75%' as const,
    bubblePaddingH: 12,
    bubblePaddingV: 8,
    bubbleRadius: 18,
    bubbleRadiusCorner: 4,
    messageSpacing: 2,
    groupSpacing: 16,
    avatarSize: 36,
    inputMinHeight: 36,
    inputMaxHeight: 120,
  },
  
  nav: {
    headerHeight: 44,
    tabBarHeight: 49 + 34, // 49 + safe area
    backButtonSize: 44,
  },
};
