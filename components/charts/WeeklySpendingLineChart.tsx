// components/charts/WeeklySpendingLineChart.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Transaction } from '@/types';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

import { useSettingsStore } from '@/store/useSettingsStore';
import { useThemeColor } from '@/hooks/useThemeColor';

const screenWidth = Dimensions.get('window').width;

interface WeeklySpendingLineChartProps {
  transactions: Transaction[];
}

export function WeeklySpendingLineChart({ transactions }: WeeklySpendingLineChartProps) {
  const { selectedCurrency } = useSettingsStore();
  const colors = useThemeColor();

  const lineData = useMemo(() => {
    // Generate the last 7 days labels and initialize totals to 0
    const last7Days = Array.from({ length: 7 })
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        return {
          timestamp: d.getTime(),
          label: d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0), // 'M', 'T', etc.
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
      dataPointText: day.total > 0 ? `${selectedCurrency.symbol}${Math.round(day.total)}` : '',
    }));
  }, [transactions, selectedCurrency]);

  const maxValue = Math.max(...lineData.map(d => d.value), 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Weekly Spending</Text>
        <Text style={[styles.trend, { color: colors.primary }]}>Trend</Text>
      </View>
      <View style={styles.chartWrapper}>
        <LineChart
          data={lineData}
          width={screenWidth - 80}
          height={160}
          color={colors.primary}
          thickness={3}
          dataPointsColor={colors.primary}
          dataPointsRadius={4}
          rulesColor={colors.border}
          rulesType="solid"
          dashWidth={0}
          yAxisColor={colors.border}
          xAxisColor={colors.border}
          yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
          hideRules={false}
          hideYAxisText={true}
          yAxisThickness={0}
          xAxisThickness={0}
          initialSpacing={20}
          spacing={(screenWidth - 120) / 6}
          areaChart
          startFillColor={colors.primary}
          startOpacity={0.2}
          endOpacity={0.01}
          curved
          noOfSections={3}
          maxValue={maxValue * 1.2}
          textColor={colors.textSecondary}
        />
      </View>
      <View style={styles.footer}>
        {lineData.map((d, i) => (
          <Text key={i} style={[styles.footerText, { color: colors.tabIconDefault }]}>{d.label}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  title: {
    fontSize: Typography.sizes.base,
    fontWeight: '700',
  },
  trend: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  chartWrapper: {
    alignItems: 'center',
    marginLeft: -20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  footerText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
  }
});
