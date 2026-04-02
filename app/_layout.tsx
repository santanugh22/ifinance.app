// app/_layout.tsx

import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useAuthStore } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useNotifications } from '@/hooks/useNotifications';
import { BiometricOverlay } from '@/components/utils/BiometricOverlay';
import { ErrorBoundary } from '@/components/utils/ErrorBoundary';

export default function RootLayout() {
  const { setUser, isLoading } = useAuthStore();
  const fetchFinanceData = useFinanceStore((state) => state.fetchFinanceData);
  const segments = useSegments();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  
  // Initialize notification permissions and schedules
  useNotifications();

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((firebaseUser: FirebaseAuthTypes.User | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          biometricsEnabled: useAuthStore.getState().isBiometricsEnabled,
        });
        
        // Start syncing finance data
        return fetchFinanceData(firebaseUser.uid);
      } else {
        setUser(null);
      }
    });
    return subscriber; // Unsubscribe on unmount
  }, [setUser, fetchFinanceData]);

  // Route Guarding Logic
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="auto" />
        <BiometricOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="modal/add-transaction" 
            options={{ presentation: 'modal' }} 
          />
          <Stack.Screen 
            name="modal/add-goal" 
            options={{ presentation: 'modal' }} 
          />
          <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
        </Stack>
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
    backgroundColor: Colors.light.background,
  },
});