// store/useCurrencyStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Currency = {
  code: string;
  symbol: string;
  name: string;
  locale: string;
};

export const CURRENCIES: Record<string, Currency> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
};

interface CurrencyState {
  currentCurrency: Currency;
  setCurrency: (code: string) => void;
  formatAmount: (amount: number) => string;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currentCurrency: CURRENCIES.USD,
      setCurrency: (code: string) => {
        const currency = CURRENCIES[code] || CURRENCIES.USD;
        set({ currentCurrency: currency });
      },
      formatAmount: (amount: number) => {
        const { currentCurrency } = get();
        return new Intl.NumberFormat(currentCurrency.locale, {
          style: 'currency',
          currency: currentCurrency.code,
        }).format(amount);
      },
    }),
    {
      name: 'currency-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
