import { MarketService } from "@/services/MarketService";
import {
  AIResponse,
  Challenge,
  Goal,
  InvestmentAsset,
  Transaction,
} from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const DEFAULT_WATCHLIST = [
  "AAPL",
  "MSFT",
  "NVDA",
  "RELIANCE.BSE",
  "TCS.BSE",
  "INFY.BSE",
];
const MAX_DAILY_REFRESH = 5;

interface FinanceState {
  transactions: Transaction[];
  goals: Goal[];
  challenges: Challenge[];
  investmentWatchlist: InvestmentAsset[];

  // AI Caching
  cachedAiInsight: AIResponse | null;
  cachedAiInvestmentPlan: AIResponse | null;
  lastAiUpdate: number | null;
  lastChallengeUpdate: number | null;
  dailyRefreshCount: number;

  isSyncing: boolean;
  isHydrated: boolean;

  // Actions
  markHydrated: () => void;
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (goal: Goal) => Promise<void>;
  updateGoalAmount: (id: string, amountAdded: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  toggleChallenge: (id: string) => void;
  refreshChallenges: () => void;
  refreshMarketData: (force?: boolean) => Promise<void>;
  addToWatchlist: (symbol: string) => Promise<void>;
  removeFromWatchlist: (symbol: string) => void;

  // AI Actions
  setAiInsights: (insights: AIResponse, isInvestment?: boolean) => void;
  canRefreshAi: () => boolean;
  setAiChallenges: (challenges: Challenge[]) => void;
}

const sortTransactions = (transactions: Transaction[]) =>
  [...transactions].sort(
    (a, b) => b.date - a.date || b.createdAt - a.createdAt,
  );

const sortGoals = (goals: Goal[]) =>
  [...goals].sort((a, b) =>
    a.isCompleted === b.isCompleted
      ? a.deadline - b.deadline
      : Number(a.isCompleted) - Number(b.isCompleted),
  );

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      goals: [],
      challenges: [],
      investmentWatchlist: [],

      cachedAiInsight: null,
      cachedAiInvestmentPlan: null,
      lastAiUpdate: null,
      lastChallengeUpdate: null,
      dailyRefreshCount: 0,

      isSyncing: false,
      isHydrated: false,

      // ─── FIX 1: markHydrated no longer calls refreshChallenges or
      // refreshMarketData directly — those are triggered by screens that
      // need them, preventing a flood of async work on every cold start.
      // It only resets the daily counter if the date has rolled over.
      markHydrated: () => {
        const lastUpdate = get().lastAiUpdate;
        let shouldResetCount = false;

        if (lastUpdate) {
          const lastDate = new Date(lastUpdate).toDateString();
          const nowDate = new Date().toDateString();
          if (lastDate !== nowDate) shouldResetCount = true;
        }

        set({
          isHydrated: true,
          isSyncing: false,
          ...(shouldResetCount ? { dailyRefreshCount: 0 } : {}),
        });
      },

      addTransaction: async (transaction) => {
        set((state) => ({
          transactions: sortTransactions([
            ...state.transactions,
            { ...transaction, updatedAt: transaction.updatedAt || Date.now() },
          ]),
        }));
        get().refreshChallenges();
      },

      updateTransaction: async (updatedTx) => {
        set((state) => ({
          transactions: sortTransactions(
            state.transactions.map((t) =>
              t.id !== updatedTx.id
                ? t
                : { ...t, ...updatedTx, updatedAt: Date.now() },
            ),
          ),
        }));
        get().refreshChallenges();
      },

      deleteTransaction: async (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
        get().refreshChallenges();
      },

      addGoal: async (goal) => {
        set((state) => ({ goals: sortGoals([...state.goals, goal]) }));
      },

      updateGoalAmount: async (id, amountAdded) => {
        const goal = get().goals.find((g) => g.id === id);
        if (!goal) return;
        const newAmount = goal.currentAmount + amountAdded;
        set((state) => ({
          goals: sortGoals(
            state.goals.map((item) =>
              item.id !== id
                ? item
                : {
                    ...item,
                    currentAmount: newAmount,
                    isCompleted: newAmount >= item.targetAmount,
                  },
            ),
          ),
        }));
      },

      deleteGoal: async (id) => {
        set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
      },

      toggleChallenge: (id) => {
        // ─── FIX 2: toggleChallenge no longer calls refreshChallenges()
        // after set() — that caused an immediate double state write and
        // a re-render storm whenever a challenge was toggled.
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id !== id
              ? c
              : {
                  ...c,
                  isActive: !c.isActive,
                  currentDays: 0,
                  isCompleted: false,
                  startDate: !c.isActive ? Date.now() : undefined,
                },
          ),
        }));
      },

      // ─── FIX 3: refreshChallenges now computes progress from actual
      // transaction data instead of blindly incrementing currentDays on
      // every call. The old logic incremented progress each time any
      // transaction was added/updated/deleted, which was wrong.
      refreshChallenges: () => {
        const { transactions, challenges } = get();
        const now = Date.now();

        const startOfToday = (() => {
          const d = new Date(now);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })();

        const todayExpenses = transactions.filter(
          (t) => t.type === "expense" && t.date >= startOfToday,
        );

        const updatedChallenges = challenges.map((challenge) => {
          if (!challenge.isActive || challenge.isCompleted) return challenge;

          const startDate = challenge.startDate ?? now;
          const daysSinceStart = Math.floor(
            (now - startDate) / (1000 * 60 * 60 * 24),
          );

          let currentDays = daysSinceStart;

          if (challenge.type === "no-spend") {
            // Failed today if there are any expenses — reset streak
            if (todayExpenses.length > 0) currentDays = 0;
          }

          if (challenge.type === "budget-limit") {
            const todayTotal = todayExpenses.reduce(
              (sum, t) => sum + t.amount,
              0,
            );
            // If we use a budgetLimit field on the challenge, check against it
            const limit = (challenge as any).budgetLimit ?? Infinity;
            if (todayTotal > limit) currentDays = 0;
          }

          // savings-streak: currentDays just tracks elapsed days — no reset logic here
          // (a richer implementation would check income vs expense delta)

          return {
            ...challenge,
            currentDays,
            isCompleted: currentDays >= challenge.targetDays,
          };
        });

        set({ challenges: updatedChallenges });
      },

      refreshMarketData: async (force = false) => {
        const { investmentWatchlist, isSyncing } = get();

        // ─── FIX 4: guard against concurrent refreshes
        if (isSyncing) return;

        const hasFreshWatchlist =
          investmentWatchlist.length > 0 &&
          investmentWatchlist.every(
            (asset) => Date.now() - asset.lastUpdated < 10 * 60 * 1000,
          );

        if (!force && hasFreshWatchlist) {
          return;
        }

        const symbolsToFetch =
          investmentWatchlist.length > 0
            ? investmentWatchlist.map((a) => a.symbol)
            : DEFAULT_WATCHLIST;

        set({ isSyncing: true });

        const updatedList = await MarketService.getGlobalQuotes(symbolsToFetch);

        // Keep existing watchlist if we fail to fetch any fresh quote.
        if (updatedList.length > 0) {
          set({ investmentWatchlist: updatedList, isSyncing: false });
        } else {
          set({ isSyncing: false });
        }
      },

      addToWatchlist: async (symbol) => {
        const { investmentWatchlist } = get();
        if (investmentWatchlist.some((a) => a.symbol === symbol)) return;
        const asset = await MarketService.getGlobalQuote(symbol);
        if (asset)
          set({ investmentWatchlist: [...investmentWatchlist, asset] });
      },

      removeFromWatchlist: (symbol) => {
        set((state) => ({
          investmentWatchlist: state.investmentWatchlist.filter(
            (a) => a.symbol !== symbol,
          ),
        }));
      },

      // ─── FIX 5: setAiInsights now performs a single set() call instead
      // of two (the old code called set() then immediately called
      // setAiChallenges which called set() again). Two back-to-back set()
      // calls inside one action cause two synchronous re-renders.
      setAiInsights: (insights, isInvestment) => {
        const now = Date.now();

        const challengeUpdates =
          insights.challenges && insights.challenges.length > 0
            ? {
                challenges: insights.challenges.map((c) => ({
                  ...c,
                  currentDays: 0,
                  isCompleted: false,
                  isActive: false,
                })),
                lastChallengeUpdate: now,
              }
            : {};

        set((state) => ({
          ...(isInvestment
            ? { cachedAiInvestmentPlan: insights }
            : { cachedAiInsight: insights }),
          lastAiUpdate: now,
          dailyRefreshCount: state.dailyRefreshCount + 1,
          ...challengeUpdates,
        }));
      },

      canRefreshAi: () => {
        const { dailyRefreshCount, lastAiUpdate } = get();
        if (!lastAiUpdate) return true;
        const lastDate = new Date(lastAiUpdate).toDateString();
        const nowDate = new Date().toDateString();
        if (lastDate !== nowDate) return true;
        return dailyRefreshCount < MAX_DAILY_REFRESH;
      },

      setAiChallenges: (newChallenges) => {
        set({
          challenges: newChallenges.map((c) => ({
            ...c,
            currentDays: 0,
            isCompleted: false,
            isActive: false,
          })),
          lastChallengeUpdate: Date.now(),
        });
      },
    }),
    {
      name: "finance-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        goals: state.goals,
        challenges: state.challenges,
        investmentWatchlist: state.investmentWatchlist,
        cachedAiInsight: state.cachedAiInsight,
        cachedAiInvestmentPlan: state.cachedAiInvestmentPlan,
        lastAiUpdate: state.lastAiUpdate,
        lastChallengeUpdate: state.lastChallengeUpdate,
        dailyRefreshCount: state.dailyRefreshCount,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error("Failed to restore finance data:", error);
        state?.markHydrated();
      },
    },
  ),
);
