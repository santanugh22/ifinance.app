// app/(tabs)/index.tsx

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { AISpendingInsight } from '@/components/ai/AISpendingInsight';
import { TransactionItem } from '@/components/lists/TransactionItem';
import { ExportService } from '@/utils/ExportService';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const { transactions, deleteTransaction } = useFinanceStore();
  const { currentCurrency } = useCurrencyStore();

  // Financial summary calculation
  const { balance, income, expense } = useMemo(() => {
    return transactions.reduce(
      (acc, curr) => {
        if (curr.type === 'income') {
          acc.income += curr.amount;
          acc.balance += curr.amount;
        } else {
          acc.expense += curr.amount;
          acc.balance -= curr.amount;
        }
        return acc;
      },
      { balance: 0, income: 0, expense: 0 }
    );
  }, [transactions]);

  const handleExport = async () => {
    try {
      await ExportService.exportTransactionsToCSV(transactions, currentCurrency.code);
    } catch (error: any) {
      Alert.alert('Export Error', error.message);
    }
  };

  const recentTransactions = useMemo(() => transactions.slice(0, 10), [transactions]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.displayName?.split(' ')[0] || 'Member'} 👋</Text>
            <Text style={styles.subtitle}>Welcome back to your wallet</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={handleExport}>
            <Ionicons name="share-outline" size={22} color={Colors.light.text} />
          </TouchableOpacity>
        </Animated.View>

        <SummaryCard balance={balance} income={income} expense={expense} />
        
        <AISpendingInsight transactions={transactions} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {recentTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrapper}>
                <Ionicons name="receipt-outline" size={32} color={Colors.light.textSecondary} />
              </View>
              <Text style={styles.emptyText}>No transactions yet.</Text>
              <Text style={styles.emptySubtext}>Tap the + button to add one.</Text>
            </View>
          ) : (
            recentTransactions.map((tx) => (
              <TransactionItem 
                key={tx.id} 
                transaction={tx} 
                onDelete={deleteTransaction} 
              />
            ))
          )}
        </View>
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
    padding: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '700',
    color: Colors.light.text,
  },
  seeAllText: {
    fontSize: Typography.sizes.sm,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  listContainer: {
    gap: 0, // TransactionItem has its own margin
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.light.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: Typography.sizes.base,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.light.textSecondary,
  },
});