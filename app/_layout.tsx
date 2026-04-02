// app/_layout.tsx
import { BiometricOverlay } from "@/components/utils/BiometricOverlay";
import { ErrorBoundary } from "@/components/utils/ErrorBoundary";
import { useNotifications } from "@/hooks/useNotifications";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAuthStore } from "@/store/useAuthStore";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
} from "@react-native-firebase/auth";
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// ─── Separate loading overlay so it never re-renders the Stack ──────────────
// This is a key architectural fix: the Stack and its screens must live in a
// component that does NOT re-render when isLoading changes. We achieve this by
// splitting the overlay into its own component so only it re-renders.
function LoadingOverlay() {
  const isFinanceHydrated = useFinanceStore((s) => s.isHydrated);
  const isSettingsHydrated = useSettingsStore((s) => s.isHydrated);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const colors = useThemeColor();

  const isLoading = isAuthLoading || !isFinanceHydrated || !isSettingsHydrated;
  if (!isLoading) return null;

  return (
    <View
      style={[styles.loadingOverlay, { backgroundColor: colors.background }]}
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

// ─── Separate StatusBar component so isDarkMode changes don't re-render
// RootLayout. Calling useSettingsStore.getState() directly during render of
// the parent causes subtle subscription issues and unnecessary re-renders.
function AppStatusBar() {
  const isDarkMode = useSettingsStore((s) => s.isDarkMode);
  return <StatusBar style={isDarkMode ? "light" : "dark"} />;
}

export default function RootLayout() {
  // ── Only subscribe to values that should affect routing logic ──────────────
  // We deliberately do NOT subscribe to isHydrated or isLoading here so that
  // hydration completing does not re-render RootLayout and remount the Stack.
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const setUser = useAuthStore((s) => s.setUser);

  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const colors = useThemeColor();

  // Read hydration state without subscribing — we only need it as a gate
  // inside the routing effect, not as a render trigger.
  const getIsFullyReady = () =>
    useFinanceStore.getState().isHydrated &&
    useSettingsStore.getState().isHydrated;

  useNotifications();

  // ── Firebase Auth listener ─────────────────────────────────────────────────
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: FirebaseAuthTypes.User | null) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            biometricsEnabled: useAuthStore.getState().isBiometricsEnabled,
          });
        } else {
          setUser(null);
        }
      },
    );
    return unsubscribe;
  }, []);

  // ── Route guarding ────────────────────────────────────────────────────────
  // We wait for auth AND both stores to be ready before redirecting.
  // Using getState() snapshots inside the effect means this effect only
  // re-runs when user/isAuthLoading/segments actually change — not on every
  // hydration tick.
  useEffect(() => {
    if (!rootNavigationState?.key) return;
    if (isAuthLoading) return;
    if (!getIsFullyReady()) return;

    const inAuthGroup = segments[0] === "(auth)";
    const timer = setTimeout(() => {
      if (!user && !inAuthGroup) {
        router.replace("/(auth)/login" as any);
      } else if (user && inAuthGroup) {
        router.replace("/(tabs)" as any);
      }
    }, 1);

    return () => clearTimeout(timer);
  }, [user, isAuthLoading, segments, rootNavigationState?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ────────────────────────────────────────────────────────────────
  // The Stack is rendered unconditionally and its screenOptions/children never
  // change. This means the Stack and every screen it manages are stable across
  // re-renders of RootLayout. The loading overlay and status bar are isolated
  // into their own components so their state changes don't propagate up here.
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <AppStatusBar />
        <BiometricOverlay />

        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="modal/add-transaction"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="modal/add-goal"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="modal/edit-profile"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="modal/investment-plan"
            options={{
              presentation: "modal",
              // headerShown is intentionally absent (defaults to false).
              // The modal manages its own top bar inline to avoid the
              // "dynamically changing header causes remount" warning.
            }}
          />
          <Stack.Screen name="+not-found" options={{ title: "Oops!" }} />
        </Stack>

        {/* LoadingOverlay subscribes to hydration state independently so
            its re-renders never touch the Stack above */}
        <LoadingOverlay />
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});
