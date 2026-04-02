// components/features/GoalCard.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Goal } from '@/types';
import { Typography } from '@/constants/Typography';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useThemeColor } from '@/hooks/useThemeColor';

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const updateGoalAmount = useFinanceStore((state) => state.updateGoalAmount);
  const { formatAmount } = useSettingsStore();
  const colors = useThemeColor();

  const [isAdding, setIsAdding] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  
  const progressPercent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withSpring(progressPercent, { damping: 20, stiffness: 90 });
  }, [progressPercent]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handleAddFunds = () => {
    const amount = parseFloat(addAmount);
    if (!isNaN(amount) && amount > 0) {
      updateGoalAmount(goal.id, amount);
      setIsAdding(false);
      setAddAmount('');
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{goal.title}</Text>
        {goal.isCompleted && (
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
        )}
      </View>

      <View style={styles.amounts}>
        <Text style={[styles.current, { color: colors.text }]}>{formatAmount(goal.currentAmount)}</Text>
        <Text style={[styles.target, { color: colors.tabIconDefault }]}>/ {formatAmount(goal.targetAmount)}</Text>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <Animated.View style={[
          styles.progressFill, 
          animatedProgressStyle,
          { backgroundColor: colors.primary },
          goal.isCompleted && { backgroundColor: colors.success }
        ]} />
      </View>
      <Text style={[styles.percentText, { color: colors.tabIconDefault }]}>{progressPercent.toFixed(1)}% Completed</Text>

      {!goal.isCompleted && (
        <View style={[styles.actionContainer, { borderTopColor: colors.border }]}>
          {isAdding ? (
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Amount to add..."
                placeholderTextColor={colors.tabIconDefault}
                keyboardType="decimal-pad"
                value={addAmount}
                onChangeText={setAddAmount}
                autoFocus
              />
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleAddFunds}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAdding(false)}>
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addBtn} onPress={() => setIsAdding(true)}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={[styles.addBtnText, { color: colors.primary }]}>Add Funds</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: Typography.sizes.base,
    fontWeight: '600',
  },
  amounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  current: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: 'bold',
  },
  target: {
    fontSize: Typography.sizes.sm,
    marginLeft: 4,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentText: {
    fontSize: Typography.sizes.xs,
    textAlign: 'right',
  },
  actionContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addBtnText: {
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  saveBtn: {
    paddingHorizontal: 16,
    height: 40,
    justifyContent: 'center',
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  cancelBtn: {
    padding: 8,
  }
});