// store/useAuthStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import auth from '@react-native-firebase/auth';

interface AuthState {
  user: User | null;
  isBiometricsEnabled: boolean;
  hasOnboarded: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
  setHasOnboarded: (status: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isBiometricsEnabled: false,
      hasOnboarded: false,
      isLoading: true, // Starts true until Firebase auth state is confirmed
      
      setUser: (user) => set({ user, isLoading: false }),
      
      setBiometricsEnabled: (enabled) => set({ isBiometricsEnabled: enabled }),
      
      setHasOnboarded: (status) => set({ hasOnboarded: status }),
      
      logout: async () => {
        try {
          await auth().signOut();
          set({ user: null });
        } catch (error) {
          console.error("Logout failed:", error);
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // We don't want to persist the isLoading state
      partialize: (state) => ({ 
        isBiometricsEnabled: state.isBiometricsEnabled,
        hasOnboarded: state.hasOnboarded,
      }),
    }
  )
);