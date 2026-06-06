import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { radius, spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export default function SplashScreen() {
  const theme = useAppTheme();

  useEffect(() => {
    const timeout = setTimeout(() => router.replace('/(auth)/onboarding'), 1400);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.routeArt, { borderColor: theme.primarySoft, backgroundColor: theme.surface }]}>
        <View style={[styles.routePrimary, { backgroundColor: theme.primary }]} />
        <View style={[styles.routeSecondary, { backgroundColor: theme.secondary }]} />
        <View style={[styles.routeWarning, { backgroundColor: theme.warning }]} />
      </View>
      <View style={styles.logoBlock}>
        <View style={[styles.logo, { backgroundColor: theme.primary }]}>
          <Text style={styles.logoText}>TP</Text>
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>TrafficPulse</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Crowdsourced traffic intelligence for smarter mobility</Text>
      </View>
      <ActivityIndicator color={theme.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: spacing.xl,
  },
  routeArt: {
    width: '100%',
    maxWidth: 320,
    height: 220,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routePrimary: {
    width: 230,
    height: 16,
    borderRadius: radius.round,
    transform: [{ rotate: '25deg' }, { translateY: -6 }],
  },
  routeSecondary: {
    position: 'absolute',
    width: 180,
    height: 16,
    borderRadius: radius.round,
    transform: [{ rotate: '-35deg' }, { translateX: 35 }],
  },
  routeWarning: {
    position: 'absolute',
    width: 150,
    height: 16,
    borderRadius: radius.round,
    transform: [{ rotate: '82deg' }, { translateY: 34 }],
  },
  logoBlock: {
    alignItems: 'center',
    gap: spacing.md,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 280,
  },
});
