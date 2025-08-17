import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import colors from '@/constants/colors';
import Button from '@/components/Button';
import { Mail, ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function EmailVerificationScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyOTP, resendOTP, isLoading, error, clearError } = useAuthStore();
  
  const [code, setCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);
  
  const handleVerifyCode = async () => {
    if (!code.trim() || code.length !== 6) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Error', 'Please enter a valid 6-digit verification code');
      return;
    }
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    clearError();
    
    try {
      await verifyOTP(email!, code.trim());
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.replace('/(tabs)/cards');
    } catch (err) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Verification Failed', error || 'Invalid verification code');
    }
  };
  
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    clearError();
    
    try {
      await resendOTP(email!);
      setResendCooldown(60); // 60 second cooldown
      Alert.alert('Code Sent', 'A new verification code has been sent to your email');
    } catch (err) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Error', error || 'Failed to resend verification code');
    }
  };
  
  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar style="light" />
        
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Mail size={48} color={colors.primary} />
          </View>
          
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.description}>
            We&apos;ve sent a 6-digit verification code to{' '}
            <Text style={styles.email}>{email}</Text>
          </Text>
          
          <View style={styles.codeInputContainer}>
            <TextInput
              style={styles.codeInput}
              value={code}
              onChangeText={setCode}
              placeholder="Enter 6-digit code"
              placeholderTextColor={colors.mediumGray}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              returnKeyType="done"
              blurOnSubmit={true}
              onSubmitEditing={handleVerifyCode}
            />
          </View>
          
          <Button
            title={isLoading ? "Verifying..." : "Verify Email"}
            onPress={handleVerifyCode}
            variant="primary"
            style={styles.verifyButton}
            disabled={isLoading || code.length !== 6}
          />
          
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn&apos;t receive the code?</Text>
            <TouchableOpacity 
              onPress={handleResendCode}
              disabled={resendCooldown > 0 || isLoading}
              style={styles.resendButton}
            >
              <Text style={[
                styles.resendButtonText,
                (resendCooldown > 0 || isLoading) && styles.resendButtonTextDisabled
              ]}>
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  email: {
    color: colors.primary,
    fontWeight: '600',
  },
  codeInputContainer: {
    width: '100%',
    marginBottom: 32,
  },
  codeInput: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: '600',
  },
  verifyButton: {
    width: '100%',
    marginBottom: 32,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    color: colors.mediumGray,
  },
});