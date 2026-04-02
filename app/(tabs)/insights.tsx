// app/(tabs)/insights.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useFinanceStore } from '@/store/useFinanceStore';
import { CategoryPie } from '@/components/charts/CategoryPie';
import { ExpenseBarChart } from '@/components/charts/ExpenseBarChart';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

export default function InsightsScreen() {
  const transactions = useFinanceStore((state) => state.transactions);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Financial Insights</Text>
          <Text style={styles.subtitle}>Understand where your money goes</Text>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Not enough data</Text>
            <Text style={styles.emptySubtitle}>
              Log a few expenses to see your financial trends and category breakdowns here.
            </Text>
          </View>
        ) : (
          <>
            {/* Donut Chart: Where is the money going? */}
            <CategoryPie transactions={transactions} />

            {/* Bar Chart: When is the money going? */}
            <ExpenseBarChart transactions={transactions} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 12,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.light.tabIconDefault,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  }
});