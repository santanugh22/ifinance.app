// components/ui/QuickActions.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { useRouter } from 'expo-router';

export function QuickActions() {
  const router = useRouter();

  const handleAction = (type: 'income' | 'expense') => {
    // We will pass the type as a query parameter to our modal later
    router.push({ pathname: '/modal/add-transaction', params: { type } });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={() => handleAction('expense')}
        activeOpacity={0.7}
      >
        <View style={[styles.iconCircle, { backgroundColor: `${Colors.light.danger}15` }]}>
          <Ionicons name="remove" size={24} color={Colors.light.danger} />
        </View>
        <Text style={styles.label}>Spend</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={() => handleAction('income')}
        activeOpacity={0.7}
      >
        <View style={[styles.iconCircle, { backgroundColor: `${Colors.light.success}15` }]}>
          <Ionicons name="add" size={24} color={Colors.light.success} />
        </View>
        <Text style={styles.label}>Receive</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={() => router.push('/(tabs)/goals')}
        activeOpacity={0.7}
      >
        <View style={[styles.iconCircle, { backgroundColor: `${Colors.light.primary}15` }]}>
          <Ionicons name="flag" size={20} color={Colors.light.primary} />
        </View>
        <Text style={styles.label}>Goal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 12,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: '500',
    color: Colors.light.text,
  },
});