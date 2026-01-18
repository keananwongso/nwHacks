// Root layout - handles auth state and routing
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../src/hooks/useAuth';

export default function RootLayout() {
  const { user, loading, profile } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Not signed in, redirect to login
      router.replace('/(auth)/login');
    } else if (user && !profile && (segments as string[])[1] !== 'username-setup') {
      // Signed in but no profile, go to login first (as requested)
      // The user can then proceed to setup from there or be prompted
      router.replace('/(auth)/login');
    } else if (user && profile && inAuthGroup) {
      // Fully set up, go to main app
      router.replace('/(tabs)');
    }
  }, [user, profile, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Slot />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
});
