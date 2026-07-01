import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { onboardingSlides } from '@/src/data/mock-data';
import { spacing } from '@/src/constants/design';
import { api } from '@/src/services/api';
import { storageService } from '@/src/services/storageService';

const slideMeta = [
  {
    background: '#EFF2FF',
    panel: '#DCE2FF',
    iconBackground: '#5B21F0',
    button: '#5B21F0',
    buttonSecondary: null as string | null,
    illustration: PlanningIllustration,
  },
  {
    background: '#ECFBF7',
    panel: '#D5FBF2',
    iconBackground: '#14C7B3',
    button: '#12C7B2',
    buttonSecondary: null as string | null,
    illustration: AnonymousIllustration,
  },
  {
    background: '#EEFAF0',
    panel: '#DAF8DF',
    iconBackground: '#16D15E',
    button: '#16D15E',
    buttonSecondary: null as string | null,
    illustration: TrafficIllustration,
  },
  {
    background: '#F4EDFF',
    panel: '#E7D9FF',
    iconBackground: '#A855F7',
    button: '#7C3AED',
    buttonSecondary: '#14B8A6',
    illustration: CitiesIllustration,
  },
] as const;

const slideIcons = [
  'office-building',
  'shield-check-outline',
  'chart-timeline-variant',
  'map-marker-star-outline',
] as const;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeMeta = slideMeta[activeIndex];

  function goToSlide(nextIndex: number) {
    scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    setActiveIndex(nextIndex);
  }

  async function handlePrimaryAction() {
    if (activeIndex !== onboardingSlides.length - 1) {
      goToSlide(Math.min(activeIndex + 1, onboardingSlides.length - 1));
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await storageService.getAccessToken();

      if (!token) {
        Alert.alert('Session expired', 'Please verify your phone number again.', [
          { text: 'OK', onPress: () => router.replace('/(auth)/login') },
        ]);
        return;
      }

      const response = await api.completeOnboarding(token);

      if (!response.success || !response.data) {
        Alert.alert('Unable to complete onboarding', response.error ?? 'Something went wrong.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => void handlePrimaryAction() },
        ]);
        return;
      }

      await storageService.saveDoneOnBoarding(response.data.doneOnboarding);
      router.replace('/(auth)/permissions');
    } catch (error) {
      Alert.alert('Unable to complete onboarding', error instanceof Error ? error.message : 'Something went wrong.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: () => void handlePrimaryAction() },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: activeMeta.background }]}>
      <ScrollView
        ref={scrollRef}
        style={styles.carousel}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setActiveIndex(nextIndex);
        }}>
        {onboardingSlides.map((slide, index) => {
          const meta = slideMeta[index];
          const Illustration = meta.illustration;

          return (
            <View
              key={slide.id}
              style={[
                styles.page,
                {
                  width,
                  paddingTop: insets.top + spacing.sm,
                  paddingBottom: insets.bottom + spacing.md,
                  backgroundColor: meta.background,
                },
              ]}>
              <View style={styles.topRow}>
                <Pressable accessibilityRole="button" onPress={() => router.replace('/(auth)/login')} hitSlop={12}>
                  <Text style={styles.skipText}>Skip</Text>
                </Pressable>
              </View>

              <View style={styles.heroArea}>
                <Illustration panelColor={meta.panel} accent={slide.accent} />
              </View>

              <View style={styles.contentArea}>
                <View style={[styles.iconTile, { backgroundColor: meta.iconBackground }]}>
                  <MaterialCommunityIcons color="#FFFFFF" name={slideIcons[index]} size={22} />
                </View>

                <View style={styles.copyBlock}>
                  <Text style={styles.title}>{slide.title}</Text>
                  <Text style={styles.description}>{slide.description}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.pagination}>
          {onboardingSlides.map((item, itemIndex) => (
            <View
              key={item.id}
              style={[
                styles.dot,
                {
                  width: itemIndex === activeIndex ? 20 : 8,
                  backgroundColor: itemIndex === activeIndex ? activeMeta.button : 'rgba(148, 163, 184, 0.35)',
                },
              ]}
            />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={() => void handlePrimaryAction()}
          style={({ pressed }) => [styles.primaryButton, pressed && !isSubmitting && styles.primaryButtonPressed]}>
          {activeMeta.buttonSecondary ? (
            <View style={styles.gradientButtonFill}>
              <View style={[styles.gradientHalf, { backgroundColor: activeMeta.button, flex: 0.54 }]} />
              <View style={[styles.gradientHalf, { backgroundColor: activeMeta.buttonSecondary, flex: 0.46 }]} />
            </View>
          ) : (
            <View style={[styles.solidButtonFill, { backgroundColor: activeMeta.button }]} />
          )}
          <View style={styles.primaryButtonContent}>
            <Text style={styles.primaryButtonText}>
              {activeIndex === onboardingSlides.length - 1 ? (isSubmitting ? 'Saving...' : 'Get Started') : 'Next'}
            </Text>
            <MaterialCommunityIcons color="#FFFFFF" name="chevron-right" size={20} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function PlanningIllustration({ panelColor, accent }: { panelColor: string; accent: string }) {
  return (
    <View style={styles.illustrationWrap}>
      <View style={[styles.sun, { backgroundColor: '#F5F56B' }]} />
      <View style={[styles.sunRay, { backgroundColor: accent }]} />
      <View style={[styles.cityBase, { backgroundColor: panelColor }]} />
      <View style={[styles.cityShadow, { backgroundColor: 'rgba(90, 90, 255, 0.12)' }]} />
      <View style={[styles.cityShadowTwo, { backgroundColor: 'rgba(90, 90, 255, 0.12)' }]} />

      <View style={[styles.signalPole, { backgroundColor: accent }]} />
      <View style={[styles.signalHead, { borderColor: accent }]} />

      <View style={[styles.buildingSmall, { backgroundColor: '#8EA8FF' }]} />
      <View style={[styles.buildingSmallWindows, { backgroundColor: '#5B21F0' }]} />

      <View style={[styles.buildingLarge, { backgroundColor: '#6B7CFF' }]} />
      <View style={[styles.buildingLargeWindows, { backgroundColor: '#4C1D95' }]} />

      <View style={[styles.roadStrip, { backgroundColor: '#B39DFF' }]} />
      <View style={[styles.roadStripSoft, { backgroundColor: 'rgba(181, 152, 255, 0.45)' }]} />
    </View>
  );
}

function AnonymousIllustration({ panelColor, accent }: { panelColor: string; accent: string }) {
  return (
    <View style={styles.illustrationWrap}>
      <View style={[styles.ringOuter, { backgroundColor: panelColor }]} />
      <View style={[styles.ringInner, { backgroundColor: 'rgba(20, 199, 179, 0.12)' }]} />
      <View style={[styles.shieldBody, { backgroundColor: accent }]} />
      <MaterialCommunityIcons color="#FFFFFF" name="check" size={28} style={styles.shieldCheck} />

      <View style={[styles.node, styles.nodeTopLeft, { backgroundColor: '#B9F7E8' }]} />
      <View style={[styles.node, styles.nodeTopRight, { backgroundColor: '#B9F7E8' }]} />
      <View style={[styles.node, styles.nodeBottomLeft, { backgroundColor: '#B9F7E8' }]} />
      <View style={[styles.node, styles.nodeBottomRight, { backgroundColor: '#B9F7E8' }]} />

      <View style={[styles.link, styles.linkTopLeft, { borderColor: accent }]} />
      <View style={[styles.link, styles.linkTopRight, { borderColor: accent }]} />
      <View style={[styles.link, styles.linkBottomLeft, { borderColor: accent }]} />
      <View style={[styles.link, styles.linkBottomRight, { borderColor: accent }]} />
    </View>
  );
}

function TrafficIllustration({ panelColor, accent }: { panelColor: string; accent: string }) {
  return (
    <View style={styles.illustrationWrap}>
      <View style={[styles.chartCard, { backgroundColor: panelColor }]} />
      <View style={styles.legendRow}>
        <View style={[styles.legendPill, { backgroundColor: '#16D15E' }]}>
          <Text style={styles.legendText}>FREE</Text>
        </View>
        <View style={[styles.legendPill, { backgroundColor: '#F59E0B' }]}>
          <Text style={styles.legendText}>SLOW</Text>
        </View>
        <View style={[styles.legendPill, { backgroundColor: '#F43F5E' }]}>
          <Text style={styles.legendText}>JAM</Text>
        </View>
      </View>
      <View style={[styles.chartBand, { backgroundColor: 'rgba(34, 197, 94, 0.08)' }]} />
      <View style={[styles.chartBandMiddle, { backgroundColor: 'rgba(250, 204, 21, 0.32)' }]} />
      <View style={[styles.chartBandRight, { backgroundColor: 'rgba(34, 197, 94, 0.12)' }]} />

      <View style={[styles.chartLine, { borderColor: accent }]} />
      <View style={[styles.chartLineSecond, { borderColor: accent }]} />

      <View style={[styles.chartDot, styles.chartDotStart, { backgroundColor: '#16D15E' }]} />
      <View style={[styles.chartDot, styles.chartDotMid, { backgroundColor: '#F59E0B' }]} />
      <View style={[styles.chartDot, styles.chartDotMidTwo, { backgroundColor: '#16D15E' }]} />
      <View style={[styles.chartDot, styles.chartDotEnd, { backgroundColor: '#16D15E' }]} />
    </View>
  );
}

function CitiesIllustration({ panelColor, accent }: { panelColor: string; accent: string }) {
  return (
    <View style={styles.illustrationWrap}>
      <View style={[styles.ringOuter, { backgroundColor: panelColor }]} />
      <View style={[styles.ringInner, { backgroundColor: 'rgba(168, 85, 247, 0.10)' }]} />
      <View style={[styles.ringCenter, { backgroundColor: accent }]} />
      <MaterialCommunityIcons color="#FFFFFF" name="star" size={18} style={styles.ringStar} />

      <View style={[styles.networkNode, styles.networkTopLeft, { backgroundColor: '#D7B4FF' }]} />
      <View style={[styles.networkNode, styles.networkTopRight, { backgroundColor: '#D7B4FF' }]} />
      <View style={[styles.networkNode, styles.networkBottomLeft, { backgroundColor: '#D7B4FF' }]} />
      <View style={[styles.networkNode, styles.networkBottomRight, { backgroundColor: '#D7B4FF' }]} />

      <View style={[styles.networkLink, styles.networkLinkTopLeft, { borderColor: accent }]} />
      <View style={[styles.networkLink, styles.networkLinkTopRight, { borderColor: accent }]} />
      <View style={[styles.networkLink, styles.networkLinkBottomLeft, { borderColor: accent }]} />
      <View style={[styles.networkLink, styles.networkLinkBottomRight, { borderColor: accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    gap: spacing.md,
  },
  carousel: {
    flex: 1,
  },
  page: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  topRow: {
    alignItems: 'flex-end',
    paddingTop: 2,
  },
  skipText: {
    color: '#A3A6B7',
    fontSize: 14,
    fontWeight: '600',
  },
  heroArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  illustrationWrap: {
    width: 240,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sun: {
    position: 'absolute',
    left: 40,
    top: 54,
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  sunRay: {
    position: 'absolute',
    left: 46,
    top: 70,
    width: 28,
    height: 2,
    borderRadius: 99,
    opacity: 0.9,
  },
  cityBase: {
    position: 'absolute',
    bottom: 48,
    width: 180,
    height: 92,
    borderRadius: 14,
    opacity: 0.48,
  },
  cityShadow: {
    position: 'absolute',
    bottom: 30,
    left: 18,
    width: 72,
    height: 96,
    borderRadius: 12,
    opacity: 0.54,
  },
  cityShadowTwo: {
    position: 'absolute',
    bottom: 30,
    right: 16,
    width: 70,
    height: 96,
    borderRadius: 12,
    opacity: 0.5,
  },
  signalPole: {
    position: 'absolute',
    top: 76,
    width: 3,
    height: 34,
    borderRadius: 99,
  },
  signalHead: {
    position: 'absolute',
    top: 62,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  buildingSmall: {
    position: 'absolute',
    left: 42,
    bottom: 42,
    width: 66,
    height: 84,
    borderRadius: 4,
    opacity: 0.96,
  },
  buildingSmallWindows: {
    position: 'absolute',
    left: 55,
    bottom: 92,
    width: 39,
    height: 20,
    borderRadius: 2,
    opacity: 1,
  },
  buildingLarge: {
    position: 'absolute',
    right: 40,
    bottom: 40,
    width: 70,
    height: 96,
    borderRadius: 4,
    opacity: 0.96,
  },
  buildingLargeWindows: {
    position: 'absolute',
    right: 53,
    bottom: 98,
    width: 44,
    height: 42,
    borderRadius: 2,
  },
  roadStrip: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 34,
    height: 18,
    borderRadius: 3,
    opacity: 0.7,
  },
  roadStripSoft: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 26,
    height: 12,
    borderRadius: 3,
  },
  ringOuter: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.95,
  },
  ringInner: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  shieldBody: {
    position: 'absolute',
    width: 52,
    height: 72,
    borderRadius: 18,
    top: 58,
  },
  shieldCheck: {
    position: 'absolute',
    top: 76,
  },
  node: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  nodeTopLeft: {
    left: 44,
    top: 42,
  },
  nodeTopRight: {
    right: 42,
    top: 42,
  },
  nodeBottomLeft: {
    left: 44,
    bottom: 38,
  },
  nodeBottomRight: {
    right: 42,
    bottom: 38,
  },
  link: {
    position: 'absolute',
    width: 76,
    borderTopWidth: 2,
    borderStyle: 'dashed',
  },
  linkTopLeft: {
    left: 66,
    top: 62,
    transform: [{ rotate: '35deg' }],
  },
  linkTopRight: {
    right: 66,
    top: 62,
    transform: [{ rotate: '-35deg' }],
  },
  linkBottomLeft: {
    left: 66,
    bottom: 56,
    transform: [{ rotate: '-35deg' }],
  },
  linkBottomRight: {
    right: 66,
    bottom: 56,
    transform: [{ rotate: '35deg' }],
  },
  chartCard: {
    position: 'absolute',
    width: 182,
    height: 128,
    borderRadius: 16,
    opacity: 0.92,
  },
  legendRow: {
    position: 'absolute',
    left: 24,
    top: 34,
    flexDirection: 'row',
    gap: 6,
  },
  legendPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  legendText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  chartBand: {
    position: 'absolute',
    left: 34,
    bottom: 66,
    width: 42,
    height: 30,
    borderRadius: 2,
  },
  chartBandMiddle: {
    position: 'absolute',
    left: 74,
    bottom: 48,
    width: 40,
    height: 46,
    borderRadius: 2,
  },
  chartBandRight: {
    position: 'absolute',
    left: 116,
    bottom: 58,
    width: 44,
    height: 36,
    borderRadius: 2,
  },
  chartLine: {
    position: 'absolute',
    left: 32,
    bottom: 60,
    width: 44,
    height: 44,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRadius: 2,
    transform: [{ rotate: '-22deg' }],
  },
  chartLineSecond: {
    position: 'absolute',
    left: 74,
    bottom: 52,
    width: 76,
    height: 48,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderRadius: 2,
    transform: [{ rotate: '12deg' }],
  },
  chartDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chartDotStart: {
    left: 30,
    bottom: 58,
  },
  chartDotMid: {
    left: 79,
    bottom: 90,
  },
  chartDotMidTwo: {
    left: 116,
    bottom: 62,
  },
  chartDotEnd: {
    right: 26,
    bottom: 42,
  },
  ringCenter: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  ringStar: {
    position: 'absolute',
  },
  networkNode: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  networkTopLeft: {
    left: 42,
    top: 56,
  },
  networkTopRight: {
    right: 38,
    top: 52,
  },
  networkBottomLeft: {
    left: 38,
    bottom: 54,
  },
  networkBottomRight: {
    right: 44,
    bottom: 44,
  },
  networkLink: {
    position: 'absolute',
    width: 78,
    borderTopWidth: 2,
    borderStyle: 'dashed',
  },
  networkLinkTopLeft: {
    left: 62,
    top: 72,
    transform: [{ rotate: '34deg' }],
  },
  networkLinkTopRight: {
    right: 62,
    top: 68,
    transform: [{ rotate: '-32deg' }],
  },
  networkLinkBottomLeft: {
    left: 62,
    bottom: 64,
    transform: [{ rotate: '-34deg' }],
  },
  networkLinkBottomRight: {
    right: 62,
    bottom: 52,
    transform: [{ rotate: '34deg' }],
  },
  contentArea: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  iconTile: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyBlock: {
    gap: spacing.sm,
  },
  title: {
    color: '#1B1D35',
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  description: {
    color: '#76809C',
    fontSize: 14,
    lineHeight: 21,
  },
  pagination: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 999,
  },
  primaryButton: {
    height: 46,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  primaryButtonPressed: {
    opacity: 0.93,
    transform: [{ scale: 0.995 }],
  },
  gradientButtonFill: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  gradientHalf: {
    height: '100%',
  },
  solidButtonFill: {
    ...StyleSheet.absoluteFillObject,
  },
  primaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
