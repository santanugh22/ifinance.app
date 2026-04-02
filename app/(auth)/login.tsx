import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useBiometrics } from '@/hooks/useBiometrics';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const { authenticate, isCompatible } = useBiometrics();
  const { isBiometricsEnabled, setBiometricsEnabled } = useAuthStore();
  const colors = useThemeColor();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both your email and password.');
      return;
    }
    
    setLoading(true);
    try {
      if (isSignUp) {
        await auth().createUserWithEmailAndPassword(email, password);
      } else {
        await auth().signInWithEmailAndPassword(email, password);
      }
    } catch (error: any) {
      let message = error.message;
      if (error.code === 'auth/user-not-found') message = 'No account found with this email.';
      if (error.code === 'auth/wrong-password') message = 'Incorrect password.';
      if (error.code === 'auth/email-already-in-use') message = 'An account already exists with this email.';
      
      Alert.alert(isSignUp ? 'Registration Failed' : 'Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    const success = await authenticate();
    if (success) {
      setLoading(true);
      try {
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
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headerContainer}>
        <View style={[styles.logoBadge, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
          <Text style={styles.logoText}>$</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
        <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>Your premium personal finance companion</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="name@email.com"
            placeholderTextColor={colors.tabIconDefault}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Password</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Min. 8 characters"
            placeholderTextColor={colors.tabIconDefault}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
        </View>

        <Button 
          title={isSignUp ? 'Sign Up' : 'Log In'} 
          onPress={handleAuth} 
          isLoading={loading} 
          style={styles.submitButton}
        />

        <TouchableOpacity 
          onPress={() => setIsSignUp(!isSignUp)} 
          style={styles.toggleContainer}
          disabled={loading}
        >
          <Text style={[styles.toggleLabel, { color: colors.tabIconDefault }]}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Text style={[styles.toggleAction, { color: colors.primary }]}>{isSignUp ? 'Log In' : 'Sign Up'}</Text>
          </Text>
        </TouchableOpacity>

        {isCompatible && !isSignUp && (
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.tabIconDefault }]}>OR</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>
        )}

        {isCompatible && !isSignUp && (
          <Button 
            title="Sign in with Face ID" 
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
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: '600',
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: Typography.sizes.base,
  },
  submitButton: {
    marginTop: 8,
  },
  toggleContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  toggleLabel: {
    fontSize: Typography.sizes.sm,
  },
  toggleAction: {
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 16,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  }
});