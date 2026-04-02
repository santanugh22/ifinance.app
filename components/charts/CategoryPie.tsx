// components/charts/CategoryPie.tsx

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Transaction } from '@/types';
import { getCategoryById } from '@/constants/Categories';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

import { useSettingsStore } from '@/store/useSettingsStore';
import { useThemeColor } from '@/hooks/useThemeColor';

interface CategoryPieProps {
  transactions: Transaction[];
}

export function CategoryPie({ transactions }: CategoryPieProps) {
  const { formatAmount } = useSettingsStore();
  const colors = useThemeColor();

  const { pieData, totalExpense } = useMemo(() => {
    // 1. Filter only expenses
    const expenses = transactions.filter((tx) => tx.type === 'expense');

    // 2. Group by category and sum amounts
    const categoryTotals: Record<string, { amount: number, name: string, color: string }> = {};
    let total = 0;

    expenses.forEach((tx) => {
      const category = getCategoryById(tx.categoryId);
      if (!categoryTotals[tx.categoryId]) {
        categoryTotals[tx.categoryId] = { 
          amount: 0, 
          name: category?.name || 'Other', 
          color: category?.color || colors.tabIconDefault 
        };
      }
      categoryTotals[tx.categoryId].amount += tx.amount;
      total += tx.amount;
    });

    // 3. Map to Gifted Charts format
    const data = Object.entries(categoryTotals)
      .map(([id, cat]) => ({
        value: cat.amount,
        color: cat.color,
        text: cat.name.substring(0, 3),
        label: cat.name,
      }))
      .sort((a, b) => b.value - a.value); // Sort largest to smallest

    return { pieData: data, totalExpense: total };
  }, [transactions, colors.tabIconDefault]);

  if (pieData.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>No expense data to display.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Spending by Category</Text>
      <View style={styles.chartWrapper}>
        <PieChart
          donut
          radius={110}
          innerRadius={75}
          data={pieData}
          innerCircleColor={colors.surface}
          backgroundColor={colors.surface}
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <Text style={[styles.centerText, { color: colors.textSecondary }]}>Total</Text>
              <Text style={[styles.centerAmount, { color: colors.text }]}>
                {formatAmount(totalExpense)}
              </Text>
            </View>
          )}
        />
      </View>
      
      {/* Legend */}
      <View style={styles.legendContainer}>
        {pieData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={[styles.legendText, { color: colors.text }]} numberOfLines={1}>
              {item.label} ({((item.value / totalExpense) * 100).toFixed(0)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    fontSize: Typography.sizes.xs,
    marginBottom: 4,
  },
  centerAmount: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 24,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: Typography.sizes.xs,
    flex: 1,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 24,
    marginBottom: 24,
  },
  emptyText: {
    fontStyle: 'italic',
  }
});