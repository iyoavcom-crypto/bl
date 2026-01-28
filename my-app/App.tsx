import React, { useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { ThemeProvider, useTheme } from '@/theme';
import { RootNavigator } from '@/navigation';
import { 
  useAuthStore, 
  useMessageStore, 
  useFriendStore, 
  useGroupStore, 
  useCallStore,
  useConversationStore,
  usePresenceStore
} from '@/stores';

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('==================== ERROR BOUNDARY CAUGHT ====================');
    console.error('Error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    console.error('===============================================================');
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>应用发生错误</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.name}: {this.state.error?.message}
          </Text>
          <Text style={styles.errorStack}>
            {this.state.error?.stack}
          </Text>
          <Text style={styles.errorComponent}>
            {this.state.errorInfo?.componentStack}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const { isDark, colors } = useTheme();
  const { isInitialized, isAuthenticated, initialize } = useAuthStore();
  const messageStore = useMessageStore();
  const friendStore = useFriendStore();
  const groupStore = useGroupStore();
  const callStore = useCallStore();
  const conversationStore = useConversationStore();
  const presenceStore = usePresenceStore();

  // 初始化认证状态
  useEffect(() => {
    console.log('[App] Initializing authentication...');
    try {
      initialize();
    } catch (err) {
      console.error('[App] Initialize error:', err);
    }
  }, [initialize]);

  // 认证后绑定 WebSocket 监听器
  useEffect(() => {
    console.log('[App] isAuthenticated changed:', isAuthenticated);
    if (!isAuthenticated) return;

    console.log('[App] Setting up WebSocket listeners for all stores...');
    try {
      const cleanups = [
        messageStore.setupWsListeners(),
        friendStore.setupWsListeners(),
        groupStore.setupWsListeners(),
        callStore.setupWsListeners(),
      ];

      // 检查 conversationStore 和 presenceStore 是否有 setupWsListeners
      if (conversationStore.setupWsListeners) {
        cleanups.push(conversationStore.setupWsListeners());
      }
      if (presenceStore.setupWsListeners) {
        cleanups.push(presenceStore.setupWsListeners());
      }

      console.log('[App] All WebSocket listeners set up successfully');

      return () => {
        console.log('[App] Cleaning up WebSocket listeners...');
        cleanups.forEach((cleanup) => cleanup());
      };
    } catch (err) {
      console.error('[App] Error setting up WebSocket listeners:', err);
    }
  }, [isAuthenticated, messageStore, friendStore, groupStore, callStore, conversationStore, presenceStore]);

  if (!isInitialized) {
    console.log('[App] App not initialized yet, showing loading screen');
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  console.log('[App] Rendering main app, isAuthenticated:', isAuthenticated);
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  console.log('[App] Root App component mounting');
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff0000',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  errorStack: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  errorComponent: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
});
