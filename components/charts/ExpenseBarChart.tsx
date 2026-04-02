// components/charts/ExpenseBarChart.tsx

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Transaction } from '@/types';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

import { useSettingsStore } from '@/store/useSettingsStore';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ExpenseBarChartProps {
  transactions: Transaction[];
}

export function ExpenseBarChart({ transactions }: ExpenseBarChartProps) {
  const { selectedCurrency } = useSettingsStore();
  const colors = useThemeColor();

  const barData = useMemo(() => {
    // Generate the last 7 days labels and initialize totals to 0
    const last7Days = Array.from({ length: 7 })
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0); // Normalize to start of day
        return {
          timestamp: d.getTime(),
          label: d.toLocaleDateString('en-US', { weekday: 'short' }), // e.g., 'Mon', 'Tue'
          total: 0,
        };
      });

    // Sum expenses for those specific days
    transactions.forEach((tx) => {
      if (tx.type !== 'expense') return;
      
      const txDate = new Date(tx.date);
      txDate.setHours(0, 0, 0, 0);

      const dayMatch = last7Days.find(d => d.timestamp === txDate.getTime());
      if (dayMatch) {
        dayMatch.total += tx.amount;
      }
    });

    // Format for Gifted Charts
    return last7Days.map((day) => ({
      value: day.total,
      label: day.label,
      frontColor: day.total > 0 ? colors.primary : colors.border,
      topLabelComponent: () => (
        <Text style={[styles.barLabel, { color: colors.tabIconDefault }]}>
          {day.total > 0 ? `${selectedCurrency.symbol}${Math.round(day.total)}` : ''}
        </Text>
      ),
    }));
  }, [transactions, colors, selectedCurrency]);

  const maxValue = Math.max(...barData.map(d => d.value), 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Last 7 Days</Text>
      <View style={styles.chartWrapper}>
        <BarChart
          data={barData}
          width={280}
          height={200}
          barWidth={24}
          spacing={20}
          roundedTop
          roundedBottom
          hideRules={false}
          rulesColor={colors.border}
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
          noOfSections={4}
          maxValue={maxValue * 1.2}
          initialSpacing={10}
        />
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
    marginLeft: -10, // Slight adjustment for Y axis alignment
  },
  barLabel: {
    fontSize: 10,
    marginBottom: 4,
    fontWeight: '600',
  }
});