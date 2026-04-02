// components/forms/GoalForm.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Switch, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Button } from '../ui/Button';

interface GoalFormProps {
  onSubmit: (data: { 
    title: string; 
    targetAmount: number; 
    deadline: number;
    reminderEnabled: boolean;
    reminderHour: number;
    reminderMinute: number;
  }) => void;
}

import { useSettingsStore } from '@/store/useSettingsStore';
import { useThemeColor } from '@/hooks/useThemeColor';

export function GoalForm({ onSubmit }: GoalFormProps) {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('30'); // Default 30 days
  const [reminderEnabled, setReminderEnabled] = useState(true);
  
  const { selectedCurrency } = useSettingsStore();
  const colors = useThemeColor();

  const handleSubmit = () => {
    const parsedAmount = parseFloat(targetAmount.replace(',', '.'));
    const parsedDays = parseInt(deadlineDays, 10);
    
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a name for your goal.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid target amount greater than 0.');
      return;
    }
    if (isNaN(parsedDays) || parsedDays <= 0) {
      Alert.alert('Invalid Deadline', 'Please enter a valid number of days.');
      return;
    }

    const deadlineTimestamp = Date.now() + (parsedDays * 24 * 60 * 60 * 1000);

    onSubmit({
      title: title.trim(),
      targetAmount: parsedAmount,
      deadline: deadlineTimestamp,
      reminderEnabled,
      reminderHour: 9, // Default to 9:00 AM
      reminderMinute: 0,
    });
  };

  return (
    <View style={styles.container}>
      {/* Title Input */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Goal Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., New Laptop, Vacation..."
          placeholderTextColor={colors.tabIconDefault}
          value={title}
          onChangeText={setTitle}
          maxLength={40}
          autoFocus
        />
      </View>

      {/* Target Amount */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Target Amount ({selectedCurrency.symbol})</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          placeholder="0.00"
          placeholderTextColor={colors.tabIconDefault}
          keyboardType="decimal-pad"
          value={targetAmount}
          onChangeText={setTargetAmount}
          maxLength={10}
        />
      </View>

      {/* Deadline (Days from now) */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Days to reach goal</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          placeholder="30"
          placeholderTextColor={colors.tabIconDefault}
          keyboardType="number-pad"
          value={deadlineDays}
          onChangeText={setDeadlineDays}
          maxLength={4}
        />
        <Text style={[styles.helperText, { color: colors.tabIconDefault }]}>We'll help you track your progress daily.</Text>
      </View>

      {/* Reminder Toggle */}
      <View style={[styles.reminderContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.reminderTextContainer}>
          <Text style={[styles.reminderLabel, { color: colors.text }]}>Daily Reminder</Text>
          <Text style={[styles.reminderSubLabel, { color: colors.tabIconDefault }]}>Get a nudge to save every morning</Text>
        </View>
        <Switch
          value={reminderEnabled}
          onValueChange={setReminderEnabled}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={Platform.OS === 'ios' ? undefined : (reminderEnabled ? '#FFF' : '#f4f3f4')}
        />
      </View>

      <Button title="Create Saving Goal" onPress={handleSubmit} style={styles.submitButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: Typography.sizes.base,
  },
  helperText: {
    fontSize: Typography.sizes.xs,
    marginTop: 6,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 24,
  },
  reminderTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  reminderLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    marginBottom: 4,
  },
  reminderSubLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 'auto',
    marginBottom: 24,
  }
});
