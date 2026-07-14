import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/src/hooks/useAppTheme';
import { api } from '@/src/services/api';
import { IncidentDetail } from '@/src/types/home';

function relativeTime(value: string) { const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000)); return seconds < 60 ? 'Now' : seconds < 3600 ? `${Math.floor(seconds / 60)} min ago` : seconds < 86_400 ? `${Math.floor(seconds / 3600)} hr ago` : `${Math.floor(seconds / 86_400)}d ago`; }

export default function IncidentDetailsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const loadIncident = useCallback(async () => {
    if (!id) { setError('Incident identifier is missing.'); setLoading(false); return; }
    setLoading(true);
    try { const response = await api.getIncident(id); if (!response.success || !response.data) throw new Error(response.error ?? 'Unable to load incident.'); setIncident(response.data.incident); setError(null); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to load incident.'); } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { void loadIncident(); }, [loadIncident]);

  async function confirm() {
    if (!incident || incident.confirmedByCurrentDriver || confirming) return;
    setConfirming(true);
    try { const response = await api.confirmIncident(incident.id); if (!response.success || !response.data) throw new Error(response.error ?? 'Unable to confirm incident.'); setIncident({ ...incident, ...response.data }); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to confirm incident.'); } finally { setConfirming(false); }
  }

  return <ScrollView style={[styles.screen, { backgroundColor: theme.background }]} contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><Pressable accessibilityRole="button" onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}><MaterialCommunityIcons color={theme.textPrimary} name="chevron-left" size={23} /></Pressable><Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Incident details</Text><Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/map')} style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}><MaterialCommunityIcons color={theme.primary} name="map-outline" size={20} /></Pressable></View>
    {loading && <ActivityIndicator color={theme.primary} style={styles.loader} />}
    {error && <Pressable accessibilityRole="button" onPress={() => void loadIncident()} style={[styles.error, { backgroundColor: theme.dangerSoft }]}><Text style={[styles.errorText, { color: theme.danger }]}>{error} · Retry</Text></Pressable>}
    {incident && <IncidentContent incident={incident} confirming={confirming} onConfirm={() => void confirm()} />}
  </ScrollView>;
}

function IncidentContent({ incident, confirming, onConfirm }: { incident: IncidentDetail; confirming: boolean; onConfirm: () => void }) {
  const theme = useAppTheme();
  const danger = incident.severity === 'high' || incident.severity === 'critical';
  const accent = danger ? '#D84045' : incident.severity === 'medium' ? '#D97706' : '#16875A';
  const tint = danger ? '#FFF0F1' : incident.severity === 'medium' ? '#FFF6E5' : '#E6F7EF';
  return <>
    <View style={[styles.hero, { backgroundColor: tint }]}><View style={[styles.heroIcon, { backgroundColor: theme.surface }]}><MaterialCommunityIcons color={accent} name="alert-outline" size={25} /></View><View style={styles.heroCopy}><Text style={[styles.eyebrow, { color: accent }]}>ROAD INCIDENT</Text><Text style={[styles.title, { color: theme.textPrimary }]}>{incident.type}</Text><Text style={[styles.time, { color: theme.textSecondary }]}>{relativeTime(incident.createdAt)}</Text></View><Text style={[styles.status, { color: accent }]}>{incident.status.toUpperCase()}</Text></View>
    <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/map')} style={[styles.locationCard, { backgroundColor: theme.surface, borderColor: theme.border }]}><View style={[styles.locationIcon, { backgroundColor: theme.primarySoft }]}><MaterialCommunityIcons color={theme.primary} name="map-marker-outline" size={22} /></View><View style={styles.locationCopy}><Text style={[styles.locationLabel, { color: theme.textSecondary }]}>INCIDENT LOCATION</Text><Text style={[styles.locationTitle, { color: theme.textPrimary }]}>{incident.roadName}, {incident.city}</Text><Text style={[styles.locationHint, { color: theme.primary }]}>Open live map</Text></View><MaterialCommunityIcons color={theme.textMuted} name="chevron-right" size={20} /></Pressable>
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}><Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>What drivers should know</Text><Text style={[styles.description, { color: theme.textSecondary }]}>{incident.description}</Text></View>
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}><Detail label="Reported by" value={incident.reportedByCurrentDriver ? 'You' : 'Anonymous community driver'} /><View style={[styles.divider, { backgroundColor: theme.border }]} /><Detail label="Community confirmations" value={`${incident.confirmationCount} driver${incident.confirmationCount === 1 ? '' : 's'}`} /></View>
    <View style={[styles.communityCard, { backgroundColor: theme.primarySoft }]}><MaterialCommunityIcons color={theme.primary} name="account-group-outline" size={21} /><Text style={[styles.communityText, { color: theme.textPrimary }]}>{incident.confirmedByCurrentDriver ? 'You have confirmed this incident.' : 'Can you see this incident? Help other drivers by confirming it.'}</Text></View>
    {!incident.reportedByCurrentDriver && <Pressable accessibilityRole="button" disabled={incident.confirmedByCurrentDriver || confirming} onPress={onConfirm} style={[styles.confirmButton, { backgroundColor: incident.confirmedByCurrentDriver ? theme.surface : theme.primary, borderColor: theme.primary }]}>{confirming ? <ActivityIndicator color="#fff" /> : <><MaterialCommunityIcons color={incident.confirmedByCurrentDriver ? theme.primary : '#fff'} name={incident.confirmedByCurrentDriver ? 'check-circle-outline' : 'thumb-up-outline'} size={19} /><Text style={[styles.confirmText, { color: incident.confirmedByCurrentDriver ? theme.primary : '#fff' }]}>{incident.confirmedByCurrentDriver ? 'You confirmed this incident' : 'Confirm this incident'}</Text></>}</Pressable>}
  </>;
}

function Detail({ label, value }: { label: string; value: string }) { const theme = useAppTheme(); return <View><Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{label}</Text><Text style={[styles.detailValue, { color: theme.textPrimary }]}>{value}</Text></View>; }

const styles = StyleSheet.create({ screen: { flex: 1 }, content: { paddingHorizontal: 20, gap: 16 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, iconButton: { width: 43, height: 43, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, headerTitle: { fontSize: 18, fontWeight: '800' }, loader: { marginVertical: 60 }, error: { borderRadius: 14, padding: 13 }, errorText: { fontSize: 12, fontWeight: '700', textAlign: 'center' }, hero: { minHeight: 108, borderRadius: 24, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 10 }, heroIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, heroCopy: { flex: 1 }, eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1 }, title: { fontSize: 21, fontWeight: '800', marginTop: 2 }, time: { fontSize: 11, fontWeight: '600', marginTop: 3 }, status: { fontSize: 10, fontWeight: '900', alignSelf: 'flex-start' }, locationCard: { minHeight: 83, borderWidth: 1, borderRadius: 20, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }, locationIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, locationCopy: { flex: 1 }, locationLabel: { fontSize: 9, fontWeight: '900', letterSpacing: .8 }, locationTitle: { fontSize: 14, fontWeight: '800', marginTop: 2 }, locationHint: { fontSize: 11, fontWeight: '700', marginTop: 2 }, card: { borderWidth: 1, borderRadius: 20, padding: 15 }, sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8 }, description: { fontSize: 14, lineHeight: 21, fontWeight: '500' }, detailLabel: { fontSize: 11, fontWeight: '700' }, detailValue: { fontSize: 14, fontWeight: '800', marginTop: 2 }, divider: { height: 1, marginVertical: 12 }, communityCard: { minHeight: 66, borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }, communityText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '600' }, confirmButton: { minHeight: 56, borderWidth: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }, confirmText: { fontSize: 15, fontWeight: '800' } });
