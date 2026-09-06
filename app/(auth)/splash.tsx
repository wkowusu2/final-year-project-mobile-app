import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette } from '@/src/constants/colors';

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  useEffect(() => {
    const timeout = setTimeout(() => router.replace('/(auth)/onboarding'), 1100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 48 }]}>
      <View style={styles.brandBlock}>
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>TP</Text>
          </View>
        </View>
        <Text style={styles.title}>TrafficPulse</Text>
        <Text style={styles.subtitle}>Smarter choices for better journeys</Text>
      </View>
      <ActivityIndicator color={palette.white} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F47C48',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 180,
    paddingBottom: 80,
    paddingHorizontal: 24,
  },
  brandBlock: {
    alignItems: 'center',
    gap: 18,
  },
  logoWrap: {
    width: 112,
    height: 112,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#F47C48',
    fontSize: 28,
    fontWeight: '900',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 16,
    textAlign: 'center',
  },
});
