import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader, Card, Screen } from '@/src/components/ui';
import { radius, spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { api } from '@/src/services/api';
import { RoadAdvisory } from '@/src/types/advisories';

const typeMeta: Record<string, { label: string; icon: string }> = {
  maintenance: { label: 'Road works', icon: 'tools' },
  road_closure: { label: 'Road closure', icon: 'road-variant' },
  diversion: { label: 'Diversion', icon: 'directions-fork' },
  signal_work: { label: 'Signal work', icon: 'traffic-light-outline' },
  event_restriction: { label: 'Event restriction', icon: 'calendar-alert' },
};

function advisoryTiming(advisory: RoadAdvisory) {
  const start = new Date(advisory.startsAt);
  const end = advisory.endsAt ? new Date(advisory.endsAt) : null;
  const date = new Intl.DateTimeFormat('en-GH', { day: 'numeric', month: 'short' }).format(start);
  const time = new Intl.DateTimeFormat('en-GH', { hour: 'numeric', minute: '2-digit' }).format(start);
  if (!end) return `Starts ${date} · ${time}`;
  const endDate = new Intl.DateTimeFormat('en-GH', { day: 'numeric', month: 'short' }).format(end);
  const endTime = new Intl.DateTimeFormat('en-GH', { hour: 'numeric', minute: '2-digit' }).format(end);
  return `${date}, ${time} — ${endDate}, ${endTime}`;
}

function impactStyle(impact: RoadAdvisory['impact'], theme: ReturnType<typeof useAppTheme>) {
  if (impact === 'high') return { color: theme.danger, background: theme.dangerSoft, label: 'High impact' };
  if (impact === 'low') return { color: theme.success, background: theme.successSoft, label: 'Low impact' };
  return { color: theme.warning, background: theme.warningSoft, label: 'Moderate impact' };
}

export default function GovernmentPolicyScreen() {
  const theme = useAppTheme();
  const [advisories, setAdvisories] = useState<RoadAdvisory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getRoadAdvisories();
      if (!response.success || !response.data) throw new Error(response.error ?? 'Unable to load road advisories.');
      setAdvisories(response.data.advisories);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load road advisories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const activeCount = useMemo(() => advisories.filter((advisory) => advisory.status === 'active').length, [advisories]);
  const plannedCount = useMemo(() => advisories.filter((advisory) => advisory.status === 'planned').length, [advisories]);

  return (
    <Screen scrollable style={styles.screen}>
      <AppHeader title="Road works & advisories" subtitle="Official notices that may affect your next journey." />

      <View style={[styles.hero, { backgroundColor: theme.primary }]}> 
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}><MaterialCommunityIcons color="#FFFFFF" name="road-variant" size={23} /></View>
          <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE ROAD NOTICE</Text></View>
        </View>
        <Text style={styles.heroTitle}>{activeCount ? `${activeCount} active notice${activeCount === 1 ? '' : 's'} right now` : 'No active road restrictions'}</Text>
        <Text style={styles.heroBody}>{activeCount ? 'Check affected roads before starting your drive. Route intelligence includes active notices in its ETA.' : 'Verified closures, diversions, and planned works will appear here as they are published.'}</Text>
        <View style={styles.heroStats}>
          <View><Text style={styles.heroStatValue}>{activeCount}</Text><Text style={styles.heroStatLabel}>ACTIVE</Text></View>
          <View style={styles.heroDivider} />
          <View><Text style={styles.heroStatValue}>{plannedCount}</Text><Text style={styles.heroStatLabel}>PLANNED</Text></View>
          <View style={styles.heroDivider} />
          <View><Text style={styles.heroStatValue}>{advisories.length}</Text><Text style={styles.heroStatLabel}>TOTAL</Text></View>
        </View>
      </View>

      <View style={styles.listHeader}>
        <View><Text style={[styles.listTitle, { color: theme.textPrimary }]}>Current notices</Text><Text style={[styles.listSubtitle, { color: theme.textSecondary }]}>Published by road-management authorities</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Refresh road advisories" onPress={() => void load()} style={({ pressed }) => [styles.refreshButton, { backgroundColor: theme.primarySoft, opacity: pressed || loading ? 0.76 : 1 }]}>
          <MaterialCommunityIcons color={theme.primary} name="refresh" size={19} />
        </Pressable>
      </View>

      {loading ? <Card style={styles.stateCard}><ActivityIndicator color={theme.primary} /><Text style={[styles.stateText, { color: theme.textSecondary }]}>Checking the latest road notices…</Text></Card> : null}
      {error ? <Pressable accessibilityRole="button" onPress={() => void load()} style={[styles.stateCard, { backgroundColor: theme.dangerSoft, borderColor: theme.danger }]}><MaterialCommunityIcons color={theme.danger} name="alert-circle-outline" size={23} /><Text style={[styles.stateText, { color: theme.danger }]}>{error}</Text><Text style={[styles.retryText, { color: theme.danger }]}>Tap to retry</Text></Pressable> : null}
      {!loading && !error && !advisories.length ? <Card style={styles.stateCard}><View style={[styles.emptyIcon, { backgroundColor: theme.successSoft }]}><MaterialCommunityIcons color={theme.success} name="check-circle-outline" size={25} /></View><Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Road network clear</Text><Text style={[styles.emptyText, { color: theme.textSecondary }]}>There are no current government road advisories to show.</Text></Card> : null}
      {!loading && !error ? advisories.map((advisory) => <AdvisoryCard key={advisory.id} advisory={advisory} />) : null}
    </Screen>
  );
}

function AdvisoryCard({ advisory }: { advisory: RoadAdvisory }) {
  const theme = useAppTheme();
  const meta = typeMeta[advisory.type] ?? { label: advisory.type, icon: 'information-outline' };
  const impact = impactStyle(advisory.impact, theme);
  const active = advisory.status === 'active';

  return (
    <Card style={[styles.advisoryCard, active && { borderColor: impact.color }]}> 
      <View style={styles.cardTop}>
        <View style={[styles.typeIcon, { backgroundColor: impact.background }]}><MaterialCommunityIcons color={impact.color} name={meta.icon as never} size={22} /></View>
        <View style={styles.cardTitleWrap}><Text style={[styles.cardEyebrow, { color: impact.color }]}>{meta.label.toUpperCase()}</Text><Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{advisory.title}</Text></View>
        <View style={[styles.statusPill, { backgroundColor: active ? theme.successSoft : theme.backgroundMuted }]}><View style={[styles.statusDot, { backgroundColor: active ? theme.success : theme.textMuted }]} /><Text style={[styles.statusText, { color: active ? theme.success : theme.textSecondary }]}>{advisory.status}</Text></View>
      </View>
      <Text style={[styles.description, { color: theme.textSecondary }]}>{advisory.description}</Text>
      <View style={[styles.locationRow, { backgroundColor: theme.backgroundMuted }]}><MaterialCommunityIcons color={theme.primary} name="map-marker-outline" size={18} /><View style={styles.locationCopy}><Text style={[styles.locationLabel, { color: theme.textMuted }]}>AFFECTED ROAD</Text><Text style={[styles.locationText, { color: theme.textPrimary }]}>{advisory.roadName}, {advisory.city}</Text></View></View>
      <View style={styles.metaRow}><View style={styles.timeRow}><MaterialCommunityIcons color={theme.textMuted} name="clock-outline" size={16} /><Text style={[styles.timeText, { color: theme.textSecondary }]}>{advisoryTiming(advisory)}</Text></View><View style={[styles.impactPill, { backgroundColor: impact.background }]}><Text style={[styles.impactText, { color: impact.color }]}>{impact.label}</Text></View></View>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.md },
  hero: { borderRadius: radius.xl, padding: spacing.lg, gap: spacing.sm }, heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, heroIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' }, livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.16)', paddingHorizontal: 9, paddingVertical: 6 }, liveDot: { width: 6, height: 6, borderRadius: 99, backgroundColor: '#9FF4D2' }, liveText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 }, heroTitle: { color: '#FFFFFF', fontSize: 23, lineHeight: 29, fontWeight: '900', marginTop: spacing.xs }, heroBody: { color: 'rgba(255,255,255,0.84)', fontSize: 13, lineHeight: 19 }, heroStats: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' }, heroStatValue: { color: '#FFFFFF', fontSize: 19, fontWeight: '900' }, heroStatLabel: { color: '#DCD0FF', fontSize: 9, fontWeight: '900', letterSpacing: 0.8, marginTop: 2 }, heroDivider: { width: 1, height: 29, backgroundColor: 'rgba(255,255,255,0.24)', marginHorizontal: spacing.lg },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs }, listTitle: { fontSize: 18, fontWeight: '900' }, listSubtitle: { fontSize: 11, fontWeight: '600', marginTop: 3 }, refreshButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, stateCard: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.lg }, stateText: { fontSize: 13, fontWeight: '700', textAlign: 'center' }, retryText: { fontSize: 12, fontWeight: '900' }, emptyIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, emptyTitle: { fontSize: 16, fontWeight: '900' }, emptyText: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
  advisoryCard: { gap: spacing.md, padding: spacing.md, borderRadius: radius.lg }, cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, typeIcon: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, cardTitleWrap: { flex: 1 }, cardEyebrow: { fontSize: 9, fontWeight: '900', letterSpacing: 0.8 }, cardTitle: { fontSize: 16, lineHeight: 21, fontWeight: '900', marginTop: 3 }, statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 5 }, statusDot: { width: 6, height: 6, borderRadius: 99 }, statusText: { fontSize: 10, fontWeight: '900', textTransform: 'capitalize' }, description: { fontSize: 13, lineHeight: 19 }, locationRow: { minHeight: 59, borderRadius: radius.md, paddingHorizontal: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, locationCopy: { flex: 1 }, locationLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 0.8 }, locationText: { fontSize: 13, fontWeight: '800', marginTop: 2 }, metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }, timeRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 }, timeText: { flex: 1, fontSize: 11, lineHeight: 16, fontWeight: '600' }, impactPill: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 5 }, impactText: { fontSize: 10, fontWeight: '900' },
});
