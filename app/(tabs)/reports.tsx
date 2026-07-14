import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/src/hooks/useAppTheme';
import { reportStatuses, reportSummaries } from '@/src/data/report-data';
import { spacing } from '@/src/constants/design';

type Filter = 'All' | 'Pending' | 'Verified' | 'Resolved';

const filters: Filter[] = ['All', 'Pending', 'Verified', 'Resolved'];

export default function ReportsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [query, setQuery] = useState('');

  const visibleReports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return reportSummaries.filter((report) => {
      const matchesFilter = activeFilter === 'All' || report.status === activeFilter;
      const haystack = `${report.type} ${report.location} ${report.city} ${report.time}`.toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);
  const verifiedCount = reportSummaries.filter((report) => report.status === 'Verified').length;
  const resolvedCount = reportSummaries.filter((report) => report.status === 'Resolved').length;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + 12 }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: theme.textSecondary }]}>COMMUNITY CONTRIBUTIONS</Text>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Your reports</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Every report helps someone travel safer.</Text>
        </View>
        <Pressable
          accessibilityLabel="Create a report"
          accessibilityRole="button"
          onPress={() => router.push('/report-incident')}
          style={({ pressed }) => [styles.addButton, { backgroundColor: theme.primary, opacity: pressed ? 0.82 : 1 }]}>
          <MaterialCommunityIcons color="#FFFFFF" name="plus" size={22} />
        </Pressable>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryTopRow}>
          <View>
            <Text style={styles.summaryLabel}>TOTAL REPORTS</Text>
            <Text style={styles.summaryValue}>{reportSummaries.length}</Text>
          </View>
          <View style={styles.summaryIcon}><MaterialCommunityIcons color="#FFFFFF" name="shield-check-outline" size={23} /></View>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryStats}>
          <View><Text style={styles.summaryStatValue}>{verifiedCount}</Text><Text style={styles.summaryStatLabel}>Verified</Text></View>
          <View><Text style={styles.summaryStatValue}>{resolvedCount}</Text><Text style={styles.summaryStatLabel}>Resolved</Text></View>
          <View><Text style={styles.summaryStatValue}>+12</Text><Text style={styles.summaryStatLabel}>Helpful votes</Text></View>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <MaterialCommunityIcons color={theme.textSecondary} name="magnify" size={18} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search reports..."
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.textPrimary }]}
          />
        </View>
        <Pressable
          accessibilityLabel={query ? 'Clear report search' : 'Open report filters'}
          accessibilityRole="button"
          onPress={() => setQuery('')}
          style={({ pressed }) => [styles.filterButton, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}>
          <MaterialCommunityIcons color={theme.textSecondary} name={query ? 'close' : 'tune-variant'} size={20} />
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        {filters.map((filter) => {
          const selected = filter === activeFilter;
          return (
            <Pressable
              key={filter}
              accessibilityRole="button"
              onPress={() => setActiveFilter(filter)}
              style={({ pressed }) => [
                styles.filterPill,
                {
                  backgroundColor: selected ? theme.primary : theme.surface,
                  borderColor: selected ? theme.primary : theme.border,
                  opacity: pressed ? 0.95 : 1,
                },
              ]}>
              <Text style={[styles.filterText, { color: selected ? '#FFFFFF' : theme.textSecondary }]}>{filter}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: theme.textPrimary }]}>{visibleReports.length === 1 ? '1 report' : `${visibleReports.length} reports`}</Text>
        <Text style={[styles.listHint, { color: theme.textSecondary }]}>{activeFilter === 'All' ? 'Most recent first' : activeFilter}</Text>
      </View>
      <View style={styles.list}>
        {visibleReports.map((report) => (
          <Pressable
            key={report.id}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/incident-details', params: { id: report.id } })}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                opacity: pressed ? 0.96 : 1,
              },
            ]}>
            <View style={[styles.iconWrap, { backgroundColor: report.iconBg }]}>
              <MaterialCommunityIcons color={report.iconColor} name={report.icon as never} size={20} />
            </View>

            <View style={styles.cardBody}>
              <View style={styles.cardTopRow}>
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{report.type}</Text>
                <View style={[styles.statusPill, { backgroundColor: statusTone[report.status].bg }]}>
                  <Text style={[styles.statusText, { color: statusTone[report.status].text }]}>{report.status}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <MaterialCommunityIcons color={theme.textMuted} name="map-marker-outline" size={12} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {report.location}, {report.city}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <MaterialCommunityIcons color={theme.textMuted} name="clock-outline" size={12} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>{report.time}</Text>
              </View>
            </View>

            <MaterialCommunityIcons color={theme.textMuted} name="chevron-right" size={18} />
          </Pressable>
        ))}
        {visibleReports.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.primarySoft }]}><MaterialCommunityIcons color={theme.primary} name="file-search-outline" size={24} /></View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No reports found</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Try another search or select a different status.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const statusTone: Record<(typeof reportStatuses)[number], { bg: string; text: string }> = {
  Pending: { bg: '#FFF4D9', text: '#D97706' },
  Verified: { bg: '#ECEBFF', text: '#5B21F0' },
  Resolved: { bg: '#DDF7E6', text: '#16A34A' },
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  eyebrow: { fontSize: 10, lineHeight: 14, fontWeight: '900', letterSpacing: 1, marginBottom: 3 },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  addButton: { height: 46, width: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  summaryCard: { backgroundColor: '#5420CD', borderRadius: 24, padding: 18 },
  summaryTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { color: '#DCD0FF', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  summaryValue: { color: '#FFFFFF', fontSize: 38, lineHeight: 44, fontWeight: '800', letterSpacing: -1, marginTop: 2 },
  summaryIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  summaryDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.18)', marginVertical: 14 },
  summaryStats: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryStatValue: { color: '#FFFFFF', fontSize: 15, lineHeight: 20, fontWeight: '800' },
  summaryStatLabel: { color: '#DCD0FF', fontSize: 11, lineHeight: 16, fontWeight: '600' },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchBox: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '800',
  },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  listTitle: { fontSize: 16, fontWeight: '800' },
  listHint: { fontSize: 12, fontWeight: '600' },
  list: {
    gap: 10,
  },
  card: {
    minHeight: 96,
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  emptyState: { minHeight: 190, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyIcon: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
  emptyText: { fontSize: 13, lineHeight: 19, fontWeight: '500', textAlign: 'center', marginTop: 4 },
});
