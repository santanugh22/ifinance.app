// app/(tabs)/profile.tsx
import { SettingsItem } from "@/components/ui/SettingsItem";
import { Typography } from "@/constants/Typography";
import { useBiometrics } from "@/hooks/useBiometrics";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAuthStore } from "@/store/useAuthStore";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { ExportService } from "@/utils/ExportService";
import auth from "@react-native-firebase/auth";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const colors = useThemeColor();
  const { transactions } = useFinanceStore();
  const {
    isDarkMode,
    isNotificationsEnabled,
    isBiometricExportEnabled,
    toggleDarkMode,
    toggleNotifications,
    toggleBiometricExport,
    selectedCurrency,
    setCurrency,
  } = useSettingsStore();
  const {
    isBiometricsEnabled,
    toggleBiometrics,
    authenticateForAction,
    biometricTypeLabel,
    isCompatible,
  } = useBiometrics();

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            // Sign out from Firebase if used
            await auth()
              .signOut()
              .catch(() => {});
            // Sign out from local store (Resets UI)
            await logout();
          } catch (error) {
            Alert.alert("Error", "Failed to log out.");
          }
        },
      },
    ]);
  };

  const handleCurrencyChange = () => {
    Alert.alert("Select Currency", "Choose your preferred currency", [
      { text: "USD ($)", onPress: () => setCurrency("USD") },
      { text: "INR (₹)", onPress: () => setCurrency("INR") },
      { text: "EUR (€)", onPress: () => setCurrency("EUR") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleExport = async () => {
    try {
      if (transactions.length === 0) {
        Alert.alert("No Data", "You have no transactions to export.");
        return;
      }

      if (isBiometricExportEnabled) {
        const verified = await authenticateForAction(
          "Authorize secure data export",
        );
        if (!verified) {
          Alert.alert(
            "Authentication Required",
            `Verify with ${biometricTypeLabel} to export data.`,
          );
          return;
        }
      }

      await ExportService.exportTransactionsToCSV(
        transactions,
        selectedCurrency.code,
      );
    } catch (error) {
      Alert.alert(
        "Export Failed",
        "An error occurred while exporting your data.",
      );
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(600)}
          style={styles.header}
        >
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.displayName || "Finance Member"}
          </Text>
          <Text style={[styles.userEmail, { color: colors.tabIconDefault }]}>
            {user?.email}
          </Text>

          <TouchableOpacity
            style={[
              styles.editButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.push("/modal/edit-profile" as any)}
          >
            <Text style={[styles.editButtonText, { color: colors.text }]}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.tabIconDefault }]}>
            Preferences
          </Text>
          <SettingsItem
            label="Dark Mode"
            icon="moon-outline"
            value={isDarkMode}
            onValueChange={toggleDarkMode}
          />
          <SettingsItem
            label="Currency"
            icon="cash-outline"
            rightElement={
              <Text style={[styles.rightValue, { color: colors.primary }]}>
                {selectedCurrency.code} ({selectedCurrency.symbol})
              </Text>
            }
            onPress={handleCurrencyChange}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.tabIconDefault }]}>
            Security & Notifications
          </Text>
          <SettingsItem
            label="Notifications"
            icon="notifications-outline"
            value={isNotificationsEnabled}
            onValueChange={toggleNotifications}
          />
          {isCompatible && (
            <SettingsItem
              label={`${biometricTypeLabel} App Lock`}
              icon="finger-print-outline"
              value={isBiometricsEnabled}
              onValueChange={toggleBiometrics}
            />
          )}
          {isCompatible && (
            <SettingsItem
              label={`${biometricTypeLabel} for Data Export`}
              icon="shield-checkmark-outline"
              value={isBiometricExportEnabled}
              onValueChange={toggleBiometricExport}
            />
          )}
          {!isCompatible && (
            <SettingsItem
              label="Biometric options"
              icon="alert-circle-outline"
              rightElement={
                <Text
                  style={[styles.rightValue, { color: colors.tabIconDefault }]}
                >
                  Not set up
                </Text>
              }
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.tabIconDefault }]}>
            Account
          </Text>
          <SettingsItem
            label="Export Data (CSV)"
            icon="download-outline"
            onPress={handleExport}
          />
          <SettingsItem
            label="Log Out"
            icon="log-out-outline"
            destructive
            onPress={handleLogout}
          />
        </View>

        <Text style={[styles.versionText, { color: colors.tabIconDefault }]}>
          Version 1.0.0 (Production Ready)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFF",
  },
  userName: {
    fontSize: Typography.sizes.xl,
    fontWeight: "800",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: Typography.sizes.sm,
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: Typography.sizes.xs,
    fontWeight: "700",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  rightValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: "700",
  },
  versionText: {
    textAlign: "center",
    fontSize: 10,
    marginTop: 20,
    fontWeight: "600",
  },
});
