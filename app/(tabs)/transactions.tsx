import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '@/store/useFinanceStore';
import { TransactionList } from '@/components/lists/TransactionList';
import { FilterBar } from '@/components/ui/FilterBar';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/Categories';

import { useThemeColor } from '@/hooks/useThemeColor';

const TYPE_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'expense', label: 'Expenses' },
  { id: 'income', label: 'Income' },
];

export default function TransactionsScreen() {
  const transactions = useFinanceStore((state) => state.transactions);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);
  const colors = useThemeColor();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    const base = [{ id: 'all', label: 'All Categories' }];
    if (selectedType === 'expense') {
      return [...base, ...EXPENSE_CATEGORIES.map(c => ({ id: c.id, label: c.name }))];
    }
    if (selectedType === 'income') {
      return [...base, ...INCOME_CATEGORIES.map(c => ({ id: c.id, label: c.name }))];
    }
    return base;
  }, [selectedType]);

  // Combined filtering logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = !searchQuery.trim() || 
        (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tx.amount.toString().includes(searchQuery);
      
      const matchesType = selectedType === 'all' || tx.type === selectedType;
      
      const matchesCategory = selectedCategory === 'all' || tx.categoryId === selectedCategory;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchQuery, selectedType, selectedCategory]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        
        {/* Search & Filter Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.tabIconDefault} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search notes or amounts..."
              placeholderTextColor={colors.tabIconDefault}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        <View style={[styles.filterSection, { borderBottomColor: colors.border }]}>
          <FilterBar 
            options={TYPE_OPTIONS} 
            selectedId={selectedType} 
            onSelect={(id) => {
              setSelectedType(id);
              setSelectedCategory('all'); // Reset category when type changes
            }} 
          />
          {categories.length > 1 && (
            <FilterBar 
              options={categories} 
              selectedId={selectedCategory} 
              onSelect={setSelectedCategory} 
            />
          )}
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
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.base,
    height: '100%',
  },
  filterSection: {
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  listContainer: {
    flex: 1,
  }
});