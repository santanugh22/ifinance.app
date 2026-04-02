// components/ai/AIGuide.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { AIService } from '@/services/AIService';
import { AIActionCard } from './AIActionCard';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

export function AIGuide() {
  const { transactions, goals, cachedAiInsight, lastAiUpdate, setAiInsights, canRefreshAi } = useFinanceStore();
  const { selectedCurrency } = useSettingsStore();
  const colors = useThemeColor();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async (force: boolean = false) => {
    // 1. Guardrails: Check if we have enough data
    if (transactions.length < 3) {
      setError('Add 3+ transactions to unlock AI insights.');
      return;
    }

    // 2. Cache Logic: If not forced and we have recent insights, skip fetch
    if (!force && cachedAiInsight && lastAiUpdate) {
      const hoursSinceUpdate = (Date.now() - lastAiUpdate) / (1000 * 60 * 60);
      if (hoursSinceUpdate < 12) {
        return; // Use cache
      }
    }

    // 3. Quota Guardrail for manual refresh
    if (force && !canRefreshAi()) {
      Alert.alert('Daily Limit Reached', 'You have used your AI refresh quota for today. Your insights will automatically update tomorrow.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await AIService.getInsights(transactions, goals, selectedCurrency.symbol);
      setAiInsights(data);
    } catch (err: any) {
      setError(err.message || 'Could not reach the AI guide.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (isLoading && !cachedAiInsight) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
        <ActivityIndicator color={colors.primary} size="small" />
        <Text style={[styles.loadingText, { color: colors.tabIconDefault }]}>Analysing your transactions...</Text>
      </View>
    );
  }

  if (error && !cachedAiInsight) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: `${colors.danger}10`, borderColor: colors.danger }]}>
        <Ionicons name="sparkles-outline" size={24} color={colors.danger} />
        <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        <TouchableOpacity onPress={() => fetchInsights(true)} style={styles.retryButton}>
          <Text style={[styles.retryText, { color: colors.primary }]}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!cachedAiInsight && !isLoading) return null;

  return (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.container}>
      {/* AI Summary Section */}
      <View style={[styles.summaryBox, { backgroundColor: colors.surface, borderLeftColor: colors.primary, borderLeftWidth: 4 }]}>
        <View style={styles.header}>
          <View style={[styles.aiBadge, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="sparkles" size={14} color={colors.primary} />
            <Text style={[styles.aiBadgeText, { color: colors.primary }]}>Smart Guide</Text>
          </View>
          <View style={styles.headerRight}>
             {isLoading && <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />}
             <TouchableOpacity onPress={() => fetchInsights(true)} disabled={isLoading}>
                <Ionicons name="refresh" size={18} color={isLoading ? colors.border : colors.tabIconDefault} />
             </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.summaryText, { color: colors.text }]}>{cachedAiInsight?.summary}</Text>
        {lastAiUpdate && (
          <Text style={[styles.updatedText, { color: colors.tabIconDefault }]}>
            Updated {new Date(lastAiUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>

      {/* Generated Recommendation Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.cardScroll}
        contentContainerStyle={styles.cardContent}
      >
        {cachedAiInsight?.insights.map((insight, index) => (
          <AIActionCard key={index} insight={insight} />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  loadingContainer: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 32,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '800',
  },
  summaryBox: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  summaryText: {
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    lineHeight: 24,
  },
  updatedText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 12,
    opacity: 0.7,
  },
  cardScroll: {
    marginHorizontal: -24,
  },
  cardContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
});
