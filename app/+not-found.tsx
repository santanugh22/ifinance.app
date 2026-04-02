// app/+not-found.tsx

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors } from '@/constants/Colors';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <EmptyState
          iconName="alert-circle-outline"
          title="Screen Not Found"
          subtitle="We couldn't find the page you were looking for. It might have been moved or deleted."
          actionLabel="Go to Home"
          onAction={() => router.replace('/(tabs)')}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});