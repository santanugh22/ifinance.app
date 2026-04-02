// components/ui/EmptyState.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Button } from './Button';

interface EmptyStateProps {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ iconName, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={48} color={Colors.light.tabIconDefault} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      
      {actionLabel && onAction && (
        <Button 
          title={actionLabel} 
          variant="outline" 
          onPress={onAction} 
          style={styles.actionButton} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.light.background,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  actionButton: {
    minWidth: 200,
  }
});