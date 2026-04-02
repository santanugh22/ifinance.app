// components/ui/SettingsItem.tsx
import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

interface SettingsItemProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}

import { useThemeColor } from '@/hooks/useThemeColor';

export function SettingsItem({ 
  label, 
  icon, 
  value, 
  onValueChange, 
  onPress, 
  rightElement,
  destructive = false 
}: SettingsItemProps) {
  const colors = useThemeColor();

  const content = (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }, destructive && { backgroundColor: `${colors.danger}15` }]}>
        <Ionicons name={icon} size={20} color={destructive ? colors.danger : colors.primary} />
      </View>
      <Text style={[styles.label, { color: colors.text }, destructive && { color: colors.danger }]}>{label}</Text>
      {onValueChange !== undefined ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFF"
        />
      ) : (
        rightElement || <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${Colors.light.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  destructiveIcon: {
    backgroundColor: `${Colors.light.danger}15`,
  },
  label: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.light.text,
    fontWeight: '500',
  },
  destructiveText: {
    color: Colors.light.danger,
  },
});
