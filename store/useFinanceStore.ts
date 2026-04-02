// store/useFinanceStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { Transaction, Goal } from '@/types';

interface FinanceState {
  transactions: Transaction[];
  goals: Goal[];
  isSyncing: boolean;
  
  // Actions
  fetchFinanceData: (userId: string) => () => void;
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (goal: Goal) => Promise<void>;
  updateGoalAmount: (id: string, amountAdded: number) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      goals: [],
      isSyncing: false,

      fetchFinanceData: (userId: string) => {
        set({ isSyncing: true });
        
        // Listen to Transactions
        const unsubscribeTransactions = firestore()
          .collection('users')
          .doc(userId)
          .collection('transactions')
          .orderBy('date', 'desc')
          .onSnapshot((snapshot) => {
            const transactions: Transaction[] = [];
            snapshot.forEach((doc) => {
              transactions.push({ id: doc.id, ...doc.data() } as Transaction);
            });
            set({ transactions, isSyncing: false });
          });

        // Listen to Goals
        const unsubscribeGoals = firestore()
          .collection('users')
          .doc(userId)
          .collection('goals')
          .onSnapshot((snapshot) => {
            const goals: Goal[] = [];
            snapshot.forEach((doc) => {
              goals.push({ id: doc.id, ...doc.data() } as Goal);
            });
            set({ goals });
          });

        return () => {
          unsubscribeTransactions();
          unsubscribeGoals();
        };
      },

      addTransaction: async (transaction) => {
        const { userId, ...data } = transaction;
        await firestore()
          .collection('users')
          .doc(userId)
          .collection('transactions')
          .doc(transaction.id)
          .set(data);
      },

      updateTransaction: async (updatedTx) => {
        const { id, userId, ...data } = updatedTx;
        await firestore()
          .collection('users')
          .doc(userId)
          .collection('transactions')
          .doc(id)
          .update(data);
      },

      deleteTransaction: async (id) => {
        const userId = get().transactions.find(tx => tx.id === id)?.userId;
        if (!userId) return;
        await firestore()
          .collection('users')
          .doc(userId)
          .collection('transactions')
          .doc(id)
          .delete();
      },

      addGoal: async (goal) => {
        const { userId, ...data } = goal;
        await firestore()
          .collection('users')
          .doc(userId)
          .collection('goals')
          .doc(goal.id)
          .set(data);
      },

      updateGoalAmount: async (id, amountAdded) => {
        const goal = get().goals.find(g => g.id === id);
        if (!goal) return;
        
        const newAmount = goal.currentAmount + amountAdded;
        await firestore()
          .collection('users')
          .doc(goal.userId)
          .collection('goals')
          .doc(id)
          .update({
            currentAmount: newAmount,
            isCompleted: newAmount >= goal.targetAmount,
          });
      },
    }),
    {
      name: 'finance-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        goals: state.goals,
      }),
    }
  )
);