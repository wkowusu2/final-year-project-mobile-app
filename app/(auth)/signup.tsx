import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';


function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (!digits) {
    return '';
  }
  return digits.startsWith('0') ? digits : `0${digits.slice(0, 9)}`;
}

function formatGhanaPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  return digits.length > 4 ? digits.replace(/(\d{4})(\d{0,3})(\d{0,3})/, '$1 $2 $3').trim() : digits;
}

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const isValid = fullName.trim().length > 1 && email.includes('@') && phone.length === 10 && phone.startsWith('0');
  const colors = {
    background: '#FFFFFF',
    heroText: '#1B1D35',
    subtext: '#7C8194',
    border: '#E4E7F0',
    field: '#FFFFFF',
    fieldMuted: '#F9FAFF',
    label: '#50566B',
    accent: '#5B21F0',
    accentPressed: '#4B17D6',
    buttonDisabled: '#D2D6E3',
    buttonText: '#FFFFFF',
    link: '#5B21F0',
    card: '#FFFFFF',
    iconA: '#5B21F0',
    iconB: '#14B8A6',
  };

  function continueToOtp() {
    if (!isValid) {
      return;
    }

    router.push({ pathname: '/(auth)/otp', params: { phone, mode: 'signup' } });
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.topIcon}>
        <View style={styles.topIconBase}>
          <View style={[styles.topIconBlend, { backgroundColor: colors.iconA }]} />
          <View style={[styles.topIconBlend, styles.topIconBlendRight, { backgroundColor: colors.iconB }]} />
          <MaterialCommunityIcons color="#FFFFFF" name="home" size={28} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.heroText }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>Join TrafficPulse and help build smarter cities</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.label }]}>Full Name</Text>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.field }]}>
            <MaterialCommunityIcons color={colors.subtext} name="account-outline" size={18} />
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Juan dela Cruz"
              placeholderTextColor="#B0B5C7"
              style={[styles.input, { color: colors.heroText }]}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.label }]}>Email Address</Text>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.field }]}>
            <MaterialCommunityIcons color={colors.subtext} name="email-outline" size={18} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="juan@example.com"
              placeholderTextColor="#B0B5C7"
              style={[styles.input, { color: colors.heroText }]}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.label }]}>Phone Number</Text>
          <View style={styles.phoneRow}>
            <View style={[styles.countryChip, { borderColor: colors.border, backgroundColor: colors.fieldMuted }]}>
              <Text style={styles.flag}>🇬🇭</Text>
              <Text style={[styles.countryCode, { color: colors.heroText }]}>+233</Text>
            </View>
            <View style={[styles.phoneInputWrap, { borderColor: colors.border, backgroundColor: colors.field }]}>
              <MaterialCommunityIcons color={colors.subtext} name="phone-outline" size={18} />
              <TextInput
                value={formatGhanaPhone(phone)}
                onChangeText={(value) => setPhone(normalizePhone(value))}
                placeholder="9XX XXX XXXX"
                placeholderTextColor="#B0B5C7"
                keyboardType="number-pad"
                style={[styles.input, styles.phoneInput, { color: colors.heroText }]}
              />
            </View>
          </View>
          <Text style={[styles.helperText, { color: colors.subtext }]}>We&apos;ll send a verification code to this number</Text>
        </View>

        <Text style={[styles.legalText, { color: colors.subtext }]}>
          By signing up, you agree to our <Text style={[styles.link, { color: colors.link }]}>Terms of Service</Text> and{' '}
          <Text style={[styles.link, { color: colors.link }]}>Privacy Policy</Text>
        </Text>

        <Pressable
          accessibilityRole="button"
          disabled={!isValid}
          onPress={continueToOtp}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: !isValid ? colors.buttonDisabled : pressed ? colors.accentPressed : colors.accent,
            },
          ]}>
          <Text style={styles.primaryButtonText}>Send Verification Code</Text>
          <MaterialCommunityIcons color="#FFFFFF" name="chevron-right" size={20} />
        </Pressable>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.subtext }]}>Already have an account? </Text>
          <Pressable onPress={() => router.replace('/(auth)/login')}>
            <Text style={[styles.footerLink, { color: colors.link }]}>Login</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
    fontSize: 27,
    lineHeight: 31,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  subtitle: {
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
    fontSize: 14,
    fontWeight: '700',
  },
  inputWrap: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countryChip: {
    width: 88,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  flag: {
    fontSize: 18,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '700',
  },
  phoneInputWrap: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phoneInput: {
    letterSpacing: 0.2,
  },
  helperText: {
    fontSize: 12,
    lineHeight: 17,
  },
  legalText: {
    fontSize: 12,
    lineHeight: 18,
  },
  link: {
    fontWeight: '700',
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
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
    marginTop: 2,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '800',
  },
});
