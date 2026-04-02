import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Goal } from '@/types';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SavingsGoalWidgetProps {
  goal: Goal;
}

export function SavingsGoalWidget({ goal }: SavingsGoalWidgetProps) {
  const { formatAmount } = useSettingsStore();
  const colors = useThemeColor();
  const progressPercent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
          <Ionicons name="flag" size={16} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{goal.title}</Text>
        <Text style={[styles.percentText, { color: colors.primary }]}>{progressPercent.toFixed(0)}%</Text>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: colors.primary }]} />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.amountText, { color: colors.tabIconDefault }]}>
          {formatAmount(goal.currentAmount)} / {formatAmount(goal.targetAmount)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
  },
  percentText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
  }
});
