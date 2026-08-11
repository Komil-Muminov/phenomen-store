import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { AuthProvider } from '@/shared/auth';
import { StaffAuthProvider } from '@/shared/staff-auth';
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
          <StaffAuthProvider>
            <AppShell>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  contentStyle: { backgroundColor: '#fafafa' },
                }}
              >
                <Stack.Screen name="index" options={{ animation: 'none' }} />
                <Stack.Screen name="catalog" options={{ animation: 'none' }} />
                <Stack.Screen name="cart" options={{ animation: 'none' }} />
                <Stack.Screen name="wishlist" options={{ animation: 'none' }} />
                <Stack.Screen name="profile" options={{ animation: 'none' }} />
              </Stack>
            </AppShell>
          </StaffAuthProvider>
        </AuthProvider>
        <StatusBar style="dark" />
      </QueryClientProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default RootLayout;
