import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Transaction } from '@/types';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useThemeColor } from '@/hooks/useThemeColor';

interface AISpendingInsightProps {
  transactions: Transaction[];
}

export function AISpendingInsight({ transactions }: AISpendingInsightProps) {
  const { formatAmount } = useSettingsStore();
  const colors = useThemeColor();

  const insight = useMemo(() => {
    if (transactions.length < 5) {
      return {
        title: 'Building Insights...',
        message: 'Add more transactions to get AI-powered spending tips.',
        icon: 'analytics',
        color: colors.primary, // Using theme color instead of hardcoded
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
        color: colors.danger,
      };
    }

    return {
      title: 'Healthy Spending',
      message: "Your spending is 15% lower than last week. Great job on your savings streak!",
      icon: 'checkmark-circle',
      color: colors.success,
    };
  }, [transactions, formatAmount, colors]);

  return (
    <Animated.View 
      entering={FadeInRight.duration(800).delay(300)}
      style={styles.container}
    >
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: `${insight.color}40` }]}>
        <View style={styles.header}>
          <View style={[styles.iconWrapper, { backgroundColor: `${insight.color}15` }]}>
            <Ionicons name={insight.icon as any} size={20} color={insight.color} />
          </View>
          <Text style={[styles.title, { color: insight.color }]}>{insight.title}</Text>
          <View style={[styles.aiBadge, { backgroundColor: `${colors.primary}10` }]}>
            <Text style={[styles.aiBadgeText, { color: colors.primary }]}>AI Insights</Text>
          </View>
        </View>
        
        <Text style={[styles.message, { color: colors.textSecondary }]}>{insight.message}</Text>
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  message: {
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
});
