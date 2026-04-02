// components/charts/CategoryPie.tsx

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Transaction } from '@/types';
import { getCategoryById } from '@/constants/Categories';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

interface CategoryPieProps {
  transactions: Transaction[];
}

export function CategoryPie({ transactions }: CategoryPieProps) {
  const { pieData, totalExpense } = useMemo(() => {
    // 1. Filter only expenses
    const expenses = transactions.filter((tx) => tx.type === 'expense');

    // 2. Group by category and sum amounts
    const categoryTotals: Record<string, number> = {};
    let total = 0;

    expenses.forEach((tx) => {
      categoryTotals[tx.categoryId] = (categoryTotals[tx.categoryId] || 0) + tx.amount;
      total += tx.amount;
    });

    // 3. Map to Gifted Charts format
    const data = Object.keys(categoryTotals)
      .map((categoryId) => {
        const category = getCategoryById(categoryId);
        return {
          value: categoryTotals[categoryId],
          color: category?.color || Colors.light.tabIconDefault,
          text: category?.name.substring(0, 3), // Short label for the pie slice
        };
      })
      .sort((a, b) => b.value - a.value); // Sort largest to smallest

    return { pieData: data, totalExpense: total };
  }, [transactions]);

  if (pieData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No expense data to display.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spending by Category</Text>
      <View style={styles.chartWrapper}>
        <PieChart
          donut
          radius={110}
          innerRadius={75}
          data={pieData}
          centerLabelComponent={() => {
            return (
              <View style={styles.centerLabel}>
                <Text style={styles.centerText}>Total</Text>
                <Text style={styles.centerAmount}>
                  ${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Text>
              </View>
            );
          }}
        />
      </View>
      
      {/* Legend */}
      <View style={styles.legendContainer}>
        {pieData.map((item, index) => {
          const category = getCategoryById(Object.keys(
            transactions.filter(t => t.type === 'expense').reduce((acc: any, t) => {
              acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
              return acc;
            }, {})
          ).find(key => 
            transactions.filter(t => t.type === 'expense' && t.categoryId === key)
            .reduce((sum, t) => sum + t.amount, 0) === item.value
          ) || '');

          return (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText} numberOfLines={1}>
                {category?.name || 'Other'} ({((item.value / totalExpense) * 100).toFixed(0)}%)
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
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
    color: Colors.light.text,
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
    color: Colors.light.tabIconDefault,
    marginBottom: 4,
  },
  centerAmount: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    color: Colors.light.text,
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
    color: Colors.light.text,
    flex: 1,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    marginBottom: 24,
  },
  emptyText: {
    color: Colors.light.tabIconDefault,
    fontStyle: 'italic',
  }
});