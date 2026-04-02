// components/utils/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconWrapper}>
              <Ionicons name="alert-circle" size={64} color={Colors.light.danger} />
            </View>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              An unexpected error occurred. We've been notified and are working on it.
            </Text>
            
            {__DEV__ && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{this.state.error?.toString()}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconWrapper: {
    marginBottom: 24,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  errorBox: {
    backgroundColor: `${Colors.light.danger}10`,
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 32,
  },
  errorText: {
    fontFamily: 'Courier',
    fontSize: Typography.sizes.xs,
    color: Colors.light.danger,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.base,
    fontWeight: 'bold',
  },
});
