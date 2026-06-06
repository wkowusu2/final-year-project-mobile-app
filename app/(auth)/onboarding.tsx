import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { onboardingSlides } from '@/src/data/mock-data';
import { radius, spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { AppButton, Screen } from '@/src/components/ui';

export default function OnboardingScreen() {
  const theme = useAppTheme();
  const [index, setIndex] = useState(0);
  const slide = onboardingSlides[index];
  const isLast = index === onboardingSlides.length - 1;

  function next() {
    if (isLast) {
      router.replace('/(auth)/signup');
      return;
    }
    setIndex((value) => value + 1);
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.topRow}>
        <Text style={[styles.brand, { color: theme.primary }]}>TrafficPulse</Text>
        <Pressable onPress={() => router.replace('/(auth)/signup')}>
          <Text style={[styles.skip, { color: theme.textSecondary }]}>Skip</Text>
        </Pressable>
      </View>

      <View style={[styles.illustration, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={[styles.circleLarge, { backgroundColor: slide.accent }]} />
        <View style={[styles.circleSmall, { backgroundColor: theme.secondary }]} />
        <View style={[styles.panel, { backgroundColor: theme.backgroundMuted }]} />
      </View>

      <View style={styles.copy}>
        <Text style={[styles.step, { color: theme.primary }]}>0{index + 1}</Text>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{slide.title}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>{slide.description}</Text>
      </View>

      <View style={styles.pagination}>
        {onboardingSlides.map((item, itemIndex) => (
          <View
            key={item.id}
            style={[
              styles.dot,
              {
                backgroundColor: itemIndex === index ? theme.primary : theme.border,
                width: itemIndex === index ? 26 : 10,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <AppButton label={isLast ? 'Get Started' : 'Next'} onPress={next} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
  },
  skip: {
    fontSize: 15,
    fontWeight: '700',
  },
  illustration: {
    height: 320,
    borderRadius: radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circleLarge: {
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.18,
  },
  circleSmall: {
    position: 'absolute',
    top: 52,
    right: 40,
    width: 84,
    height: 84,
    borderRadius: 42,
    opacity: 0.24,
  },
  panel: {
    position: 'absolute',
    bottom: 42,
    width: 220,
    height: 90,
    borderRadius: radius.lg,
  },
  copy: {
    gap: spacing.md,
  },
  step: {
    fontSize: 14,
    fontWeight: '800',
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    height: 10,
    borderRadius: radius.round,
  },
  actions: {
    gap: spacing.sm,
  },
});
