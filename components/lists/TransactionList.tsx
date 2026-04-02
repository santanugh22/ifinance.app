// components/lists/TransactionList.tsx

import React, { useMemo } from 'react';
import { SectionList, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Transaction } from '@/types';
import { groupTransactionsByDate } from '@/utils/date';
import { TransactionItem } from './TransactionItem';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function TransactionList({ transactions, onDelete, isLoading = false }: TransactionListProps) {
  const sections = useMemo(() => groupTransactionsByDate(transactions), [transactions]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No transactions yet</Text>
        <Text style={styles.emptySubtitle}>Tap the + or - buttons on Home to add one.</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <TransactionItem transaction={item} onDelete={onDelete} />}
      renderSectionHeader={({ section: { title } }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 40, // Padding for the bottom tab bar area
  },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: Colors.light.background,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    color: Colors.light.tabIconDefault,
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});