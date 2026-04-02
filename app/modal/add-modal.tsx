// app/modal/add-goal.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto  from "expo-crypto"
import { useFinanceStore } from '@/store/useFinanceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Goal } from '@/types';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Button } from '@/components/ui/Button';

export default function AddGoalModal() {
  const router = useRouter();
  const addGoal = useFinanceStore((state) => state.addGoal);
  const user = useAuthStore((state) => state.user);

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const handleSave = () => {
    const parsedAmount = parseFloat(targetAmount.replace(',', '.'));
    
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please give your goal a name.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid target amount greater than 0.');
      return;
    }

    const newGoal: Goal = {
      id: Crypto.randomUUID(),
      userId: user?.uid || 'anonymous',
      title: title.trim(),
      targetAmount: parsedAmount,
      currentAmount: 0,
      deadline: Date.now() + 2592000000, // Default to 30 days from now for this demo
      createdAt: Date.now(),
      isCompleted: false,
    };

    addGoal(newGoal);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <View style={{ width: 40 }} /> 
        <Text style={styles.headerTitle}>New Goal</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.light.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Goal Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., New Laptop, Emergency Fund"
            placeholderTextColor={Colors.light.tabIconDefault}
            value={title}
            onChangeText={setTitle}
            maxLength={40}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={Colors.light.tabIconDefault}
              keyboardType="decimal-pad"
              value={targetAmount}
              onChangeText={setTargetAmount}
            />
          </View>
        </View>

        <Button title="Create Goal" onPress={handleSave} style={styles.submitButton} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 16,
    fontSize: Typography.sizes.base,
    color: Colors.light.text,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  submitButton: {
    marginTop: 'auto',
    marginBottom: 32,
  }
});