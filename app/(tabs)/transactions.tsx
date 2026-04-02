// app/(tabs)/transactions.tsx

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '@/store/useFinanceStore';
import { TransactionList } from '@/components/lists/TransactionList';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

export default function TransactionsScreen() {
  const transactions = useFinanceStore((state) => state.transactions);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);
  const [searchQuery, setSearchQuery] = useState('');

  // Memoize filtered transactions so we don't recompute on every render unnecessarily
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    
    const lowerQuery = searchQuery.toLowerCase();
    return transactions.filter(tx => 
      (tx.notes && tx.notes.toLowerCase().includes(lowerQuery)) ||
      // We could also join with categories here if we wanted to search by category name
      tx.amount.toString().includes(lowerQuery)
    );
  }, [transactions, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Search Header */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.light.tabIconDefault} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search notes or amounts..."
              placeholderTextColor={Colors.light.tabIconDefault}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* Ledger List */}
        <View style={styles.listContainer}>
          <TransactionList 
            transactions={filteredTransactions} 
            onDelete={deleteTransaction} 
          />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.light.text,
    height: '100%',
  },
  listContainer: {
    flex: 1,
  }
});