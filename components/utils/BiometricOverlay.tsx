// components/utils/BiometricOverlay.tsx

import { Colors } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { useBiometrics } from "@/hooks/useBiometrics";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export function BiometricOverlay() {
  const user = useAuthStore((state) => state.user);
  const setBiometricsEnabled = useAuthStore(
    (state) => state.setBiometricsEnabled,
  );
  const {
    isBiometricsEnabled,
    authenticate,
    isCompatibilityChecked,
    isCompatible,
  } = useBiometrics();
  const shouldRequireLock = isBiometricsEnabled && Boolean(user);
  const [isLocked, setIsLocked] = useState(shouldRequireLock);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const hasInitializedLockState = useRef(false);
  const isAuthenticatingRef = useRef(false);
  const hasAttemptedAutoUnlockRef = useRef(false);

  useEffect(() => {
    if (!shouldRequireLock) {
      setIsLocked(false);
      return;
    }

    // Lock on cold start only; avoid forcing an immediate re-lock
    // when biometrics are enabled during an active session.
    if (!hasInitializedLockState.current) {
      setIsLocked(true);
      hasInitializedLockState.current = true;
      return;
    }

    setIsLocked(false);
  }, [shouldRequireLock]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const wasReturningToForeground =
        /inactive|background/.test(appState.current) && nextState === "active";

      if (
        wasReturningToForeground &&
        shouldRequireLock &&
        !isAuthenticatingRef.current
      ) {
        setIsLocked(true);
      }

      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [shouldRequireLock]);

  useEffect(() => {
    if (!isLocked || !shouldRequireLock) {
      hasAttemptedAutoUnlockRef.current = false;
      return;
    }
    if (!isCompatibilityChecked || !isCompatible) return;
    if (hasAttemptedAutoUnlockRef.current || isAuthenticatingRef.current) {
      return;
    }

    hasAttemptedAutoUnlockRef.current = true;
    void handleAuth();
  }, [isLocked, shouldRequireLock, isCompatibilityChecked, isCompatible]);

  useEffect(() => {
    if (!shouldRequireLock) return;
    if (!isCompatibilityChecked || isCompatible) return;

    setBiometricsEnabled(false);
    setIsLocked(false);
    Alert.alert(
      "Biometrics Unavailable",
      "Biometric app lock was turned off because no enrolled biometrics are available on this device.",
    );
  }, [
    shouldRequireLock,
    isCompatibilityChecked,
    isCompatible,
    setBiometricsEnabled,
  ]);

  const handleAuth = async () => {
    if (isAuthenticatingRef.current) return;

    isAuthenticatingRef.current = true;
    try {
      const success = await authenticate();
      if (success) {
        setIsLocked(false);
      }
    } finally {
      isAuthenticatingRef.current = false;
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
              <Ionicons
                name="lock-closed"
                size={48}
                color={Colors.light.primary}
              />
            </View>
            <Text style={styles.title}>IFinance Locked</Text>
            <Text style={styles.subtitle}>
              Use Biometrics to access your financial data
            </Text>

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
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: Colors.light.surface,
    padding: 32,
    borderRadius: 32,
    alignItems: "center",
    width: "80%",
    shadowColor: "#000",
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: Typography.sizes.base,
    fontWeight: "bold",
  },
});
