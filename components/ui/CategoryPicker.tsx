// components/ui/CategoryPicker.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/Categories';
import { TransactionType } from '@/types';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

interface CategoryPickerProps {
  type: TransactionType;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CategoryPicker({ type, selectedId, onSelect }: CategoryPickerProps) {
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Category</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isSelected = selectedId === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                isSelected && { borderColor: category.color, backgroundColor: `${category.color}15` }
              ]}
              onPress={() => onSelect(category.id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer, 
                { backgroundColor: isSelected ? category.color : Colors.light.surface }
              ]}>
                <Ionicons 
                  name={category.icon as any} 
                  size={24} 
                  color={isSelected ? '#FFF' : category.color} 
                />
              </View>
              <Text style={[styles.categoryName, isSelected && { color: category.color, fontWeight: '600' }]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  scrollContent: {
    gap: 12,
    paddingRight: 24, // padding for the end of the scroll
  },
  categoryItem: {
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 16,
    width: 88,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryName: {
    fontSize: Typography.sizes.xs,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
  }
});