// components/features/StreakWidget.tsx

import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { Transaction } from '@/types';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

interface StreakWidgetProps {
  transactions: Transaction[];
}

export function StreakWidget({ transactions }: StreakWidgetProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const { currentStreak, noSpendDaysThisMonth } = useMemo(() => {
    // 1. Group expenses by day (YYYY-MM-DD)
    const expenseDays = new Set<string>();
    transactions.forEach(tx => {
      if (tx.type === 'expense') {
        const d = new Date(tx.date);
        expenseDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      }
    });

    const today = new Date();
    let streak = 0;
    let checkingDate = new Date(today);

    // 2. Calculate Current Streak (looking backwards from today)
    while (true) {
      const dateStr = `${checkingDate.getFullYear()}-${checkingDate.getMonth()}-${checkingDate.getDate()}`;
      if (!expenseDays.has(dateStr)) {
        streak++;
        checkingDate.setDate(checkingDate.getDate() - 1);
      } else {
        break;
      }
    }

    // 3. Calculate total no-spend days this month
    let monthlyNoSpend = 0;
    const currentMonth = today.getMonth();
    for (let i = 1; i <= today.getDate(); i++) {
      const d = new Date(today.getFullYear(), currentMonth, i);
      const dStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!expenseDays.has(dStr)) {
        monthlyNoSpend++;
      }
    }

    return { currentStreak, noSpendDaysThisMonth: monthlyNoSpend };
  }, [transactions]);

  const isStreakActive = currentStreak > 0;

  return (
    <View style={styles.container}>
      <View style={styles.streakInfo}>
        <Text style={styles.title}>No-Spend Streak</Text>
        <Text style={styles.subtitle}>
          {noSpendDaysThisMonth} {noSpendDaysThisMonth === 1 ? 'day' : 'days'} saved this month
        </Text>
      </View>
      
      <View style={styles.flameContainer}>
        <Animated.View style={[styles.iconWrapper, isStreakActive && animatedStyle]}>
          <Ionicons 
            name={isStreakActive ? "flame" : "flame-outline"} 
            size={36} 
            color={isStreakActive ? Colors.light.warning : Colors.light.tabIconDefault} 
          />
        </Animated.View>
        <Text style={[styles.streakCount, isStreakActive && { color: Colors.light.warning }]}>
          {currentStreak}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  streakInfo: {
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.light.tabIconDefault,
  },
  flameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginBottom: 4,
  },
  streakCount: {
    fontSize: Typography.sizes.xl,
    fontWeight: '900',
    color: Colors.light.tabIconDefault,
  }
});