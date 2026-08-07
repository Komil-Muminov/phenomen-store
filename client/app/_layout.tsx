import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { AuthProvider } from '@/shared/auth';
import { AppShell } from '@/widgets/app-shell';
import '../global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const RootLayout = () => (
  <GestureHandlerRootView className="flex-1">
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppShell>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'none',
                animationDuration: 0,
                contentStyle: { backgroundColor: '#ffffff' },
              }}
            />
          </AppShell>
        </AuthProvider>
        <StatusBar style="dark" />
      </QueryClientProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default RootLayout;
