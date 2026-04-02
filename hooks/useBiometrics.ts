// hooks/useBiometrics.ts

import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Alert } from 'react-native';

export function useBiometrics() {
  const [isCompatible, setIsCompatible] = useState(false);
  const { isBiometricsEnabled, setBiometricsEnabled } = useAuthStore();

  useEffect(() => {
    checkCompatibility();
  }, []);

  const checkCompatibility = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsCompatible(compatible && enrolled);
  };

  const authenticate = useCallback(async () => {
    if (!isCompatible || !isBiometricsEnabled) return true;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock IFinance',
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }, [isCompatible, isBiometricsEnabled]);

  const toggleBiometrics = async (value: boolean) => {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm to enable Biometrics',
      });
      
      if (result.success) {
        setBiometricsEnabled(true);
        return true;
      } else {
        Alert.alert('Authentication Failed', 'Could not verify your identity.');
        return false;
      }
    } else {
      setBiometricsEnabled(false);
      return true;
    }
  };

  return {
    isCompatible,
    isBiometricsEnabled,
    authenticate,
    toggleBiometrics,
  };
}