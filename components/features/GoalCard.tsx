// components/features/GoalCard.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Goal } from '@/types';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { useFinanceStore } from '@/store/useFinanceStore';

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const updateGoalAmount = useFinanceStore((state) => state.updateGoalAmount);
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
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{goal.title}</Text>
        {goal.isCompleted && (
          <Ionicons name="checkmark-circle" size={24} color={Colors.light.success} />
        )}
      </View>

      <View style={styles.amounts}>
        <Text style={styles.current}>${goal.currentAmount.toLocaleString()}</Text>
        <Text style={styles.target}>/ ${goal.targetAmount.toLocaleString()}</Text>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View style={[
          styles.progressFill, 
          animatedProgressStyle,
          goal.isCompleted && { backgroundColor: Colors.light.success }
        ]} />
      </View>
      <Text style={styles.percentText}>{progressPercent.toFixed(1)}% Completed</Text>

      {!goal.isCompleted && (
        <View style={styles.actionContainer}>
          {isAdding ? (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Amount to add..."
                placeholderTextColor={Colors.light.tabIconDefault}
                keyboardType="decimal-pad"
                value={addAmount}
                onChangeText={setAddAmount}
                autoFocus
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddFunds}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAdding(false)}>
                <Ionicons name="close" size={20} color={Colors.light.text} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addBtn} onPress={() => setIsAdding(true)}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.light.primary} />
              <Text style={styles.addBtnText}>Add Funds</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
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
    color: Colors.light.text,
  },
  amounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  current: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  target: {
    fontSize: Typography.sizes.sm,
    color: Colors.light.tabIconDefault,
    marginLeft: 4,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  percentText: {
    fontSize: Typography.sizes.xs,
    color: Colors.light.tabIconDefault,
    textAlign: 'right',
  },
  actionContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 16,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addBtnText: {
    color: Colors.light.primary,
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
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  saveBtn: {
    backgroundColor: Colors.light.primary,
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