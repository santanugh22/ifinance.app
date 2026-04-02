// utils/date.ts

import { Transaction } from '@/types';

export const formatTime = (timestamp: number): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(timestamp));
};

export const getSectionTitle = (timestamp: number): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    }).format(date);
  }
};

export const groupTransactionsByDate = (
  transactions: Transaction[]
): { title: string; data: Transaction[] }[] => {
  const grouped = transactions.reduce((acc: Record<string, Transaction[]>, transaction) => {
    const title = getSectionTitle(transaction.date);
    if (!acc[title]) {
      acc[title] = [];
    }
    acc[title].push(transaction);
    return acc;
  }, {});

  // Convert object back to array format required by SectionList
  return Object.keys(grouped).map((title) => ({
    title,
    data: grouped[title],
  }));
};