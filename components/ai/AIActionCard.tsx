// components/ai/AIActionCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/constants/Typography';
import { useThemeColor } from '@/hooks/useThemeColor';
import { AIInsight } from '@/types';

interface AIActionCardProps {
  insight: AIInsight;
}

export function AIActionCard({ insight }: AIActionCardProps) {
  const colors = useThemeColor();

  const getIcon = () => {
    switch (insight.type) {
      case 'savings': return 'cash-outline';
      case 'investment': return 'trending-up-outline';
      case 'spending': return 'receipt-outline';
      case 'habit': return 'calendar-outline';
      default: return 'bulb-outline';
    }
  };

  const getImpactColor = () => {
    switch (insight.impact) {
      case 'high': return colors.primary;
      case 'medium': return colors.success;
      case 'low': return colors.tabIconDefault;
    }
  };

  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: colors.surface, 
        borderColor: colors.border,
        shadowOpacity: colors.background === '#121212' ? 0 : 0.05,
        elevation: colors.background === '#121212' ? 0 : 2,
      }
    ]}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${getImpactColor()}15` }]}>
          <Ionicons name={getIcon() as any} size={20} color={getImpactColor()} />
        </View>
        <View style={[styles.impactBadge, { backgroundColor: `${getImpactColor()}10` }]}>
          <Text style={[styles.impactText, { color: getImpactColor() }]}>{insight.impact} impact</Text>
        </View>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{insight.title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={3}>
        {insight.description}
      </Text>

      <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
        <Text style={styles.actionText}>{insight.action}</Text>
        <Ionicons name="chevron-forward" size={14} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  impactText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: Typography.sizes.base,
    fontWeight: '800',
    marginBottom: 6,
  },
  description: {
    fontSize: Typography.sizes.xs,
    lineHeight: 16,
    marginBottom: 16,
    height: 48,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  actionText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
