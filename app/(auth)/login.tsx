import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton, AppInput, Card, Chip, Screen } from '@/src/components/ui';
import { spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export default function LoginScreen() {
  const theme = useAppTheme();

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Welcome back</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>Stay connected to live congestion updates, incident alerts, and your contribution record.</Text>
      </View>

      <Card>
        <AppInput label="Email" placeholder="name@example.com" />
        <AppInput label="Password" placeholder="Enter your password" secureTextEntry />
        <View style={styles.inlineRow}>
          <Chip label="Remember Me" tone="primary" />
          <Pressable>
            <Text style={[styles.forgot, { color: theme.primary }]}>Forgot Password</Text>
          </Pressable>
        </View>
      </Card>

      <AppButton label="Login" onPress={() => router.replace('/(auth)/permissions')} />
      <Pressable onPress={() => router.push('/(auth)/signup')}>
        <Text style={[styles.register, { color: theme.textSecondary }]}>New to TrafficPulse? <Text style={{ color: theme.primary, fontWeight: '800' }}>Register</Text></Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  inlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  forgot: {
    fontSize: 14,
    fontWeight: '700',
  },
  register: {
    textAlign: 'center',
    fontSize: 15,
  },
});
