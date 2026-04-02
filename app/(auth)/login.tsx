// app/(auth)/login.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useBiometrics } from '@/hooks/useBiometrics';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Button } from '@/components/ui/Button';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { authenticate, isSupported } = useBiometrics();
  const { isBiometricsEnabled, setBiometricsEnabled } = useAuthStore();

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both your email and password.');
      return;
    }
    
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      // Seamlessly register the user if the account does not exist
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
           await auth().createUserWithEmailAndPassword(email, password);
        } catch (signUpError: any) {
           Alert.alert('Registration Failed', signUpError.message);
        }
      } else {
        Alert.alert('Authentication Failed', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    const success = await authenticate('Login to your Finance Companion');
    if (success) {
      setLoading(true);
      try {
         // Using anonymous auth to establish a secure local Firebase session via biometrics
         await auth().signInAnonymously();
         if (!isBiometricsEnabled) {
           setBiometricsEnabled(true);
         }
      } catch (e) {
         Alert.alert('Error', 'Biometric login failed to establish a session.');
      } finally {
         setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Your personal finance companion</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor={Colors.light.tabIconDefault}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.light.tabIconDefault}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <Button 
          title="Continue" 
          onPress={handleEmailLogin} 
          isLoading={loading} 
          style={styles.submitButton}
        />

        {isSupported && (
          <Button 
            title="Login with Face ID / Touch ID" 
            variant="ghost" 
            onPress={handleBiometricLogin} 
            disabled={loading}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold as any,
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.light.tabIconDefault,
  },
  formContainer: {
    gap: 16,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 16,
    fontSize: Typography.sizes.base,
    color: Colors.light.text,
  },
  submitButton: {
    marginTop: 8,
  }
});