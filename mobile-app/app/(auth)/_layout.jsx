// app/(auth)/_layout.jsx
//
// Auth group layout.
// Redirects already-authenticated users away from login/register.

import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show spinner while checking stored token
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // If already logged in, go straight to the dashboard
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
