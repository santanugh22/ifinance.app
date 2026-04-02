// components/utils/BiometricOverlay.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useBiometrics } from '@/hooks/useBiometrics';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export function BiometricOverlay() {
  const { isBiometricsEnabled, authenticate } = useBiometrics();
  const [isLocked, setIsLocked] = useState(isBiometricsEnabled);

  useEffect(() => {
    if (isBiometricsEnabled) {
      handleAuth();
    }
  }, [isBiometricsEnabled]);

  const handleAuth = async () => {
    const success = await authenticate();
    if (success) {
      setIsLocked(false);
    }
  };

  if (!isLocked) return null;

  return (
    <Modal transparent animationType="none" visible={isLocked}>
      <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill}>
        <Animated.View 
          entering={FadeIn} 
          exiting={FadeOut}
          style={styles.container}
        >
          <View style={styles.content}>
            <View style={styles.iconWrapper}>
              <Ionicons name="lock-closed" size={48} color={Colors.light.primary} />
            </View>
            <Text style={styles.title}>IFinance Locked</Text>
            <Text style={styles.subtitle}>Use Biometrics to access your financial data</Text>
            
            <TouchableOpacity style={styles.button} onPress={handleAuth}>
              <Text style={styles.buttonText}>Unlock App</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: Colors.light.surface,
    padding: 32,
    borderRadius: 32,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.light.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.base,
    fontWeight: 'bold',
  },
});
