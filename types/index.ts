// types/index.ts

export type TransactionType = 'income' | 'expense';

export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  biometricsEnabled: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // e.g., 'coffee', 'shopping-cart', 'briefcase'
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: number; // Unix timestamp for efficient sorting
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: number; // Unix timestamp
  createdAt: number;
  isCompleted: boolean;
}