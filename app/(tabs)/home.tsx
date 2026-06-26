import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { currentUser, incidents, quickActions } from '@/src/data/mock-data';
import { spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

const metrics = [
  {
    id: 'speed',
    label: 'Speed',
    value: '42',
    unit: 'km/h',
    icon: 'navigation-variant-outline',
    iconColor: '#5B21F0',
    iconBg: '#F4F0FF',
  },
  {
    id: 'distance',
    label: 'Distance',
    value: '8.4',
    unit: 'km',
    icon: 'map-marker-distance',
    iconColor: '#14B8A6',
    iconBg: '#ECFBF7',
  },
  {
    id: 'tracking',
    label: 'Tracking',
    value: 'Active',
    unit: '',
    icon: 'flash-outline',
    iconColor: '#22C55E',
    iconBg: '#EEFDF2',
  },
] as const;

export default function HomeScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <View style={styles.greetingBlock}>
          <Text style={[styles.eyebrow, { color: theme.textSecondary }]}>Good morning 👋</Text>
          <Text style={[styles.userName, { color: theme.textPrimary }]}>{currentUser.name}</Text>
          <View style={styles.locationRow}>
            <View style={styles.locationDot} />
            <Text style={[styles.locationText, { color: theme.textSecondary }]}>{currentUser.location}</Text>
          </View>
        </View>

        <View style={styles.topActions}>
          <Pressable style={[styles.iconButton, { backgroundColor: theme.surface }]} accessibilityRole="button">
            <MaterialCommunityIcons color={theme.textSecondary} name="bell-outline" size={20} />
            <View style={styles.notificationDot} />
          </Pressable>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>{currentUser.photoInitials}</Text>
          </View>
        </View>
      </View>

      <View style={styles.trafficBarWrap}>
        <View style={[styles.trafficBarLeft, { backgroundColor: theme.primary }]} />
        <View style={[styles.trafficBarRight, { backgroundColor: theme.secondary }]} />
      </View>

      <View style={[styles.sectionHeaderCard, { backgroundColor: theme.surface }]}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeaderTitle, { color: theme.textPrimary }]}>Live Traffic Map</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/map')} style={styles.fullMapLink}>
            <Text style={[styles.fullMapText, { color: theme.primary }]}>Full Map</Text>
            <MaterialCommunityIcons color={theme.primary} name="chevron-right" size={18} />
          </Pressable>
        </View>
      </View>

      <View style={styles.metricsRow}>
        {metrics.map((metric) => (
          <View key={metric.id} style={[styles.metricCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.metricIcon, { backgroundColor: metric.iconBg }]}>
              <MaterialCommunityIcons color={metric.iconColor} name={metric.icon as never} size={20} />
            </View>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>{metric.label}</Text>
            <View style={styles.metricValueRow}>
              <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{metric.value}</Text>
              {metric.unit ? <Text style={[styles.metricUnit, { color: theme.textSecondary }]}>{metric.unit}</Text> : null}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {quickActions.map((action, index) => {
            const tone = quickActionTone[index];
            return (
              <Pressable
                key={action.id}
                style={[styles.quickCard, { backgroundColor: theme.surface }]}
                accessibilityRole="button"
                onPress={() => router.push(action.route as never)}>
                <View style={[styles.quickIcon, { backgroundColor: tone.bg }]}>
                  <MaterialCommunityIcons color={tone.color} name={tone.icon as never} size={20} />
                </View>
                <Text style={[styles.quickLabel, { color: theme.textPrimary }]}>{action.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Nearby Incidents</Text>
          <Pressable accessibilityRole="button">
            <Text style={[styles.seeAll, { color: theme.primary }]}>See all</Text>
          </Pressable>
        </View>

        <View style={styles.incidentList}>
          {incidents.slice(0, 3).map((incident) => (
            <Pressable
              key={incident.id}
              accessibilityRole="button"
              onPress={() => router.push('/incident-details')}
              style={[styles.incidentCard, { backgroundColor: theme.surface }]}>
              <View style={styles.incidentLeft}>
                <View style={[styles.incidentIcon, { backgroundColor: incidentTone[incident.severity].bg }]}>
                  <MaterialCommunityIcons
                    color={incidentTone[incident.severity].color}
                    name={incidentTone[incident.severity].icon as never}
                    size={16}
                  />
                </View>
              </View>

              <View style={styles.incidentBody}>
                <Text style={[styles.incidentTitle, { color: theme.textPrimary }]}>{incident.type}</Text>
                <Text style={[styles.incidentRoad, { color: theme.textSecondary }]}>{incident.roadName}</Text>
              </View>

              <View style={styles.incidentMeta}>
                <View style={[styles.severityPill, { backgroundColor: incidentTone[incident.severity].pillBg }]}>
                  <Text style={[styles.severityText, { color: incidentTone[incident.severity].pillText }]}>{incident.severity}</Text>
                </View>
                <Text style={[styles.incidentTime, { color: theme.textSecondary }]}>{incident.timestamp}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const quickActionTone = [
  { bg: '#F4F0FF', color: '#5B21F0', icon: 'navigation-variant-outline' },
  { bg: '#FFF1F2', color: '#F43F5E', icon: 'stop-circle-outline' },
  { bg: '#FFF9E8', color: '#F59E0B', icon: 'alert-outline' },
  { bg: '#F3E8FF', color: '#A855F7', icon: 'chart-bar' },
] as const;

const incidentTone = {
  High: {
    bg: '#FFF1F2',
    color: '#F43F5E',
    pillBg: '#FFE4E9',
    pillText: '#F43F5E',
    icon: 'alert-outline',
  },
  Medium: {
    bg: '#FFF9E8',
    color: '#F59E0B',
    pillBg: '#FFEFBE',
    pillText: '#B45309',
    icon: 'alert-outline',
  },
  Low: {
    bg: '#EEFDF2',
    color: '#22C55E',
    pillBg: '#DCFCE7',
    pillText: '#16A34A',
    icon: 'alert-outline',
  },
} as const;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  greetingBlock: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#22C55E',
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    right: 11,
    top: 11,
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  trafficBarWrap: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    marginHorizontal: 14,
    marginTop: 2,
    backgroundColor: '#E5E7EB',
  },
  trafficBarLeft: {
    flex: 0.68,
  },
  trafficBarRight: {
    flex: 0.32,
  },
  sectionHeaderCard: {
    marginHorizontal: 14,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  fullMapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  fullMapText: {
    fontSize: 13,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 8,
    minHeight: 108,
    alignItems: 'center',
  },
  metricIcon: {
    width: 30,
    height: 30,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  metricValue: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionBlock: {
    paddingHorizontal: 14,
    gap: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '700',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickCard: {
    width: '23%',
    minHeight: 90,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickIcon: {
    width: 30,
    height: 30,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  incidentList: {
    gap: 10,
  },
  incidentCard: {
    minHeight: 54,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  incidentLeft: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  incidentIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incidentBody: {
    flex: 1,
    gap: 2,
  },
  incidentTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  incidentRoad: {
    fontSize: 12,
    fontWeight: '500',
  },
  incidentMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  severityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '800',
  },
  incidentTime: {
    fontSize: 11,
    fontWeight: '500',
  },
});
