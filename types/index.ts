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
  reminderEnabled?: boolean;
  reminderHour?: number;
  reminderMinute?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'no-spend' | 'savings-streak' | 'budget-limit';
  targetDays: number;
  currentDays: number;
  icon: string;
  isCompleted: boolean;
  isActive: boolean;
  startDate?: number;
}

export type CurrencyCode = 'USD' | 'INR';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export interface InvestmentAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: string;
  exchange: 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE' | 'OTHER';
  lastUpdated: number;
}

export interface MarketHighlight {
  name: string;
  symbol: string;
  price: string;
  change: string;
  isUp: boolean;
}

// AI Related Types
export interface AIInsight {
  type: 'savings' | 'investment' | 'spending' | 'habit';
  title: string;
  description: string;
  action: string;
  impact: 'high' | 'medium' | 'low';
}

export interface InvestmentPlan {
  riskProfile: string;
  allocation: { asset: string; percentage: number }[];
  strategy: string;
  recommendations: string[];
}

export interface AIResponse {
  summary: string;
  insights: AIInsight[];
  investmentPlan?: InvestmentPlan;
  challenges?: Challenge[];
}