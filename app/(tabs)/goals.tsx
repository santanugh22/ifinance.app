// app/(tabs)/goals.tsx

import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { GoalCard } from '@/components/features/GoalCard';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeInUp, FadeIn } from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/useThemeColor';
import { AIService } from '@/services/AIService';

export default function GoalsScreen() {
  const router = useRouter();
  const { 
    goals, 
    transactions,
    challenges, 
    toggleChallenge, 
    lastChallengeUpdate, 
    setAiInsights,
    canRefreshAi
  } = useFinanceStore();
  const { selectedCurrency } = useSettingsStore();
  const colors = useThemeColor();

  const [isRefreshingChallenges, setIsRefreshingChallenges] = useState(false);

  const activeGoals = useMemo(() => goals.filter(g => !g.isCompleted), [goals]);
  const completedGoals = useMemo(() => goals.filter(g => g.isCompleted), [goals]);

  const checkAndRefreshChallenges = async () => {
    const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    const needsRefresh = !lastChallengeUpdate || (now - lastChallengeUpdate > FIVE_DAYS_MS);
    
    if (needsRefresh && transactions.length >= 3) {
      try {
        setIsRefreshingChallenges(true);
        const data = await AIService.getInsights(transactions, goals, selectedCurrency.symbol);
        setAiInsights(data);
      } catch (err) {
        console.error('Failed to auto-refresh challenges:', err);
      } finally {
        setIsRefreshingChallenges(false);
      }
    }
  };

  useEffect(() => {
    checkAndRefreshChallenges();
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Goals & Challenges</Text>
          <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>Personalized AI-powered path to success</Text>
        </View>

        {/* Savings Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Goals</Text>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/modal/add-goal' as any)}
            >
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>New Goal</Text>
            </TouchableOpacity>
          </View>

          {activeGoals.length === 0 ? (
            <View style={[styles.emptyGoalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="flag-outline" size={32} color={colors.tabIconDefault} />
              <Text style={[styles.emptyGoalText, { color: colors.tabIconDefault }]}>No active goals. Start saving for something special!</Text>
            </View>
          ) : (
            activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))
          )}
        </View>

        {/* Challenges Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Smart Challenges</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.tabIconDefault }]}>Personalized for your habits</Text>
            </View>
            {isRefreshingChallenges && (
              <Animated.View entering={FadeIn} style={styles.refreshingIndicator}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.refreshingText, { color: colors.primary }]}>AI Generating...</Text>
              </Animated.View>
            )}
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.challengeScroll}
            contentContainerStyle={styles.challengeContent}
          >
            {challenges.length === 0 && !isRefreshingChallenges ? (
               <View style={[styles.emptyChallengePlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="sparkles-outline" size={24} color={colors.tabIconDefault} />
                  <Text style={[styles.emptyChallengeText, { color: colors.tabIconDefault }]}>Generating personalized challenges...</Text>
               </View>
            ) : (
              challenges.map((challenge, index) => (
                <Animated.View 
                  key={challenge.id} 
                  entering={FadeInRight.delay(index * 100)}
                  style={[
                    styles.challengeCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    challenge.isActive && { borderColor: colors.primary, backgroundColor: `${colors.primary}05` }
                  ]}
                >
                  <View style={styles.challengeHeader}>
                    <View style={[styles.challengeIcon, { backgroundColor: challenge.isActive ? colors.primary : `${colors.tabIconDefault}15` }]}>
                      <Ionicons 
                        name={challenge.icon as any} 
                        size={20} 
                        color={challenge.isActive ? '#FFF' : colors.tabIconDefault} 
                      />
                    </View>
                    <Text style={[styles.challengeStatus, { color: challenge.isActive ? colors.primary : colors.tabIconDefault }]}>
                      {challenge.isActive ? 'Active' : 'AI Analysis'}
                    </Text>
                  </View>
                  
                  <Text style={[styles.challengeTitle, { color: colors.text }]}>{challenge.title}</Text>
                  <Text style={[styles.challengeDesc, { color: colors.tabIconDefault }]} numberOfLines={2}>{challenge.description}</Text>
                  
                  <View style={styles.challengeProgress}>
                    <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { backgroundColor: colors.primary, width: `${(challenge.currentDays / challenge.targetDays) * 100}%` }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.progressText, { color: colors.tabIconDefault }]}>{challenge.currentDays}/{challenge.targetDays} Days</Text>
                  </View>

                  <TouchableOpacity 
                    style={[
                      styles.challengeButton,
                      challenge.isActive ? { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 } : { backgroundColor: colors.primary }
                    ]}
                    onPress={() => toggleChallenge(challenge.id)}
                  >
                    <Text style={[
                      styles.challengeButtonText,
                      { color: challenge.isActive ? colors.danger : '#FFF' }
                    ]}>
                      {challenge.isActive ? 'Stop Challenge' : 'Take the Hub'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))
            )}
          </ScrollView>
        </View>

        {completedGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Completed</Text>
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </View>
        )}
      </ScrollView>
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
  contentContainer: {
    padding: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: Typography.sizes.sm,
    marginTop: 4,
  },
  refreshingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshingText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  addButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: '#FFF',
  },
  emptyGoalCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  emptyGoalText: {
    marginTop: 12,
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '80%',
  },
  challengeScroll: {
    marginHorizontal: -24,
    marginTop: 16,
  },
  challengeContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  challengeCard: {
    width: 240,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
  },
  emptyChallengePlaceholder: {
    width: 240,
    height: 200,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyChallengeText: {
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeStatus: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  challengeTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: '800',
    marginBottom: 4,
  },
  challengeDesc: {
    fontSize: Typography.sizes.xs,
    height: 32,
    lineHeight: 16,
    marginBottom: 16,
  },
  challengeProgress: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '700',
  },
  challengeButton: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  challengeButtonText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
  },
  streakIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: '800',
  },
  streakDesc: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
  },
  streakCount: {
    fontSize: 32,
    fontWeight: '900',
  }
});
