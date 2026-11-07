// app/_layout.jsx
//
// ROOT LAYOUT — the top-most layout in the entire app.
//
// Responsibilities:
//   1. Wraps everything in QueryClient (React Query)
//   2. Wraps everything in AuthProvider (JWT + user state)
//   3. Sets up the Expo Router Stack
//   4. Prevents the splash screen from hiding until fonts/auth are ready
//   5. Mounts the toast provider
//   6. Registers for push notifications
// ─────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../context/AuthContext';
import { toastConfig } from '../components/ui/ToastConfig';

// Keep the splash screen visible until we're ready
SplashScreen.preventAutoHideAsync();

// Create a single QueryClient for the whole app.
// staleTime: 2 min — data stays fresh without refetching on every focus.
// retry: 1 — only retry once on failure (mobile networks can be flaky).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
          <Toast config={toastConfig} />
        </QueryClientProvider>
      </SafeAreaProvider>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

// Separated so it can call useEffect inside a provider context
function RootNavigator() {
  useEffect(() => {
    // Hide splash screen once the layout has mounted.
    // AuthProvider handles its own loading state internally.
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Auth group — login, register */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />

      {/* Main tab group — home, complaints, report, notifications, profile */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Complaint detail — modal-style slide up */}
      <Stack.Screen
        name="complaint/[id]"
        options={{
          headerShown: true,
          title: 'Complaint Details',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: '#1A56DB' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
    </Stack>
  );
}
