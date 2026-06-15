import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { radius, spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

function normalizePhone(value: string) {
  return value.replace(/\D/g, '').slice(0, 10);
}

export default function LoginScreen() {
  const theme = useAppTheme();
  const [phone, setPhone] = useState('');

  const isValid = phone.length === 10 && phone.startsWith('0');
  const colors = useMemo(
    () => ({
      background: theme.mode === 'dark' ? '#111827' : '#FFF7F3',
      card: theme.mode === 'dark' ? '#1F2937' : '#FFFFFF',
      text: theme.mode === 'dark' ? '#F8FAFC' : '#0F172A',
      subtext: theme.mode === 'dark' ? '#CBD5E1' : '#475569',
      muted: theme.mode === 'dark' ? '#94A3B8' : '#94A3B8',
      border: theme.mode === 'dark' ? '#374151' : '#E2E8F0',
      accent: '#F97316',
      accentPressed: '#EA580C',
      field: theme.mode === 'dark' ? '#0F172A' : '#F8FAFC',
    }),
    [theme.mode],
  );

  function continueToOtp() {
    if (!isValid) {
      return;
    }

    router.push({ pathname: '/(auth)/otp', params: { phone, mode: 'login' } });
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.panel, { backgroundColor: colors.card }]}>
        <View style={styles.hero}>
          <View style={[styles.iconWrap, { backgroundColor: '#FFEDD5' }]}>
            <Text style={styles.icon}>+</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
          <Text style={[styles.description, { color: colors.subtext }]}>Sign in with your Ghana phone number to continue.</Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text }]}>Phone number</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.field, borderColor: colors.border }]}>
            <TextInput
              value={phone}
              onChangeText={(value) => setPhone(normalizePhone(value))}
              placeholder="024 123 4567"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              maxLength={10}
              style={[styles.input, { color: colors.text }]}
            />
          </View>
          <Text style={[styles.hint, { color: colors.subtext }]}>Enter a 10-digit Ghana number that starts with 0.</Text>

          <Pressable
            accessibilityRole="button"
            disabled={!isValid}
            onPress={continueToOtp}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: !isValid ? '#FDBA74' : pressed ? colors.accentPressed : colors.accent,
                opacity: !isValid ? 0.7 : 1,
              },
            ]}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.subtext }]}>Don&apos;t have an account?</Text>
          <Pressable onPress={() => router.replace('/(auth)/signup')}>
            <Text style={[styles.footerLink, { color: colors.text }]}>Create account</Text>
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
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 34,
    fontWeight: '800',
    color: '#F97316',
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
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
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
