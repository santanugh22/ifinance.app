// components/ui/SummaryCard.tsx

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SummaryCardProps {
  balance: number;
  income: number;
  expense: number;
}

export function SummaryCard({ balance, income, expense }: SummaryCardProps) {
  const { formatAmount } = useSettingsStore();
  const colors = useThemeColor();

  return (
    <Animated.View 
      entering={FadeInUp.duration(600).delay(100)}
      style={[styles.container, { shadowColor: colors.primary }]}
    >
      <LinearGradient
        colors={colors.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>{formatAmount(balance)}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="arrow-down-circle" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={styles.statValue}>{formatAmount(income)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="arrow-up-circle" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.statLabel}>Expenses</Text>
              <Text style={styles.statValue}>{formatAmount(expense)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    borderRadius: 24,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  balanceContainer: {
    marginBottom: 28,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: Typography.sizes['4xl'],
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.sm,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
});