import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useFinanceStore } from '@/store/useFinanceStore';
import { CategoryPie } from '@/components/charts/CategoryPie';
import { ExpenseBarChart } from '@/components/charts/ExpenseBarChart';
import { AIGuide } from '@/components/ai/AIGuide';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { getCategoryById } from '@/constants/Categories';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { useSettingsStore } from '@/store/useSettingsStore';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function InsightsScreen() {
  const router = useRouter();
  const transactions = useFinanceStore((state) => state.transactions);
  const { formatAmount } = useSettingsStore();
  const colors = useThemeColor();

  const stats = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    
    // Group by category
    const categoryMap: Record<string, number> = {};
    expenses.forEach(t => {
      categoryMap[t.categoryId] = (categoryMap[t.categoryId] || 0) + t.amount;
    });

    const sortedCategories = Object.entries(categoryMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id, amount]) => ({ id, amount, category: getCategoryById(id) }));

    // Weekly comparison
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekTotal = expenses
      .filter(t => t.date >= oneWeekAgo.getTime())
      .reduce((sum, t) => sum + t.amount, 0);

    const lastWeekTotal = expenses
      .filter(t => t.date >= twoWeeksAgo.getTime() && t.date < oneWeekAgo.getTime())
      .reduce((sum, t) => sum + t.amount, 0);

    const diff = thisWeekTotal - lastWeekTotal;
    const percentChange = lastWeekTotal > 0 ? (diff / lastWeekTotal) * 100 : 0;

    return { 
      topCategories: sortedCategories, 
      thisWeekTotal, 
      lastWeekTotal, 
      percentChange,
      isUp: diff > 0 
    };
  }, [transactions]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Financial Hub</Text>
          <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>Personalized AI insights & manual stats</Text>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Not enough data</Text>
            <Text style={[styles.emptySubtitle, { color: colors.tabIconDefault }]}>
              Log a few expenses to see your financial trends and AI-powered insights here.
            </Text>
          </View>
        ) : (
          <>
            {/* AI Magic Guide */}
            <AIGuide />

            {/* Smart Investment Plan Entry */}
            <TouchableOpacity 
              style={[styles.investmentPlanCard, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/modal/investment-plan' as any)}
            >
              <View style={styles.investmentInfo}>
                <Text style={styles.investmentTitle}>Alpha Investment Plan</Text>
                <Text style={styles.investmentSubtitle}>Sophisticated US & India market strategy</Text>
              </View>
              <View style={styles.investmentIcon}>
                <Ionicons name="trending-up" size={24} color="#FFF" />
              </View>
            </TouchableOpacity>

            {/* Weekly Comparison Card */}
            <Animated.View entering={FadeInDown.delay(100)} style={[styles.comparisonCard, { backgroundColor: colors.surface }]}>
              <View>
                <Text style={[styles.cardLabel, { color: colors.tabIconDefault }]}>This Week</Text>
                <Text style={[styles.cardValue, { color: colors.text }]}>{formatAmount(stats.thisWeekTotal)}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.changeContainer}>
                <View style={[styles.badge, { backgroundColor: stats.isUp ? `${colors.danger}15` : `${colors.success}15` }]}>
                  <Ionicons 
                    name={stats.isUp ? 'trending-up' : 'trending-down'} 
                    size={14} 
                    color={stats.isUp ? colors.danger : colors.success} 
                  />
                  <Text style={[styles.badgeText, { color: stats.isUp ? colors.danger : colors.success }]}>
                    {Math.abs(stats.percentChange).toFixed(1)}%
                  </Text>
                </View>
                <Text style={[styles.badgeSubtext, { color: colors.tabIconDefault }]}>vs last week</Text>
              </View>
            </Animated.View>

            {/* Donut Chart: Where is the money going? */}
            <CategoryPie transactions={transactions} />

            {/* Top Categories List */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Spending</Text>
              <View style={styles.statsList}>
                {stats.topCategories.map((item, index) => (
                  <View key={item.id} style={[styles.statItem, { backgroundColor: colors.surface }]}>
                    <View style={[styles.dot, { backgroundColor: item.category?.color }]} />
                    <Text style={[styles.statLabel, { color: colors.text }]}>{item.category?.name}</Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>{formatAmount(item.amount)}</Text>
                  </View>
                ))}
              </View>
            </View>

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
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
  },
  comparisonCard: {
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '800',
  },
  divider: {
    width: 1,
    height: 40,
    marginHorizontal: 24,
  },
  changeContainer: {
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  badgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
  badgeSubtext: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsList: {
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  statLabel: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
  },
  statValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
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
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  investmentPlanCard: {
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  investmentInfo: {
    flex: 1,
  },
  investmentTitle: {
    color: '#FFF',
    fontSize: Typography.sizes.base,
    fontWeight: '800',
    marginBottom: 4,
  },
  investmentSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '600',
  },
  investmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});