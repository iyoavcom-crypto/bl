import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, sharedTokens, Theme, ThemeMode, ThemeColors, ThemeShadows } from './tokens';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
  shadows: ThemeShadows;
  spacing: typeof sharedTokens.spacing;
  radius: typeof sharedTokens.radius;
  typography: typeof sharedTokens.typography;
  duration: typeof sharedTokens.duration;
  zIndex: typeof sharedTokens.zIndex;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
  }, []);

  const value = useMemo(() => {
    // 根据模式决定使用哪个主题
    let isDark = false;
    if (mode === 'system') {
      isDark = systemColorScheme === 'dark';
    } else {
      isDark = mode === 'dark';
    }
    
    const theme = isDark ? darkTheme : lightTheme;
    
    return {
      theme,
      mode,
      isDark,
      setMode,
      colors: theme.colors,
      shadows: theme.shadows,
      ...sharedTokens,
    };
  }, [mode, systemColorScheme, setMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
