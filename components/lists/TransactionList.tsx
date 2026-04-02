// components/lists/TransactionList.tsx

import React, { useMemo } from 'react';
import { SectionList, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Transaction } from '@/types';
import { groupTransactionsByDate } from '@/utils/date';
import { TransactionItem } from './TransactionItem';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { useThemeColor } from '@/hooks/useThemeColor';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function TransactionList({ transactions, onDelete, isLoading = false }: TransactionListProps) {
  const sections = useMemo(() => groupTransactionsByDate(transactions), [transactions]);
  const colors = useThemeColor();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No transactions yet</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Tap the + or - buttons on Home to add one.</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <TransactionItem transaction={item} onDelete={onDelete} />}
      renderSectionHeader={({ section: { title } }) => (
        <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.tabIconDefault }]}>{title}</Text>
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
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 40, // Padding for the bottom tab bar area
  },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});