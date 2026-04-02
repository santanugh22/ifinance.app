import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { WeeklySpendingLineChart } from '@/components/charts/WeeklySpendingLineChart';
import { SavingsGoalWidget } from '@/components/features/SavingsGoalWidget';
import { AISpendingInsight } from '@/components/ai/AISpendingInsight';
import { TransactionItem } from '@/components/lists/TransactionItem';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useThemeColor } from '@/hooks/useThemeColor';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const colors = useThemeColor();
  const { transactions, goals, deleteTransaction } = useFinanceStore();
  const { selectedCurrency } = useSettingsStore();

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

  const activeGoal = useMemo(() => goals.find(g => !g.isCompleted) || goals[0], [goals]);
  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>Hello, {user?.displayName?.split(' ')[0] || 'Member'} 👋</Text>
            <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>Your finances are looking good</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton} 
            onPress={() => router.push('/(tabs)/profile' as any)}
          >
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>{user?.email?.charAt(0).toUpperCase() || 'U'}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <SummaryCard balance={balance} income={income} expense={expense} />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/modal/add-transaction' as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="add" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Add Tx</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/modal/add-goal' as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${colors.success}15` }]}>
              <Ionicons name="flag-outline" size={20} color={colors.success} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>New Goal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/(tabs)/insights' as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${colors.warning}15` }]}>
              <Ionicons name="stats-chart-outline" size={20} color={colors.warning} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Insights</Text>
          </TouchableOpacity>
        </View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <WeeklySpendingLineChart transactions={transactions} />
        </Animated.View>

        {activeGoal && (
          <Animated.View entering={FadeInDown.delay(300).duration(600)}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Savings Progress</Text>
            </View>
            <SavingsGoalWidget goal={activeGoal} />
          </Animated.View>
        )}
        
        <AISpendingInsight transactions={transactions} />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent activity</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/transactions' as any)}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.listContainer, { backgroundColor: colors.surface }]}>
          {recentTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={32} color={colors.tabIconDefault} />
              <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>No transactions yet</Text>
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
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: Typography.sizes.xl,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
  },
  actionButton: {
    alignItems: 'center',
    width: '30%',
  },
  actionIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: '800',
  },
  seeAllText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
  },
  listContainer: {
    borderRadius: 24,
    padding: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '500',
  },
});