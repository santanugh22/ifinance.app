// app/modal/edit-profile.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';

export default function EditProfileModal() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();
  const colors = useThemeColor();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter a display name.');
      return;
    }

    try {
      setIsLoading(true);
      await updateProfile(displayName.trim());
      Alert.alert('Success', 'Profile updated successfully.');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={[styles.closeButton, { backgroundColor: colors.surface }]}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: colors.text }]}>Display Name</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="person-outline" size={20} color={colors.tabIconDefault} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your name"
              placeholderTextColor={colors.tabIconDefault}
              autoFocus
            />
          </View>
          <Text style={[styles.helperText, { color: colors.tabIconDefault }]}>
            This is how your name will appear across the app.
          </Text>
        </View>

        <View style={styles.spacer} />

        <Button 
          title="Save Changes" 
          onPress={handleSave} 
          isLoading={isLoading}
          style={styles.saveButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 40 : 24,
    paddingBottom: 24,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  inputSection: {
    marginTop: 10,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.base,
    fontWeight: '600',
  },
  helperText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '500',
    marginTop: 8,
    marginLeft: 4,
  },
  spacer: {
    flex: 1,
  },
  saveButton: {
    marginBottom: 40,
  },
});
