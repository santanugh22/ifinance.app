// app/modal/add-goal.tsx

import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GoalForm } from '@/components/forms/GoalForm';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Goal } from '@/types';
import { Colors } from '@/constants/Colors';
import uuid from 'react-native-uuid';

import { useThemeColor } from '@/hooks/useThemeColor';

import { sendGoalSetupNotification, scheduleDailyGoalReminder } from '@/hooks/useNotifications';

export default function AddGoalModal() {
  const router = useRouter();
  const addGoal = useFinanceStore((state) => state.addGoal);
  const user = useAuthStore((state) => state.user);
  const colors = useThemeColor();

  const handleSave = (data: { 
    title: string; 
    targetAmount: number; 
    deadline: number;
    reminderEnabled: boolean;
    reminderHour: number;
    reminderMinute: number;
  }) => {
    const goalId = uuid.v4() as string;
    const newGoal: Goal = {
      id: goalId,
      userId: user?.uid || 'anonymous',
      title: data.title,
      targetAmount: data.targetAmount,
      currentAmount: 0,
      deadline: data.deadline,
      createdAt: Date.now(),
      isCompleted: false,
      reminderEnabled: data.reminderEnabled,
      reminderHour: data.reminderHour,
      reminderMinute: data.reminderMinute,
    };

    addGoal(newGoal);
    
    // Trigger notifications
    sendGoalSetupNotification(data.title);
    if (data.reminderEnabled) {
      scheduleDailyGoalReminder(goalId, data.title, data.reminderHour, data.reminderMinute);
    }

    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>New Goal</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={[styles.closeButton, { backgroundColor: colors.surface }]}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <GoalForm onSubmit={handleSave} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 40 : 24, 
    paddingBottom: 24,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  }
});
