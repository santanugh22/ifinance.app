// store/useSettingsStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: Record<string, Currency> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US" },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE" },
};

interface SettingsState {
  isDarkMode: boolean;
  isNotificationsEnabled: boolean;
  isBiometricExportEnabled: boolean;
  selectedCurrency: Currency;
  isHydrated: boolean;

  // Actions
  setHydrated: () => void;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  toggleBiometricExport: () => void;
  setCurrency: (code: string) => void;
  formatAmount: (amount: number) => string;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      isNotificationsEnabled: true,
      isBiometricExportEnabled: false,
      selectedCurrency: CURRENCIES.USD,
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      toggleNotifications: () =>
        set((state) => ({
          isNotificationsEnabled: !state.isNotificationsEnabled,
        })),
      toggleBiometricExport: () =>
        set((state) => ({
          isBiometricExportEnabled: !state.isBiometricExportEnabled,
        })),
      setCurrency: (code: string) => {
        const currency = CURRENCIES[code] || CURRENCIES.USD;
        set({ selectedCurrency: currency });
      },
      formatAmount: (amount: number) => {
        const { selectedCurrency } = get();
        try {
          return new Intl.NumberFormat(selectedCurrency.locale, {
            style: "currency",
            currency: selectedCurrency.code,
          }).format(amount);
        } catch (e) {
          // Fallback if Intl fails
          return `${selectedCurrency.symbol}${amount.toFixed(2)}`;
        }
      },
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
