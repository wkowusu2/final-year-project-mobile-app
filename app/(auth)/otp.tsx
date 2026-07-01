import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AUTH_ROLE } from '@/src/constants/api';
import { api } from '@/src/services/api';
import { storageService } from '@/src/services/storageService';

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 4) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  }

  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

export default function OtpScreen() {
  const params = useLocalSearchParams<{ phone?: string; mode?: string }>();
  const [otp, setOtp] = useState(Array(6).fill('').join(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const phone = typeof params.phone === 'string' ? params.phone : '';
  const mode = params.mode === 'signup' ? 'signup' : 'login';
  const otpDigits = otp.padEnd(6, '').slice(0, 6).split('');
  const isValid = otpDigits.every(Boolean);

  const title = mode === 'signup' ? 'Verify OTP' : 'Enter Verification Code';
  const subtitle = phone
    ? `We sent a 6-digit code to +233 ${formatPhone(phone)}`
    : 'Enter the 6-digit code sent to your phone.';

  useEffect(() => {
    if (!phone) {
      router.replace('/(auth)/login');
      return;
    }

    inputRefs.current[0]?.focus();
  }, [phone]);

  function updateOtpDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const nextOtp = [...otpDigits];
    nextOtp[index] = digit;
    setOtp(nextOtp.join(''));

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyPress(index: number, key: string) {
    if (key !== 'Backspace') {
      return;
    }

    if (otpDigits[index]) {
      const nextOtp = [...otpDigits];
      nextOtp[index] = '';
      setOtp(nextOtp.join(''));
      return;
    }

    if (index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function continueToPermissions() {
    if (!isValid || !phone || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.verifyOtp({ otp, phone, role: AUTH_ROLE });

      if (!response.success || !response.data) {
        Alert.alert('Unable to verify OTP', response.error ?? 'Something went wrong.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => void continueToPermissions() },
        ]);
        return;
      }

      await storageService.saveAuthTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToke,
      });
      await storageService.saveDoneOnBoarding(response.data.doneOnBoarding);

      if (!response.data.hasProfile) {
        router.replace({ pathname: '/(auth)/signup', params: { phone } });
        return;
      }

      if (!response.data.doneOnBoarding) {
        router.replace('/(auth)/onboarding');
        return;
      }

      router.replace('/(auth)/permissions');
    } catch (error) {
      Alert.alert('Unable to verify OTP', error instanceof Error ? error.message : 'Something went wrong.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: () => void continueToPermissions() },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendCode() {
    if (!phone || isResending) {
      return;
    }

    setIsResending(true);

    try {
      const response = await api.sendOtp(phone);

      if (!response.success) {
        Alert.alert('Unable to resend OTP', response.error ?? 'Something went wrong.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => void resendCode() },
        ]);
      }
    } catch (error) {
      Alert.alert('Unable to resend OTP', error instanceof Error ? error.message : 'Something went wrong.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: () => void resendCode() },
      ]);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topIcon}>
        <View style={styles.topIconBase}>
          <View style={[styles.topIconBlend, { backgroundColor: '#5B21F0' }]} />
          <View style={[styles.topIconBlend, styles.topIconBlendRight, { backgroundColor: '#14B8A6' }]} />
          <MaterialCommunityIcons color="#FFFFFF" name="shield-check" size={28} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Verification Code</Text>
          <View style={styles.otpRow}>
            {Array.from({ length: 6 }, (_, index) => (
              <View key={index} style={[styles.otpBox, otpDigits[index] ? styles.otpBoxActive : null]}>
                <TextInput
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  value={otpDigits[index]}
                  onChangeText={(value) => updateOtpDigit(index, value)}
                  onKeyPress={({ nativeEvent }) => handleOtpKeyPress(index, nativeEvent.key)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  style={styles.otpInput}
                />
              </View>
            ))}
          </View>
          <Text style={styles.helperText}>Use the 6-digit code from the SMS.</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={!isValid || isSubmitting}
          onPress={continueToPermissions}
          style={({ pressed }) => [
            styles.primaryButton,
            !isValid || isSubmitting ? styles.primaryButtonDisabled : null,
            pressed && isValid && !isSubmitting ? styles.primaryButtonPressed : null,
          ]}>
          <Text style={styles.primaryButtonText}>{isSubmitting ? 'Verifying...' : 'Verify OTP'}</Text>
          <MaterialCommunityIcons color="#FFFFFF" name="chevron-right" size={20} />
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Didn&apos;t receive a code?</Text>
          <Pressable accessibilityRole="button" disabled={isResending} onPress={resendCode}>
            <Text style={styles.footerLink}>{isResending ? 'Resending...' : 'Resend Code'}</Text>
          </Pressable>
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.secondaryAction}>
          <Text style={styles.secondaryActionText}>Change phone number</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 48,
    paddingBottom: 18,
  },
  topIcon: {
    marginBottom: 14,
  },
  topIconBase: {
    width: 42,
    height: 42,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
  },
  topIconBlend: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.95,
  },
  topIconBlendRight: {
    left: '50%',
  },
  content: {
    gap: 8,
    paddingBottom: 24,
  },
  title: {
    color: '#1B1D35',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: '#7C8194',
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    flex: 1,
    gap: 18,
    paddingTop: 18,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: '#50566B',
    fontSize: 14,
    fontWeight: '700',
  },
  otpRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  otpBox: {
    flex: 1,
    height: 54,
    borderWidth: 1,
    borderColor: '#E4E7F0',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: {
    borderColor: '#5B21F0',
    backgroundColor: '#F8F5FF',
  },
  otpInput: {
    width: '100%',
    color: '#1B1D35',
    fontSize: 22,
    fontWeight: '800',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  helperText: {
    color: '#7C8194',
    fontSize: 12,
    lineHeight: 17,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
    backgroundColor: '#5B21F0',
  },
  primaryButtonDisabled: {
    backgroundColor: '#D2D6E3',
  },
  primaryButtonPressed: {
    backgroundColor: '#4B17D6',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  footerText: {
    color: '#7C8194',
    fontSize: 14,
  },
  footerLink: {
    color: '#5B21F0',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryAction: {
    alignSelf: 'center',
    marginTop: -2,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  secondaryActionText: {
    color: '#5B21F0',
    fontSize: 14,
    fontWeight: '800',
  },
});
