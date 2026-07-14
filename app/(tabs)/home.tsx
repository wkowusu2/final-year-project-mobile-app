import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { incidents } from '@/src/data/mock-data';
import { useAppTheme } from '@/src/hooks/useAppTheme';

const quickActions = [
  { label: 'Live map', detail: 'View traffic', icon: 'map-outline', route: '/(tabs)/map', color: '#6D3DF5', background: '#F0EBFF' },
  { label: 'Report', detail: 'Road incident', icon: 'alert-outline', route: '/report-incident', color: '#E16B16', background: '#FFF1E5' },
  { label: 'Insights', detail: 'Your journeys', icon: 'chart-box-outline', route: '/traffic-insights', color: '#078B7C', background: '#E4F8F5' },
  { label: 'Rewards', detail: 'Your progress', icon: 'medal-outline', route: '/rewards', color: '#B77908', background: '#FFF6D9' },
] as const;

const stats = [
  { label: 'Distance', value: '8.4', unit: 'km' },
  { label: 'Drive time', value: '24', unit: 'min' },
  { label: 'Reports', value: '6', unit: 'this week' },
] as const;

export default function HomeScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>GOOD MORNING</Text>
          <Text style={[styles.name, { color: theme.textPrimary }]}>Ama, drive safe.</Text>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons color={theme.primary} name="map-marker" size={15} />
            <Text style={[styles.location, { color: theme.textSecondary }]}>Accra, Greater Accra</Text>
          </View>
        </View>
        <Pressable
          accessibilityLabel="Open notifications"
          accessibilityRole="button"
          onPress={() => router.push('/notifications')}
          style={({ pressed }) => [styles.notificationButton, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}>
          <MaterialCommunityIcons color={theme.textPrimary} name="bell-outline" size={22} />
          <View style={styles.notificationDot} />
        </Pressable>
      </View>

      <View style={styles.tripCard}>
        <View style={styles.tripTopRow}>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>READY TO TRACK</Text>
          </View>
          <MaterialCommunityIcons color="#CDBEFF" name="crosshairs-gps" size={23} />
        </View>
        <Text style={styles.tripTitle}>Turn today’s drive{`\n`}into better roads.</Text>
        <Text style={styles.tripDescription}>Share anonymous movement data to improve traffic across Accra.</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/active-tracking')}
          style={({ pressed }) => [styles.startButton, { opacity: pressed ? 0.88 : 1 }]}>
          <View style={styles.startIcon}>
            <MaterialCommunityIcons color="#5B21F0" name="navigation" size={17} />
          </View>
          <Text style={styles.startButtonText}>Start a drive</Text>
          <MaterialCommunityIcons color="#5B21F0" name="arrow-right" size={19} />
        </Pressable>
      </View>

      <View style={[styles.statsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {stats.map((stat, index) => (
          <View key={stat.label} style={[styles.stat, index < stats.length - 1 && { borderRightWidth: 1, borderRightColor: theme.border }]}>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stat.value}<Text style={[styles.statUnit, { color: theme.textSecondary }]}> {stat.unit}</Text></Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>What do you need?</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Your driving tools, all in one place.</Text>
        </View>
      </View>
      <View style={styles.actionGrid}>
        {quickActions.map((action) => (
          <Pressable
            key={action.label}
            accessibilityRole="button"
            onPress={() => router.push(action.route)}
            style={({ pressed }) => [styles.actionCard, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.9 : 1 }]}>
            <View style={[styles.actionIcon, { backgroundColor: action.background }]}>
              <MaterialCommunityIcons color={action.color} name={action.icon} size={22} />
            </View>
            <View style={styles.actionCopy}>
              <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>{action.label}</Text>
              <Text style={[styles.actionDetail, { color: theme.textSecondary }]}>{action.detail}</Text>
            </View>
            <MaterialCommunityIcons color={theme.textMuted} name="chevron-right" size={19} />
          </Pressable>
        ))}
      </View>

      <View style={styles.incidentHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Near you</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Latest community reports</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/reports')} hitSlop={8}>
          <Text style={[styles.seeAll, { color: theme.primary }]}>View all</Text>
        </Pressable>
      </View>
      <View style={[styles.incidentList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {incidents.slice(0, 3).map((incident, index) => (
          <Pressable
            key={incident.id}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/incident-details', params: { id: incident.id } })}
            style={({ pressed }) => [styles.incidentRow, index < 2 && { borderBottomWidth: 1, borderBottomColor: theme.border }, { opacity: pressed ? 0.82 : 1 }]}>
            <View style={[styles.incidentIcon, { backgroundColor: incident.severity === 'High' ? '#FFF0F1' : incident.severity === 'Medium' ? '#FFF6E8' : '#EAF9EF' }]}>
              <MaterialCommunityIcons color={incident.severity === 'High' ? '#E5484D' : incident.severity === 'Medium' ? '#D97706' : '#16A34A'} name="alert-outline" size={20} />
            </View>
            <View style={styles.incidentCopy}>
              <Text numberOfLines={1} style={[styles.incidentTitle, { color: theme.textPrimary }]}>{incident.type}</Text>
              <Text numberOfLines={1} style={[styles.incidentRoad, { color: theme.textSecondary }]}>{incident.roadName}</Text>
            </View>
            <View style={styles.incidentTimeWrap}>
              <Text style={[styles.incidentTime, { color: theme.textSecondary }]}>{incident.timestamp}</Text>
              <MaterialCommunityIcons color={theme.textMuted} name="chevron-right" size={18} />
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 22 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  greeting: { fontSize: 11, fontWeight: '800', letterSpacing: 1.1, marginBottom: 5 },
  name: { fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: -0.7 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 7 },
  location: { fontSize: 13, fontWeight: '500' },
  notificationButton: { width: 46, height: 46, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', top: 11, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: '#F04438', borderWidth: 1.5, borderColor: '#FFFFFF' },
  tripCard: { backgroundColor: '#5420CD', borderRadius: 26, padding: 22, overflow: 'hidden' },
  tripTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(255,255,255,0.14)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999 },
  statusDot: { height: 7, width: 7, borderRadius: 4, backgroundColor: '#74E7B7' },
  statusText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  tripTitle: { color: '#FFFFFF', fontSize: 27, lineHeight: 32, fontWeight: '800', letterSpacing: -0.65, marginTop: 22 },
  tripDescription: { color: '#DFD5FF', fontSize: 14, lineHeight: 20, fontWeight: '500', maxWidth: '94%', marginTop: 10 },
  startButton: { minHeight: 52, marginTop: 22, borderRadius: 16, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 13 },
  startIcon: { height: 29, width: 29, borderRadius: 10, backgroundColor: '#EEE9FF', alignItems: 'center', justifyContent: 'center' },
  startButtonText: { color: '#4A1BAF', fontSize: 15, fontWeight: '800', flex: 1 },
  statsCard: { minHeight: 86, borderWidth: 1, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, paddingHorizontal: 11, alignItems: 'center' },
  statValue: { fontSize: 20, lineHeight: 25, fontWeight: '800', letterSpacing: -0.4, textAlign: 'center' },
  statUnit: { fontSize: 11, fontWeight: '700', letterSpacing: 0 },
  statLabel: { fontSize: 11, lineHeight: 16, fontWeight: '600', marginTop: 3, textAlign: 'center' },
  sectionHeading: { marginTop: 2 },
  sectionTitle: { fontSize: 20, lineHeight: 25, fontWeight: '800', letterSpacing: -0.4 },
  sectionSubtitle: { fontSize: 13, lineHeight: 19, fontWeight: '500', marginTop: 2 },
  actionGrid: { gap: 10 },
  actionCard: { minHeight: 76, padding: 13, borderRadius: 18, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  actionCopy: { flex: 1 },
  actionTitle: { fontSize: 15, lineHeight: 20, fontWeight: '800' },
  actionDetail: { fontSize: 12, lineHeight: 17, fontWeight: '500', marginTop: 1 },
  incidentHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 2 },
  seeAll: { fontSize: 13, fontWeight: '800', paddingVertical: 3 },
  incidentList: { borderWidth: 1, borderRadius: 20, overflow: 'hidden' },
  incidentRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 11 },
  incidentIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  incidentCopy: { flex: 1 },
  incidentTitle: { fontSize: 14, lineHeight: 19, fontWeight: '800' },
  incidentRoad: { fontSize: 12, lineHeight: 17, fontWeight: '500', marginTop: 1 },
  incidentTimeWrap: { alignItems: 'flex-end', flexDirection: 'row', gap: 2 },
  incidentTime: { fontSize: 11, fontWeight: '600' },
});
