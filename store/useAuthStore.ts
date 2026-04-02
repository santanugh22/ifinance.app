import { User } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "@react-native-firebase/auth";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface StoredAccount {
  uid: string;
  email: string;
  password: string;
  displayName: string;
  createdAt: number;
}

interface AuthResult {
  created: boolean;
  message: string;
}

interface AuthState {
  user: User | null;
  isBiometricsEnabled: boolean;
  hasOnboarded: boolean;
  isLoading: boolean;
  accounts: StoredAccount[];
  lastLoginEmail: string | null;
  setUser: (user: User | null) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
  setHasOnboarded: (status: boolean) => void;
  signInOrRegister: (email: string, password: string) => Promise<AuthResult>;
  signInWithBiometrics: () => Promise<boolean>;
  markHydrated: () => void;
  updateProfile: (displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const toEmailKey = (email: string) => email.trim().toLowerCase();

const createUid = () => {
  return `usr_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const getDisplayNameFromEmail = (email: string) => {
  const localPart = email.split("@")[0]?.trim();
  if (!localPart) {
    return "Member";
  }

  return localPart
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const toUser = (account: StoredAccount, biometricsEnabled: boolean): User => ({
  uid: account.uid,
  email: account.email,
  displayName: account.displayName,
  biometricsEnabled,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isBiometricsEnabled: false,
      hasOnboarded: false,
      isLoading: true,
      accounts: [],
      lastLoginEmail: null,

      setUser: (user) => set({ user, isLoading: false }),

      setBiometricsEnabled: (enabled) => set({ isBiometricsEnabled: enabled }),

      setHasOnboarded: (status) => set({ hasOnboarded: status }),

      updateProfile: async (displayName: string) => {
        const user = get().user;
        if (!user) return;
        
        // Update Firebase if logged in
        const firebaseUser = auth().currentUser;
        if (firebaseUser) {
          await firebaseUser.updateProfile({ displayName });
        }

        // Update local accounts array to persist
        const accounts = get().accounts.map((acc: StoredAccount) => 
          acc.uid === user.uid ? { ...acc, displayName } : acc
        );

        set({ 
          user: { ...user, displayName },
          accounts 
        });
      },

      signInOrRegister: async (email, password) => {
        const normalizedEmail = toEmailKey(email);
        const cleanPassword = password.trim();

        if (!normalizedEmail) {
          throw new Error("Please enter a valid email address.");
        }

        if (cleanPassword.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }

        const existingAccount = get().accounts.find(
          (account) => account.email === normalizedEmail,
        );

        if (existingAccount) {
          if (existingAccount.password !== cleanPassword) {
            throw new Error("Incorrect password for this account.");
          }

          set((state) => ({
            user: toUser(existingAccount, state.isBiometricsEnabled),
            lastLoginEmail: existingAccount.email,
            isLoading: false,
          }));

          return { created: false, message: "Signed in successfully." };
        }

        const account: StoredAccount = {
          uid: createUid(),
          email: normalizedEmail,
          password: cleanPassword,
          displayName: getDisplayNameFromEmail(normalizedEmail),
          createdAt: Date.now(),
        };

        set((state) => ({
          accounts: [...state.accounts, account],
          user: toUser(account, state.isBiometricsEnabled),
          lastLoginEmail: account.email,
          isLoading: false,
        }));

        return { created: true, message: "Account created and signed in." };
      },

      signInWithBiometrics: async () => {
        const { lastLoginEmail, accounts, isBiometricsEnabled } = get();
        if (!lastLoginEmail) {
          return false;
        }

        const account = accounts.find((item) => item.email === lastLoginEmail);
        if (!account) {
          return false;
        }

        set({
          user: toUser(account, isBiometricsEnabled),
          isLoading: false,
        });

        return true;
      },

      markHydrated: () => set({ isLoading: false }),

      logout: async () => {
        set({ user: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isBiometricsEnabled: state.isBiometricsEnabled,
        hasOnboarded: state.hasOnboarded,
        accounts: state.accounts,
        lastLoginEmail: state.lastLoginEmail,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to restore auth session:", error);
        }
        state?.markHydrated();
      },
    },
  ),
);
