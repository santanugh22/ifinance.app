// hooks/useBiometrics.ts

import { useAuthStore } from "@/store/useAuthStore";
import * as LocalAuthentication from "expo-local-authentication";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export function useBiometrics() {
  const [isCompatible, setIsCompatible] = useState(false);
  const [biometricTypeLabel, setBiometricTypeLabel] = useState("Biometrics");
  const { isBiometricsEnabled, setBiometricsEnabled } = useAuthStore();

  useEffect(() => {
    checkCompatibility();
  }, []);

  const checkCompatibility = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();

    const supportedTypes =
      await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (
      supportedTypes.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      )
    ) {
      setBiometricTypeLabel("Face ID");
    } else if (
      supportedTypes.includes(
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      )
    ) {
      setBiometricTypeLabel("Fingerprint");
    } else {
      setBiometricTypeLabel("Biometrics");
    }

    setIsCompatible(compatible && enrolled);
  };

  const authenticateForAction = useCallback(
    async (promptMessage: string = "Authenticate") => {
      if (!isCompatible) return false;

      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage,
          fallbackLabel: "Use Passcode",
          disableDeviceFallback: false,
          cancelLabel: "Cancel",
        });

        return result.success;
      } catch (error) {
        console.error("Biometric authentication failed:", error);
        return false;
      }
    },
    [isCompatible],
  );

  const authenticate = useCallback(async () => {
    if (!isCompatible || !isBiometricsEnabled) return true;

    return authenticateForAction("Unlock IFinance");
  }, [isCompatible, isBiometricsEnabled, authenticateForAction]);

  const toggleBiometrics = async (value: boolean) => {
    if (value) {
      const success = await authenticateForAction(
        `Confirm to enable ${biometricTypeLabel}`,
      );

      if (success) {
        setBiometricsEnabled(true);
        return true;
      } else {
        Alert.alert("Authentication Failed", "Could not verify your identity.");
        return false;
      }
    } else {
      setBiometricsEnabled(false);
      return true;
    }
  };

  return {
    isCompatible,
    biometricTypeLabel,
    isBiometricsEnabled,
    authenticate,
    authenticateForAction,
    toggleBiometrics,
  };
}
