import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { radius, spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

function normalizeOtp(value: string) {
  return value.replace(/\D/g, '').slice(0, 6);
}

function formatPhone(value: string) {
  if (value.length <= 3) {
    return value;
  }

  if (value.length <= 6) {
    return `${value.slice(0, 3)} ${value.slice(3)}`;
  }

  return `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`;
}

export default function OtpScreen() {
  const theme = useAppTheme();
  const params = useLocalSearchParams<{ phone?: string; mode?: string }>();
  const [otp, setOtp] = useState('');

  const phone = typeof params.phone === 'string' ? params.phone : '';
  const mode = params.mode === 'signup' ? 'signup' : 'login';
  const isValid = otp.length === 6;
  const colors = useMemo(
    () => ({
      background: theme.mode === 'dark' ? '#0F172A' : '#FFF7F3',
      card: theme.mode === 'dark' ? '#182235' : '#FFFFFF',
      text: theme.mode === 'dark' ? '#F8FAFC' : '#0F172A',
      subtext: theme.mode === 'dark' ? '#CBD5E1' : '#475569',
      muted: theme.mode === 'dark' ? '#94A3B8' : '#94A3B8',
      border: theme.mode === 'dark' ? '#334155' : '#E2E8F0',
      accent: '#F97316',
      accentPressed: '#EA580C',
      field: theme.mode === 'dark' ? '#0F172A' : '#FFFDFB',
      chip: theme.mode === 'dark' ? '#1F2937' : '#FFF1E6',
    }),
    [theme.mode],
  );

  const title = mode === 'signup' ? 'Verify phone number' : 'Enter verification code';
  const subtitle = phone ? `We sent a 6-digit code to ${formatPhone(phone)}.` : 'Enter the 6-digit code sent to your phone.';

  function goBack() {
    router.back();
  }

  function continueToPermissions() {
    if (!isValid) {
      return;
    }

    router.replace('/(auth)/permissions');
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.panel, { backgroundColor: colors.card }]}>
        <View style={styles.hero}>
          <View style={[styles.badge, { backgroundColor: colors.chip }]}>
            <Text style={styles.badgeText}>OTP</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.description, { color: colors.subtext }]}>{subtitle}</Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text }]}>Verification code</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.field, borderColor: colors.border }]}>
            <TextInput
              value={otp}
              onChangeText={(value) => setOtp(normalizeOtp(value))}
              placeholder="000000"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              maxLength={6}
              style={[styles.input, { color: colors.text }]}
            />
          </View>
          <Text style={[styles.hint, { color: colors.subtext }]}>Use the 6-digit code from the SMS.</Text>

          <Pressable
            accessibilityRole="button"
            disabled={!isValid}
            onPress={continueToPermissions}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: !isValid ? '#FDBA74' : pressed ? colors.accentPressed : colors.accent,
                opacity: !isValid ? 0.72 : 1,
              },
            ]}>
            <Text style={styles.primaryButtonText}>Verify</Text>
          </Pressable>

          <Pressable accessibilityRole="button" onPress={goBack} style={styles.secondaryButton}>
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Change phone number</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.subtext }]}>Didn&apos;t receive a code?</Text>
          <Pressable>
            <Text style={[styles.footerLink, { color: colors.text }]}>Resend code</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    justifyContent: 'center',
  },
  panel: {
    borderRadius: 32,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.md,
  },
  badge: {
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    color: '#F97316',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  form: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  inputWrap: {
    borderWidth: 1,
    borderRadius: radius.lg,
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  input: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    marginTop: spacing.md,
    minHeight: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '800',
  },
});
