import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/src/hooks/useAppTheme';
import { getReportDetail } from '@/src/data/report-data';
import { spacing } from '@/src/constants/design';

export default function IncidentDetailsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const report = getReportDetail(typeof params.id === 'string' ? params.id : undefined);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + 18 }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <BackButton onPress={() => router.back()} />
        <View style={styles.titleBlock}>
          <Text style={[styles.screenTitle, { color: theme.textPrimary }]}>Incident Details</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusPillTone[report.status].bg }]}>
          <Text style={[styles.statusText, { color: statusPillTone[report.status].text }]}>{report.status}</Text>
        </View>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: summaryTone[report.badgeTone].bg }]}>
        <View style={[styles.summaryIcon, { backgroundColor: summaryTone[report.badgeTone].iconBg }]}>
          <MaterialCommunityIcons color={summaryTone[report.badgeTone].iconColor} name={report.icon as never} size={24} />
        </View>

        <View style={styles.summaryBody}>
          <Text style={[styles.summaryLabel, { color: summaryTone[report.badgeTone].label }]}>{report.header}</Text>
          <Text style={[styles.summaryTitle, { color: theme.textPrimary }]}>{report.type}</Text>
          <View style={[styles.severityPill, { backgroundColor: summaryTone[report.badgeTone].pillBg }]}>
            <Text style={[styles.severityText, { color: summaryTone[report.badgeTone].pillText }]}>{report.severityLabel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.mapCard}>
        <View style={styles.mapGrid}>
          <View style={[styles.mapLane, { backgroundColor: '#D9E6F7' }]} />
          <View style={[styles.mapLane, { backgroundColor: '#E7EEF9' }]} />
          <View style={[styles.mapLane, { backgroundColor: '#D9E6F7' }]} />
          <View style={[styles.mapLane, { backgroundColor: '#E7EEF9' }]} />
          <View style={[styles.mapRoad, { backgroundColor: '#FF4D77' }]} />
          <View style={[styles.mapMarker, { backgroundColor: '#FF1F54' }]}>
            <Text style={styles.mapMarkerText}>!</Text>
          </View>
        </View>
        <View style={styles.locationRow}>
          <MaterialCommunityIcons color={theme.primary} name="map-marker-outline" size={14} />
          <Text style={[styles.locationText, { color: theme.textPrimary }]}>{report.location} Intersection, {report.city}</Text>
        </View>
      </View>

      <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
        <InfoRow icon="account-outline" iconBg="#F4F0FF" iconColor="#5B21F0" label={report.reporterMeta} value={report.reporter} />
        <Divider color={theme.border} />
        <InfoRow icon="clock-outline" iconBg="#ECFBF7" iconColor="#14B8A6" label="Timestamp" value={report.time} subvalue="12 minutes ago" />
        <Divider color={theme.border} />
        <InfoRow icon="check-circle-outline" iconBg="#EEFDF2" iconColor="#22C55E" label="Status" value={report.statusLabel} subvalue={report.statusDetail} />
      </View>

      <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Description</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>{report.description}</Text>
      </View>

      <View style={styles.actionRow}>
        <ActionButton label={`Verify (${report.voteCount})`} icon="thumb-up-outline" />
        <ActionButton label="Share" icon="share-variant-outline" />
      </View>
    </ScrollView>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.backButton} accessibilityRole="button" onPress={onPress}>
      <MaterialCommunityIcons color="#1B1D35" name="chevron-left" size={24} />
    </Pressable>
  );
}

function ActionButton({ label, icon }: { label: string; icon: string }) {
  const theme = useAppTheme();
  return (
    <View style={[styles.actionButton, { backgroundColor: theme.surface }]}>
      <MaterialCommunityIcons color={theme.primary} name={icon as never} size={18} />
      <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>{label}</Text>
    </View>
  );
}

function InfoRow({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  subvalue,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  subvalue?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons color={iconColor} name={icon as never} size={18} />
      </View>
      <View style={styles.infoBody}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
        {subvalue ? <Text style={styles.infoSubvalue}>{subvalue}</Text> : null}
      </View>
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return <View style={[styles.divider, { backgroundColor: color }]} />;
}

const summaryTone = {
  danger: {
    bg: '#FFF2F4',
    iconBg: '#FFE0E6',
    iconColor: '#FF1F54',
    label: '#A855F7',
    pillBg: '#FFE0E6',
    pillText: '#FF1F54',
  },
  warning: {
    bg: '#FFF9E8',
    iconBg: '#FFEFC0',
    iconColor: '#F59E0B',
    label: '#A16207',
    pillBg: '#FFF0C8',
    pillText: '#D97706',
  },
  success: {
    bg: '#EEFDF2',
    iconBg: '#DDF7E6',
    iconColor: '#22C55E',
    label: '#16A34A',
    pillBg: '#DDF7E6',
    pillText: '#16A34A',
  },
} as const;

const statusPillTone = {
  Pending: { bg: '#FFF4D9', text: '#D97706' },
  Verified: { bg: '#ECEBFF', text: '#5B21F0' },
  Resolved: { bg: '#DDF7E6', text: '#16A34A' },
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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#F1F3F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  summaryCard: {
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBody: {
    flex: 1,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  summaryTitle: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
  },
  severityPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '800',
  },
  mapCard: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 10,
    gap: 8,
  },
  mapGrid: {
    height: 126,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    flexDirection: 'row',
  },
  mapLane: {
    flex: 1,
    opacity: 0.95,
  },
  mapRoad: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '46%',
    height: 8,
    transform: [{ translateY: -4 }],
  },
  mapMarker: {
    position: 'absolute',
    left: '46%',
    top: '39%',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFE0E6',
  },
  mapMarkerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: -1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 18,
    padding: 14,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBody: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    color: '#A1A7BC',
    fontSize: 12,
    fontWeight: '700',
  },
  infoValue: {
    color: '#1B1D35',
    fontSize: 15,
    fontWeight: '800',
  },
  infoSubvalue: {
    color: '#7C8194',
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
