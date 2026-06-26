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

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + 12 }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>My Reports</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>You&apos;ve submitted 6 reports</Text>
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
        <Pressable style={[styles.filterButton, { backgroundColor: theme.surface, borderColor: theme.border }]} accessibilityRole="button">
          <MaterialCommunityIcons color={theme.textSecondary} name="filter-variant" size={20} />
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
    paddingHorizontal: 14,
    gap: 12,
  },
  header: {
    gap: 4,
    paddingBottom: 2,
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchBox: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    gap: 10,
    paddingTop: 4,
  },
  card: {
    minHeight: 92,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
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
});
