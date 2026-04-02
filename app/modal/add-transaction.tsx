// app/modal/add-transaction.tsx

import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Transaction, TransactionType } from '@/types';
import { Colors } from '@/constants/Colors';
import uuid from 'react-native-uuid'; 

import { useThemeColor } from '@/hooks/useThemeColor';

export default function AddTransactionModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialType = (params.type as TransactionType) || 'expense';
  
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const user = useAuthStore((state) => state.user);
  const colors = useThemeColor();

  const handleSave = (data: { amount: number; type: TransactionType; categoryId: string; notes: string }) => {
    const newTransaction: Transaction = {
      id: uuid.v4() as string,
      userId: user?.uid || 'anonymous',
      amount: data.amount,
      type: data.type,
      categoryId: data.categoryId,
      notes: data.notes,
      date: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    addTransaction(newTransaction);
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        {/* We use an empty view to balance the flex layout for centering the close button */}
        <View style={{ width: 40 }} /> 
        <TouchableOpacity onPress={() => router.back()} style={[styles.closeButton, { backgroundColor: colors.surface }]}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <TransactionForm initialType={initialType} onSubmit={handleSave} />
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
    paddingTop: Platform.OS === 'ios' ? 60 : 24, // Safe area handling
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  }
});