import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing } from '@/src/constants/design';
import { palette } from '@/src/constants/colors';
import { useAppTheme } from '@/src/hooks/useAppTheme';

const slides = [
  {
    id: 'welcome',
    title: 'Welcome to TrafficPulse',
    description: 'See live traffic conditions, smarter routes, and community reports in one simple place.',
    accent: '#FBE4D7',
    card: '#FFFFFF',
    fruit: '#F28B50',
    leaf: '#59B685',
    cup: '#FF8F66',
    bowl: '#FFE7A3',
  },
  {
    id: 'traffic',
    title: 'Track congestion and road incidents',
    description: 'Get real-time updates on accidents, delays, and road activity before you move.',
    accent: '#F9DCC7',
    card: '#FFF6EF',
    fruit: '#F4A261',
    leaf: '#5AB88F',
    cup: '#F28C64',
    bowl: '#FFD87A',
  },
  {
    id: 'community',
    title: 'Share reports that help every driver',
    description: 'Contribute location-aware reports and make each journey safer for the community.',
    accent: '#FCE7D6',
    card: '#FFF9F3',
    fruit: '#F08A5D',
    leaf: '#58AE87',
    cup: '#FF9A76',
    bowl: '#FFE08A',
  },
  {
    id: 'signin',
    title: 'Ready to continue?',
    description: 'Create your account or sign in to unlock live alerts, route intelligence, and tracking.',
    accent: '#F8DDCF',
    card: '#FFF7F1',
    fruit: '#EF8456',
    leaf: '#4DAE81',
    cup: '#FF936C',
    bowl: '#FFD37A',
  },
] as const;

export default function OnboardingScreen() {
  const theme = useAppTheme();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  const colors = useMemo(
    () => ({
      background: theme.mode === 'dark' ? '#201B18' : '#F7E6D7',
      text: theme.mode === 'dark' ? '#FFF7F2' : '#17110D',
      subtext: theme.mode === 'dark' ? '#D8C0B1' : '#7B6252',
      primary: '#FF7A45',
      primaryPressed: '#F26A32',
      indicatorActive: '#1F1611',
      indicatorInactive: 'rgba(31, 22, 17, 0.18)',
      shell: theme.mode === 'dark' ? '#2B221D' : '#F2D9C9',
    }),
    [theme.mode],
  );

  function next() {
    if (isLast) {
      router.replace('/(auth)/login');
      return;
    }
    setIndex((value) => value + 1);
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.phoneShell, { backgroundColor: colors.shell }]}>
        <View style={styles.heroWrap}>
          <View style={[styles.heroCard, { backgroundColor: slide.card }]}>
            <View style={[styles.heroBlob, { backgroundColor: slide.accent }]} />
            <View style={[styles.heroShadow, { backgroundColor: 'rgba(0,0,0,0.06)' }]} />
            <View style={styles.heroArt}>
              <View style={[styles.bowlBase, { backgroundColor: slide.bowl }]} />
              <View style={[styles.cupBody, { backgroundColor: slide.cup }]}>
                <View style={[styles.cupLid, { backgroundColor: '#FFF2E9' }]} />
              </View>
              <View style={[styles.fruitLarge, { backgroundColor: slide.fruit }]} />
              <View style={[styles.fruitSmall, { backgroundColor: '#FFB37B' }]} />
              <View style={[styles.leafLeft, { backgroundColor: slide.leaf }]} />
              <View style={[styles.leafRight, { backgroundColor: slide.leaf }]} />
              <View style={[styles.dotOne, { backgroundColor: '#FFD3B9' }]} />
              <View style={[styles.dotTwo, { backgroundColor: '#F9C9B2' }]} />
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
          <Text style={[styles.description, { color: colors.subtext }]}>{slide.description}</Text>

          <View style={styles.pagination}>
            {slides.map((item, itemIndex) => (
              <View
                key={item.id}
                style={[
                  styles.dot,
                  {
                    backgroundColor: itemIndex === index ? colors.indicatorActive : colors.indicatorInactive,
                    width: itemIndex === index ? 28 : 10,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={next}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: pressed ? colors.primaryPressed : colors.primary },
            ]}>
            <Text style={styles.primaryButtonText}>{isLast ? 'Sign In' : 'Next'}</Text>
          </Pressable>

          <View style={styles.footerRow}>
            {isLast ? (
              <>
                <Text style={[styles.footerText, { color: colors.subtext }]}>New to TrafficPulse? </Text>
                <Pressable onPress={() => router.replace('/(auth)/signup')}>
                  <Text style={[styles.footerLink, { color: colors.text }]}>Create account</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={[styles.footerText, { color: colors.subtext }]}>Already have an account? </Text>
                <Pressable onPress={() => router.replace('/(auth)/login')}>
                  <Text style={[styles.footerLink, { color: colors.text }]}>Sign in</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 28,
    justifyContent: 'center',
  },
  phoneShell: {
    flex: 1,
    borderRadius: 36,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  heroWrap: {
    alignItems: 'center',
    paddingTop: 10,
  },
  heroCard: {
    width: '100%',
    height: 360,
    borderRadius: 34,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBlob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: 18,
  },
  heroShadow: {
    position: 'absolute',
    bottom: 58,
    width: 190,
    height: 28,
    borderRadius: radius.round,
  },
  heroArt: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bowlBase: {
    position: 'absolute',
    bottom: 84,
    width: 200,
    height: 72,
    borderRadius: 30,
  },
  cupBody: {
    position: 'absolute',
    right: 78,
    bottom: 120,
    width: 70,
    height: 104,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  cupLid: {
    marginTop: 14,
    width: 54,
    height: 18,
    borderRadius: 10,
  },
  fruitLarge: {
    position: 'absolute',
    left: 86,
    bottom: 132,
    width: 108,
    height: 108,
    borderRadius: 54,
  },
  fruitSmall: {
    position: 'absolute',
    left: 154,
    bottom: 120,
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  leafLeft: {
    position: 'absolute',
    left: 100,
    bottom: 206,
    width: 44,
    height: 22,
    borderRadius: 18,
    transform: [{ rotate: '-30deg' }],
  },
  leafRight: {
    position: 'absolute',
    left: 142,
    bottom: 206,
    width: 44,
    height: 22,
    borderRadius: 18,
    transform: [{ rotate: '28deg' }],
  },
  dotOne: {
    position: 'absolute',
    left: 52,
    top: 116,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  dotTwo: {
    position: 'absolute',
    right: 58,
    top: 94,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: 6,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  dot: {
    height: 10,
    borderRadius: radius.round,
  },
  actions: {
    gap: 18,
    paddingHorizontal: 6,
  },
  primaryButton: {
    minHeight: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '800',
  },
});
