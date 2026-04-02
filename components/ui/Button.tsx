// components/ui/Button.tsx

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
}

export function Button({ 
  title, 
  variant = 'primary', 
  isLoading = false, 
  style, 
  disabled, 
  ...props 
}: ButtonProps) {
  
  const getBackgroundColor = () => {
    switch (variant) {
      case 'secondary': return Colors.light.surface;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      case 'primary':
      default: return Colors.light.primary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'secondary': return Colors.light.text;
      case 'outline': return Colors.light.primary;
      case 'ghost': return Colors.light.tabIconDefault;
      case 'primary':
      default: return '#FFFFFF';
    }
  };

  const getBorder = () => {
    if (variant === 'outline') {
      return { borderWidth: 1, borderColor: Colors.light.primary };
    }
    return {};
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        getBorder(),
        (disabled || isLoading) && styles.disabled,
        style,
      ]}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: Typography.sizes.base,
    // Note: Cast to 'any' due to React Native typings for specific font weights
    fontWeight: Typography.weights.semibold as any, 
  },
});