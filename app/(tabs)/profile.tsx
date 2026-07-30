import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/src/hooks/useAppTheme';
import { api } from '@/src/services/api';
import { storageService } from '@/src/services/storageService';
import { ProfileSummaryResponse } from '@/src/types/home';

const menuItems = [
  { id: 'settings', title: 'Settings', subtitle: 'Preferences and app controls', icon: 'cog-outline', route: '/settings' as const, color: '#6D3DF5', background: '#F0EBFF' },
  { id: 'rewards', title: 'Rewards', subtitle: 'Badges and contribution progress', icon: 'medal-outline', route: '/rewards' as const, color: '#B77908', background: '#FFF6D9' },
  { id: 'privacy', title: 'Your privacy', subtitle: 'Review your anonymous data sharing', icon: 'shield-check-outline', route: '/settings' as const, color: '#078B7C', background: '#E4F8F5' },
] as const;

export default function ProfileScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [summary, setSummary] = useState<ProfileSummaryResponse['data']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getProfileSummary();
      if (!response.success || !response.data) throw new Error(response.error ?? 'Unable to load your profile.');
      setSummary(response.data); setError(null);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to load your profile.'); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { void loadProfile(); }, [loadProfile]));

  const fullName = summary?.profile.fullName ?? 'Loading profile';
  const initials = fullName.split(' ').map((part) => part[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const metrics = summary?.metrics;
  const accountStats = [
    { label: 'Distance', value: `${metrics?.distanceKm.toFixed(0) ?? '0'}`, unit: 'km', icon: 'map-marker-distance', color: '#6D3DF5', background: '#F0EBFF' },
    { label: 'Reports', value: String(metrics?.reportCount ?? 0), unit: 'shared', icon: 'file-document-outline', color: '#078B7C', background: '#E4F8F5' },
    { label: 'Impact', value: String(metrics?.contributionScore ?? 0), unit: 'points', icon: 'star-outline', color: '#B77908', background: '#FFF6D9' },
  ];
  const nextLevelScore = (metrics?.contributionScore ?? 0) < 1000 ? 1000 : (metrics?.contributionScore ?? 0) < 2500 ? 2500 : 5000;
  const progress = Math.min(100, Math.round(((metrics?.contributionScore ?? 0) / nextLevelScore) * 100));

  async function handleLogout() {
    await storageService.logout();
    router.replace('/(auth)/login');
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: theme.textSecondary }]}>YOUR ACCOUNT</Text>
          <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>Profile</Text>
        </View>
        <Pressable
          accessibilityLabel="Open settings"
          accessibilityRole="button"
          onPress={() => router.push('/settings')}
          style={({ pressed }) => [styles.settingsButton, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}>
          <MaterialCommunityIcons color={theme.textPrimary} name="cog-outline" size={21} />
        </Pressable>
      </View>

      {loading && <View style={styles.loadingRow}><ActivityIndicator color={theme.primary} /><Text style={[styles.loadingText, { color: theme.textSecondary }]}>Refreshing profile...</Text></View>}
      {error && <Pressable accessibilityRole="button" onPress={() => void loadProfile()} style={[styles.errorRow, { backgroundColor: theme.dangerSoft }]}><Text style={[styles.errorText, { color: theme.danger }]}>{error} · Retry</Text></Pressable>}

      <View style={styles.profileHero}>
        <View style={styles.profileHeroTop}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          <View style={styles.profileCopy}>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.location}>{summary?.profile.email ?? summary?.profile.phone ?? 'RoadPulse driver'}</Text>
            <View style={styles.badgeRow}>
              <MaterialCommunityIcons color="#F8D782" name="medal-outline" size={14} />
              <Text style={styles.badgeText}>{metrics?.contributionLevel ?? 'Community contributor'}</Text>
            </View>
          </View>
        </View>
        <View style={styles.heroDivider} />
        <View style={styles.heroFooter}>
          <View>
            <Text style={styles.heroFooterLabel}>CONTRIBUTION LEVEL</Text>
            <Text style={styles.heroFooterValue}>{metrics?.contributionLevel ?? 'Community contributor'}</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.push('/rewards')} hitSlop={8}>
            <Text style={styles.rewardsLink}>View rewards</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.statsRow}>
        {accountStats.map((stat) => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.statIcon, { backgroundColor: stat.background }]}>
              <MaterialCommunityIcons color={stat.color} name={stat.icon as never} size={18} />
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stat.value}</Text>
            <Text style={[styles.statUnit, { color: theme.textSecondary }]}>{stat.unit}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.progressCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.progressTitleRow}>
          <View style={[styles.progressIcon, { backgroundColor: theme.primarySoft }]}><MaterialCommunityIcons color={theme.primary} name="trending-up" size={20} /></View>
          <View style={styles.progressCopy}>
            <Text style={[styles.progressTitle, { color: theme.textPrimary }]}>Contribution progress</Text>
            <Text style={[styles.progressHint, { color: theme.textSecondary }]}>{Math.max(0, nextLevelScore - (metrics?.contributionScore ?? 0))} points to your next level</Text>
          </View>
          <Text style={[styles.progressPercentage, { color: theme.primary }]}>{progress}%</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.primarySoft }]}><View style={[styles.progressFill, { backgroundColor: theme.primary, width: `${progress}%` }]} /></View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Account</Text>
        <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>Manage your experience</Text>
      </View>
      <View style={styles.menuList}>
        {menuItems.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            onPress={() => router.push(item.route)}
            style={({ pressed }) => [styles.menuItem, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.84 : 1 }]}>
            <View style={[styles.menuIcon, { backgroundColor: item.background }]}><MaterialCommunityIcons color={item.color} name={item.icon} size={20} /></View>
            <View style={styles.menuCopy}>
              <Text style={[styles.menuTitle, { color: theme.textPrimary }]}>{item.title}</Text>
              <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
            </View>
            <MaterialCommunityIcons color={theme.textMuted} name="chevron-right" size={20} />
          </Pressable>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => void handleLogout()}
        style={({ pressed }) => [styles.logoutButton, { borderColor: '#F8C7C9', backgroundColor: '#FFF4F4', opacity: pressed ? 0.8 : 1 }]}>
        <MaterialCommunityIcons color="#D84045" name="logout-variant" size={19} />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>

      <Text style={[styles.footer, { color: theme.textMuted }]}>RoadPulse Ghana · Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontSize: 10, lineHeight: 14, fontWeight: '900', letterSpacing: 1 },
  pageTitle: { fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: -0.7, marginTop: 1 },
  settingsButton: { width: 46, height: 46, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  profileHero: { backgroundColor: '#5420CD', borderRadius: 25, padding: 19 },
  profileHeroTop: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  avatar: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  avatarText: { color: '#5420CD', fontSize: 20, fontWeight: '900' },
  profileCopy: { flex: 1 },
  name: { color: '#FFFFFF', fontSize: 21, lineHeight: 26, fontWeight: '800', letterSpacing: -0.3 },
  location: { color: '#DCD0FF', fontSize: 12, lineHeight: 17, fontWeight: '500', marginTop: 2 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 7 },
  badgeText: { color: '#F8D782', fontSize: 11, fontWeight: '800' },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.18)', marginVertical: 17 },
  heroFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  heroFooterLabel: { color: '#DCD0FF', fontSize: 9, fontWeight: '900', letterSpacing: 0.85 },
  heroFooterValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginTop: 3 },
  rewardsLink: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', textDecorationLine: 'underline' },
  statsRow: { flexDirection: 'row', gap: 9 },
  statCard: { flex: 1, minHeight: 122, borderRadius: 19, borderWidth: 1, padding: 11, alignItems: 'center' },
  statIcon: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  statValue: { fontSize: 19, lineHeight: 23, fontWeight: '800', letterSpacing: -0.35 },
  statUnit: { fontSize: 10, lineHeight: 13, fontWeight: '700' },
  statLabel: { fontSize: 11, lineHeight: 15, fontWeight: '600', marginTop: 4 },
  progressCard: { borderWidth: 1, borderRadius: 20, padding: 14, gap: 13 },
  progressTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  progressCopy: { flex: 1 },
  progressTitle: { fontSize: 15, fontWeight: '800' },
  progressHint: { fontSize: 12, lineHeight: 17, fontWeight: '500', marginTop: 1 },
  progressPercentage: { fontSize: 14, fontWeight: '800' },
  progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden' },
  progressFill: { width: '72%', height: '100%', borderRadius: 999 },
  sectionHeader: { gap: 2, marginTop: 1 },
  sectionTitle: { fontSize: 19, fontWeight: '800', letterSpacing: -0.25 },
  sectionHint: { fontSize: 12, fontWeight: '500' },
  menuList: { gap: 9 },
  menuItem: { minHeight: 72, borderWidth: 1, borderRadius: 19, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  menuIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  menuCopy: { flex: 1 },
  menuTitle: { fontSize: 15, lineHeight: 20, fontWeight: '800' },
  menuSubtitle: { fontSize: 12, lineHeight: 17, fontWeight: '500', marginTop: 1 },
  logoutButton: { minHeight: 54, borderRadius: 17, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 },
  logoutText: { color: '#D84045', fontSize: 14, fontWeight: '800' },
  footer: { fontSize: 11, fontWeight: '500', textAlign: 'center', marginTop: 2 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: -8 },
  loadingText: { fontSize: 12, fontWeight: '600' },
  errorRow: { borderRadius: 14, padding: 12 },
  errorText: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
});
