import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/src/hooks/useAppTheme';
import { api } from '@/src/services/api';
import { HomeDashboardIncident } from '@/src/types/home';

type Filter = 'All' | 'Pending' | 'Verified' | 'Resolved';
const filters: Filter[] = ['All', 'Pending', 'Verified', 'Resolved'];

function titleCase(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return 'Now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86_400)}d ago`;
}

export default function ReportsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [query, setQuery] = useState('');
  const [reports, setReports] = useState<HomeDashboardIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getMyIncidents();
      if (!response.success || !response.data) throw new Error(response.error ?? 'Unable to load your reports.');
      setReports(response.data.incidents);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load your reports.');
    } finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { void loadReports(); }, [loadReports]));

  const visibleReports = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesFilter = activeFilter === 'All' || report.status === activeFilter.toLowerCase();
      return matchesFilter && (!normalized || `${report.type} ${report.roadName} ${report.city}`.toLowerCase().includes(normalized));
    });
  }, [activeFilter, query, reports]);

  const verified = reports.filter((report) => report.status === 'verified').length;
  const resolved = reports.filter((report) => report.status === 'resolved').length;

  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.background }]} contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><View><Text style={[styles.eyebrow, { color: theme.textSecondary }]}>COMMUNITY CONTRIBUTIONS</Text><Text style={[styles.title, { color: theme.textPrimary }]}>Your reports</Text><Text style={[styles.subtitle, { color: theme.textSecondary }]}>Every report helps someone travel safer.</Text></View><Pressable accessibilityRole="button" onPress={() => router.push('/report-incident')} style={[styles.addButton, { backgroundColor: theme.primary }]}><MaterialCommunityIcons color="#fff" name="plus" size={22} /></Pressable></View>
      <View style={styles.summaryCard}><View><Text style={styles.summaryLabel}>TOTAL REPORTS</Text><Text style={styles.summaryValue}>{reports.length}</Text></View><View style={styles.summaryIcon}><MaterialCommunityIcons color="#fff" name="shield-check-outline" size={23} /></View><View style={styles.summaryBottom}><Text style={styles.summaryText}>{verified} verified</Text><Text style={styles.summaryText}>{resolved} resolved</Text></View></View>
      <View style={styles.searchRow}><View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}><MaterialCommunityIcons color={theme.textSecondary} name="magnify" size={18} /><TextInput value={query} onChangeText={setQuery} placeholder="Search your reports" placeholderTextColor={theme.textMuted} style={[styles.searchInput, { color: theme.textPrimary }]} /></View><Pressable accessibilityRole="button" onPress={() => setQuery('')} style={[styles.clearButton, { backgroundColor: theme.surface, borderColor: theme.border }]}><MaterialCommunityIcons color={theme.textSecondary} name={query ? 'close' : 'tune-variant'} size={20} /></Pressable></View>
      <View style={styles.filterRow}>{filters.map((filter) => { const selected = filter === activeFilter; return <Pressable key={filter} accessibilityRole="button" onPress={() => setActiveFilter(filter)} style={[styles.filter, { backgroundColor: selected ? theme.primary : theme.surface, borderColor: selected ? theme.primary : theme.border }]}><Text style={[styles.filterText, { color: selected ? '#fff' : theme.textSecondary }]}>{filter}</Text></Pressable>; })}</View>
      <View style={styles.listHeader}><Text style={[styles.listTitle, { color: theme.textPrimary }]}>{loading ? 'Loading reports' : `${visibleReports.length} report${visibleReports.length === 1 ? '' : 's'}`}</Text><Text style={[styles.listHint, { color: theme.textSecondary }]}>Most recent first</Text></View>
      {loading && <ActivityIndicator color={theme.primary} style={styles.loader} />}
      {error && <Pressable accessibilityRole="button" onPress={() => void loadReports()} style={[styles.error, { backgroundColor: theme.dangerSoft }]}><Text style={[styles.errorText, { color: theme.danger }]}>{error} · Retry</Text></Pressable>}
      <View style={styles.list}>{visibleReports.map((report) => <ReportCard key={report.id} report={report} />)}{!loading && !error && visibleReports.length === 0 && <View style={[styles.empty, { backgroundColor: theme.surface, borderColor: theme.border }]}><MaterialCommunityIcons color={theme.textMuted} name="file-search-outline" size={25} /><Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No reports found</Text><Text style={[styles.emptyText, { color: theme.textSecondary }]}>Submit a road incident to see it here.</Text></View>}</View>
    </ScrollView>
  );
}

function ReportCard({ report }: { report: HomeDashboardIncident }) {
  const theme = useAppTheme();
  const isSevere = report.severity === 'high' || report.severity === 'critical';
  const statusColor = report.status === 'verified' ? '#6D3DF5' : report.status === 'resolved' ? '#16875A' : '#D97706';
  return <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/incident-details', params: { id: report.id } })} style={[styles.reportCard, { backgroundColor: theme.surface, borderColor: theme.border }]}><View style={[styles.reportIcon, { backgroundColor: isSevere ? '#FFF0F1' : report.severity === 'medium' ? '#FFF6E5' : '#E6F7EF' }]}><MaterialCommunityIcons color={isSevere ? '#D84045' : report.severity === 'medium' ? '#D97706' : '#16875A'} name="alert-outline" size={20} /></View><View style={styles.reportCopy}><View style={styles.cardTitleRow}><Text style={[styles.reportTitle, { color: theme.textPrimary }]}>{report.type}</Text><Text style={[styles.status, { color: statusColor }]}>{titleCase(report.status)}</Text></View><Text numberOfLines={1} style={[styles.reportLocation, { color: theme.textSecondary }]}>{report.roadName}, {report.city}</Text><Text style={[styles.reportTime, { color: theme.textMuted }]}>{relativeTime(report.createdAt)}</Text></View><MaterialCommunityIcons color={theme.textMuted} name="chevron-right" size={19} /></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, content: { paddingHorizontal: 20, gap: 16 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1 }, title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.7, marginTop: 2 }, subtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 }, addButton: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, summaryCard: { minHeight: 126, backgroundColor: '#5420CD', borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'flex-start' }, summaryLabel: { color: '#DCD0FF', fontSize: 10, fontWeight: '900', letterSpacing: 1 }, summaryValue: { color: '#fff', fontSize: 38, fontWeight: '800', marginTop: 2 }, summaryIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }, summaryBottom: { position: 'absolute', left: 18, bottom: 15, flexDirection: 'row', gap: 16 }, summaryText: { color: '#DCD0FF', fontSize: 11, fontWeight: '700' }, searchRow: { flexDirection: 'row', gap: 8 }, searchBox: { flex: 1, minHeight: 48, borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }, searchInput: { flex: 1, fontSize: 15, fontWeight: '500' }, clearButton: { width: 48, height: 48, borderWidth: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, filterRow: { flexDirection: 'row', gap: 7 }, filter: { flex: 1, minHeight: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, filterText: { fontSize: 11, fontWeight: '800' }, listHeader: { flexDirection: 'row', justifyContent: 'space-between' }, listTitle: { fontSize: 16, fontWeight: '800' }, listHint: { fontSize: 11, fontWeight: '600' }, loader: { marginVertical: 28 }, error: { borderRadius: 14, padding: 12 }, errorText: { fontSize: 12, fontWeight: '700', textAlign: 'center' }, list: { gap: 9 }, reportCard: { minHeight: 88, borderWidth: 1, borderRadius: 19, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11 }, reportIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, reportCopy: { flex: 1 }, cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, reportTitle: { flex: 1, fontSize: 14, fontWeight: '800' }, status: { fontSize: 10, fontWeight: '900' }, reportLocation: { fontSize: 12, fontWeight: '500', marginTop: 2 }, reportTime: { fontSize: 11, fontWeight: '600', marginTop: 2 }, empty: { minHeight: 160, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 5, padding: 20 }, emptyTitle: { fontSize: 15, fontWeight: '800', marginTop: 5 }, emptyText: { fontSize: 12, fontWeight: '500' },
});
