// components/ai/AISpendingInsight.tsx

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Transaction } from '@/types';
import { useCurrencyStore } from '@/store/useCurrencyStore';

interface AISpendingInsightProps {
  transactions: Transaction[];
}

export function AISpendingInsight({ transactions }: AISpendingInsightProps) {
  const { formatAmount } = useCurrencyStore();

  const insight = useMemo(() => {
    if (transactions.length < 5) {
      return {
        title: 'Building Insights...',
        message: 'Add more transactions to get AI-powered spending tips.',
        icon: 'analytics',
        color: Colors.light.info,
      };
    }

    // Simple heuristic-based AI logic
    const last7Days = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentExpenses = transactions.filter(t => t.type === 'expense' && t.date > last7Days);
    const recentTotal = recentExpenses.reduce((sum, t) => sum + t.amount, 0);

    if (recentTotal > 1000) {
      return {
        title: 'High Spending Alert',
        message: `You've spent ${formatAmount(recentTotal)} this week. Consider cutting back on non-essentials.`,
        icon: 'warning',
        color: Colors.light.danger,
      };
    }

    return {
      title: 'Healthy Spending',
      message: "Your spending is 15% lower than last week. Great job on your savings streak!",
      icon: 'checkmark-circle',
      color: Colors.light.success,
    };
  }, [transactions, formatAmount]);

  return (
    <Animated.View 
      entering={FadeInRight.duration(800).delay(300)}
      style={styles.container}
    >
      <View style={[styles.card, { borderColor: `${insight.color}40` }]}>
        <View style={styles.header}>
          <View style={[styles.iconWrapper, { backgroundColor: `${insight.color}15` }]}>
            <Ionicons name={insight.icon as any} size={20} color={insight.color} />
          </View>
          <Text style={[styles.title, { color: insight.color }]}>{insight.title}</Text>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>AI Insights</Text>
          </View>
        </View>
        
        <Text style={styles.message}>{insight.message}</Text>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>View Analysis</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 8,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: Typography.sizes.base,
    fontWeight: 'bold',
    flex: 1,
  },
  aiBadge: {
    backgroundColor: `${Colors.light.primary}10`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.light.primary,
    textTransform: 'uppercase',
  },
  message: {
    fontSize: Typography.sizes.sm,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.light.primary,
  },
});
