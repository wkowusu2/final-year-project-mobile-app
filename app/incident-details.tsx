import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getReportDetail } from '@/src/data/report-data';
import { useAppTheme } from '@/src/hooks/useAppTheme';

const statusTone = {
  Pending: { color: '#D97706', background: '#FFF4D9', label: 'Awaiting confirmation' },
  Verified: { color: '#6D3DF5', background: '#F0EBFF', label: 'Verified by drivers' },
  Resolved: { color: '#16875A', background: '#E6F7EF', label: 'Incident resolved' },
} as const;

const severityTone = {
  High: { color: '#D84045', background: '#FFF0F1', icon: 'alert-octagon-outline' },
  Medium: { color: '#D97706', background: '#FFF6E5', icon: 'alert-outline' },
  Low: { color: '#16875A', background: '#E6F7EF', icon: 'information-outline' },
} as const;

export default function IncidentDetailsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const report = getReportDetail(typeof params.id === 'string' ? params.id : undefined);
  const [isVerified, setIsVerified] = useState(false);
  const status = statusTone[report.status];
  const severity = severityTone[report.severity];
  const voteCount = report.voteCount + (isVerified ? 1 : 0);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}>
          <MaterialCommunityIcons color={theme.textPrimary} name="chevron-left" size={23} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Incident details</Text>
        <Pressable
          accessibilityLabel="Open location on map"
          accessibilityRole="button"
          onPress={() => router.push('/(tabs)/map')}
          style={({ pressed }) => [styles.mapButton, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}>
          <MaterialCommunityIcons color={theme.primary} name="map-outline" size={20} />
        </Pressable>
      </View>

      <View style={[styles.incidentHero, { backgroundColor: severity.background }]}>
        <View style={styles.heroTopRow}>
          <View style={[styles.incidentIcon, { backgroundColor: theme.surface }]}><MaterialCommunityIcons color={severity.color} name={report.icon as never} size={25} /></View>
          <View style={styles.heroTitleCopy}>
            <Text style={[styles.heroEyebrow, { color: severity.color }]}>ROAD INCIDENT</Text>
            <Text style={[styles.incidentTitle, { color: theme.textPrimary }]}>{report.type}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: status.background }]}><Text style={[styles.statusText, { color: status.color }]}>{report.status}</Text></View>
        </View>
        <View style={styles.heroFooter}>
          <View style={[styles.severityPill, { backgroundColor: theme.surface }]}><MaterialCommunityIcons color={severity.color} name={severity.icon as never} size={14} /><Text style={[styles.severityText, { color: severity.color }]}>{report.severityLabel}</Text></View>
          <Text style={[styles.heroTimestamp, { color: theme.textSecondary }]}>{report.time}</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/(tabs)/map')}
        style={({ pressed }) => [styles.locationCard, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.88 : 1 }]}>
        <View style={[styles.mapPreview, { backgroundColor: theme.primarySoft }]}>
          <View style={[styles.mapRoadHorizontal, { backgroundColor: theme.primary }]} />
          <View style={[styles.mapRoadVertical, { backgroundColor: '#B8A4FB' }]} />
          <View style={[styles.mapPin, { backgroundColor: severity.color }]}><MaterialCommunityIcons color="#FFFFFF" name="alert" size={15} /></View>
        </View>
        <View style={styles.locationCopy}>
          <Text style={[styles.locationLabel, { color: theme.textSecondary }]}>INCIDENT LOCATION</Text>
          <Text style={[styles.locationTitle, { color: theme.textPrimary }]}>{report.location}, {report.city}</Text>
          <Text style={[styles.locationHint, { color: theme.primary }]}>View on live map</Text>
        </View>
        <MaterialCommunityIcons color={theme.textMuted} name="chevron-right" size={21} />
      </Pressable>

      <View style={[styles.descriptionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.cardHeading}><Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>What drivers should know</Text><MaterialCommunityIcons color={theme.textMuted} name="information-outline" size={19} /></View>
        <Text style={[styles.description, { color: theme.textSecondary }]}>{report.description}</Text>
      </View>

      <View style={[styles.detailsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <DetailRow icon="account-outline" iconBackground="#F0EBFF" iconColor="#6D3DF5" label={report.reporterMeta} value={report.reporter} />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <DetailRow icon="clock-outline" iconBackground="#E4F8F5" iconColor="#078B7C" label="Reported" value={report.time} />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <DetailRow icon="check-decagram-outline" iconBackground={status.background} iconColor={status.color} label="Community status" value={status.label} detail={report.statusDetail} />
      </View>

      <View style={[styles.communityCard, { backgroundColor: theme.primarySoft }]}>
        <View style={[styles.communityIcon, { backgroundColor: theme.primary }]}><MaterialCommunityIcons color="#FFFFFF" name="account-group-outline" size={19} /></View>
        <View style={styles.communityCopy}>
          <Text style={[styles.communityTitle, { color: theme.textPrimary }]}>{voteCount} drivers found this helpful</Text>
          <Text style={[styles.communityText, { color: theme.textSecondary }]}>Confirm this report if you can see the incident.</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setIsVerified((value) => !value)}
        style={({ pressed }) => [styles.verifyButton, { backgroundColor: isVerified ? theme.surface : theme.primary, borderColor: theme.primary, opacity: pressed ? 0.84 : 1 }]}>
        <MaterialCommunityIcons color={isVerified ? theme.primary : '#FFFFFF'} name={isVerified ? 'check-circle-outline' : 'thumb-up-outline'} size={19} />
        <Text style={[styles.verifyButtonText, { color: isVerified ? theme.primary : '#FFFFFF' }]}>{isVerified ? 'You confirmed this incident' : 'Confirm this incident'}</Text>
      </Pressable>
    </ScrollView>
  );
}

function DetailRow({ icon, iconBackground, iconColor, label, value, detail }: { icon: string; iconBackground: string; iconColor: string; label: string; value: string; detail?: string }) {
  const theme = useAppTheme();
  return (
    <View style={styles.detailRow}>
      <View style={[styles.detailIcon, { backgroundColor: iconBackground }]}><MaterialCommunityIcons color={iconColor} name={icon as never} size={19} /></View>
      <View style={styles.detailCopy}>
        <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{value}</Text>
        {detail ? <Text style={[styles.detailText, { color: theme.textSecondary }]}>{detail}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 43, height: 43, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.25 },
  mapButton: { width: 43, height: 43, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  incidentHero: { borderRadius: 24, padding: 17, gap: 17 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  incidentIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  heroTitleCopy: { flex: 1 },
  heroEyebrow: { fontSize: 10, lineHeight: 14, fontWeight: '900', letterSpacing: 0.9 },
  incidentTitle: { fontSize: 23, lineHeight: 28, fontWeight: '800', letterSpacing: -0.4, marginTop: 2 },
  statusPill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  statusText: { fontSize: 10, fontWeight: '900' },
  heroFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  severityPill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  severityText: { fontSize: 11, fontWeight: '800' },
  heroTimestamp: { fontSize: 11, fontWeight: '600' },
  locationCard: { minHeight: 92, borderRadius: 20, borderWidth: 1, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 11 },
  mapPreview: { width: 69, height: 69, borderRadius: 14, overflow: 'hidden', position: 'relative' },
  mapRoadHorizontal: { height: 8, position: 'absolute', left: -5, right: -5, top: 31, transform: [{ rotate: '-16deg' }] },
  mapRoadVertical: { width: 8, position: 'absolute', top: -6, bottom: -6, left: 32, transform: [{ rotate: '27deg' }] },
  mapPin: { width: 26, height: 26, borderRadius: 13, position: 'absolute', top: 21, left: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFFFFF' },
  locationCopy: { flex: 1 },
  locationLabel: { fontSize: 9, lineHeight: 13, fontWeight: '900', letterSpacing: 0.85 },
  locationTitle: { fontSize: 14, lineHeight: 19, fontWeight: '800', marginTop: 2 },
  locationHint: { fontSize: 11, lineHeight: 16, fontWeight: '700', marginTop: 2 },
  descriptionCard: { borderWidth: 1, borderRadius: 20, padding: 15 },
  cardHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  description: { fontSize: 14, lineHeight: 21, fontWeight: '500' },
  detailsCard: { borderWidth: 1, borderRadius: 20, padding: 14 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  detailIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  detailCopy: { flex: 1 },
  detailLabel: { fontSize: 11, lineHeight: 16, fontWeight: '700' },
  detailValue: { fontSize: 14, lineHeight: 19, fontWeight: '800' },
  detailText: { fontSize: 11, lineHeight: 16, fontWeight: '500', marginTop: 1 },
  divider: { height: 1, marginVertical: 12 },
  communityCard: { minHeight: 70, borderRadius: 18, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10 },
  communityIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  communityCopy: { flex: 1 },
  communityTitle: { fontSize: 13, fontWeight: '800' },
  communityText: { fontSize: 11, lineHeight: 16, fontWeight: '500', marginTop: 1 },
  verifyButton: { minHeight: 56, borderWidth: 1, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  verifyButtonText: { fontSize: 15, fontWeight: '800' },
});
