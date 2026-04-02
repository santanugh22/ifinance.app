// components/forms/TransactionForm.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { TransactionType } from '@/types';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { CategoryPicker } from '../ui/CategoryPicker';
import { Button } from '../ui/Button';

import { useSettingsStore } from '@/store/useSettingsStore';
import { useThemeColor } from '@/hooks/useThemeColor';

interface TransactionFormProps {
  initialType?: TransactionType;
  onSubmit: (data: { amount: number; type: TransactionType; categoryId: string; notes: string }) => void;
}

export function TransactionForm({ initialType = 'expense', onSubmit }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  
  const { selectedCurrency } = useSettingsStore();
  const colors = useThemeColor();

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid number greater than 0.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Missing Category', 'Please select a category for this transaction.');
      return;
    }

    onSubmit({
      amount: parsedAmount,
      type,
      categoryId,
      notes: notes.trim(),
    });
  };

  return (
    <View style={styles.container}>
      {/* Type Toggle */}
      <View style={[styles.toggleContainer, { backgroundColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.toggleButton, type === 'expense' && { backgroundColor: colors.danger }]}
          onPress={() => { setType('expense'); setCategoryId(null); }}
        >
          <Text style={[styles.toggleText, { color: colors.tabIconDefault }, type === 'expense' && styles.toggleTextActive]}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, type === 'income' && { backgroundColor: colors.success }]}
          onPress={() => { setType('income'); setCategoryId(null); }}
        >
          <Text style={[styles.toggleText, { color: colors.tabIconDefault }, type === 'income' && styles.toggleTextActive]}>Income</Text>
        </TouchableOpacity>
      </View>

      {/* Amount Input */}
      <View style={styles.amountContainer}>
        <Text style={[styles.currencySymbol, { color: colors.text }]}>{selectedCurrency.symbol}</Text>
        <TextInput
          style={[styles.amountInput, { color: colors.text }]}
          placeholder="0.00"
          placeholderTextColor={colors.tabIconDefault}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          maxLength={10}
          autoFocus
        />
      </View>

      <CategoryPicker type={type} selectedId={categoryId} onSelect={setCategoryId} />

      {/* Notes Input */}
      <View style={styles.notesContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Notes (Optional)</Text>
        <TextInput
          style={[styles.notesInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          placeholder="What was this for?"
          placeholderTextColor={colors.tabIconDefault}
          value={notes}
          onChangeText={setNotes}
          maxLength={100}
        />
      </View>

      <Button title="Save Transaction" onPress={handleSubmit} style={styles.submitButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFF',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  currencySymbol: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: 'bold',
    minWidth: 100,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: Typography.sizes.base,
  },
  submitButton: {
    marginTop: 'auto',
    marginBottom: 24,
  }
});