// components/lists/TransactionItem.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated as RNAnimated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '@/types';
import { getCategoryById } from '@/constants/Categories';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { formatTime } from '@/utils/date';
import Animated, { FadeInUp, Layout, FadeOutDown } from 'react-native-reanimated';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useThemeColor } from '@/hooks/useThemeColor';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

export function TransactionItem({ transaction, onDelete }: TransactionItemProps) {
  const category = getCategoryById(transaction.categoryId);
  const isIncome = transaction.type === 'income';
  const { formatAmount } = useSettingsStore();
  const colors = useThemeColor();

  const renderRightActions = (
    progress: RNAnimated.AnimatedInterpolation<number>,
    dragX: RNAnimated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity 
        style={[styles.deleteAction, { backgroundColor: colors.danger }]} 
        onPress={() => onDelete(transaction.id)}
        activeOpacity={0.8}
      >
        <RNAnimated.View style={[styles.actionIcon, { transform: [{ scale }] }]}>
          <Ionicons name="trash-outline" size={24} color="#FFF" />
        </RNAnimated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View 
      entering={FadeInUp.duration(400)} 
      exiting={FadeOutDown} 
      layout={Layout.springify()}
      style={[styles.wrapper, { backgroundColor: colors.surface }]}
    >
      <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconContainer, { backgroundColor: `${category?.color || colors.tabIconDefault}15` }]}>
            <Ionicons name={(category?.icon as any) || 'help'} size={20} color={category?.color || colors.tabIconDefault} />
          </View>
          
          <View style={styles.detailsContainer}>
            <Text style={[styles.categoryName, { color: colors.text }]}>{category?.name || 'Unknown'}</Text>
            <Text style={[styles.time, { color: colors.textSecondary }]}>{formatTime(transaction.date)}{transaction.notes ? ` • ${transaction.notes}` : ''}</Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={[styles.amount, { color: isIncome ? colors.success : colors.text }]}>
              {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
            </Text>
          </View>
        </View>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: Typography.sizes.base,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  time: {
    fontSize: Typography.sizes.xs,
  },
  amountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: Typography.sizes.base,
    fontWeight: '700',
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  actionIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});