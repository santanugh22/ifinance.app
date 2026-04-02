// app/(tabs)/_layout.tsx

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Platform, StyleSheet, View } from 'react-native';

function TabBarIcon({ name, color, focused }: { name: React.ComponentProps<typeof Ionicons>['name']; color: string; focused: boolean }) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconFocused]}>
      <Ionicons name={name} size={24} color={color} style={{ marginBottom: -3 }} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors.light.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.light.border,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: Colors.light.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.light.border,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: Colors.light.text,
        },
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Ledger',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'list' : 'list-outline'} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'pie-chart' : 'pie-chart-outline'} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'flag' : 'flag-outline'} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    padding: 4,
    borderRadius: 12,
  },
  iconFocused: {
    backgroundColor: `${Colors.light.primary}15`, // 15% opacity primary color background
  }
});