// constants/Categories.ts

import { Category } from '@/types';
import { Colors } from './Colors';

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'exp_food', name: 'Food & Dining', icon: 'restaurant', color: '#F59E0B', type: 'expense' },
  { id: 'exp_transport', name: 'Transport', icon: 'car', color: '#3B82F6', type: 'expense' },
  { id: 'exp_shopping', name: 'Shopping', icon: 'bag-handle', color: '#EC4899', type: 'expense' },
  { id: 'exp_entertainment', name: 'Entertainment', icon: 'film', color: '#8B5CF6', type: 'expense' },
  { id: 'exp_bills', name: 'Bills & Utilities', icon: 'flash', color: '#EF4444', type: 'expense' },
  { id: 'exp_health', name: 'Health', icon: 'medkit', color: '#10B981', type: 'expense' },
  { id: 'exp_other', name: 'Other', icon: 'ellipsis-horizontal', color: '#6B7280', type: 'expense' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'inc_salary', name: 'Salary', icon: 'briefcase', color: '#10B981', type: 'income' },
  { id: 'inc_freelance', name: 'Freelance', icon: 'laptop', color: '#3B82F6', type: 'income' },
  { id: 'inc_investments', name: 'Investments', icon: 'trending-up', color: '#8B5CF6', type: 'income' },
  { id: 'inc_gifts', name: 'Gifts', icon: 'gift', color: '#F59E0B', type: 'income' },
  { id: 'inc_other', name: 'Other', icon: 'ellipsis-horizontal', color: '#6B7280', type: 'income' },
];

export const getCategoryById = (id: string): Category | undefined => {
  return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find((cat) => cat.id === id);
};