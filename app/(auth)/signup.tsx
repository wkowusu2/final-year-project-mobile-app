import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton, AppInput, Card, Screen } from '@/src/components/ui';
import { spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export default function SignUpScreen() {
  const theme = useAppTheme();

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: theme.primary }]}>Create your account</Text>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Join TrafficPulse</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>Build a commuter profile to view live traffic, contribute reports, and unlock route intelligence.</Text>
      </View>

      <Card>
        <AppInput label="Full Name" placeholder="Enter your full name" />
        <AppInput label="Email" placeholder="name@example.com" />
        <AppInput label="Phone Number" placeholder="+233 24 000 0000" />
        <AppInput label="Password" placeholder="Create a password" secureTextEntry />
        <AppInput label="Confirm Password" placeholder="Confirm your password" secureTextEntry />
      </Card>

      <AppButton label="Sign Up" onPress={() => router.replace('/(auth)/login')} />
      <Pressable onPress={() => router.push('/(auth)/login')}>
        <Text style={[styles.link, { color: theme.textSecondary }]}>Already have an account? <Text style={{ color: theme.primary, fontWeight: '800' }}>Login</Text></Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: '800',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  link: {
    textAlign: 'center',
    fontSize: 15,
  },
});
