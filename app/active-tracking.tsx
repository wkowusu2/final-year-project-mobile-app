import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { AppButton, AppHeader, Card, Chip, Screen } from '@/src/components/ui';
import { congestionSegments } from '@/src/data/mock-data';
import { radius, spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export default function ActiveTrackingScreen() {
  const theme = useAppTheme();

  return (
    <Screen style={styles.screen}>
      <AppHeader title="Active Tracking" subtitle="Modern driving dashboard with real-time trip quality" />
      <Card style={styles.mapShell}>
        <MapView
          initialRegion={{ latitude: 5.6037, longitude: -0.187, latitudeDelta: 0.08, longitudeDelta: 0.08 }}
          style={styles.map}>
          <Polyline coordinates={congestionSegments[1].coordinates} strokeColor={theme.primary} strokeWidth={7} />
          <Marker coordinate={{ latitude: 5.6037, longitude: -0.187 }} pinColor={theme.secondary} />
        </MapView>
        <View style={styles.dashboardOverlay}>
          <Chip label="Tracking Active" tone="success" />
          <View style={styles.statsRow}>
            <View><Text style={[styles.statLabel, { color: theme.textSecondary }]}>Current Speed</Text><Text style={[styles.statValue, { color: theme.textPrimary }]}>42 km/h</Text></View>
            <View><Text style={[styles.statLabel, { color: theme.textSecondary }]}>Distance</Text><Text style={[styles.statValue, { color: theme.textPrimary }]}>18.4 km</Text></View>
          </View>
          <View style={styles.statsRow}>
            <View><Text style={[styles.statLabel, { color: theme.textSecondary }]}>Duration</Text><Text style={[styles.statValue, { color: theme.textPrimary }]}>00:42:18</Text></View>
            <View><Text style={[styles.statLabel, { color: theme.textSecondary }]}>GPS Accuracy</Text><Text style={[styles.statValue, { color: theme.textPrimary }]}>4 m</Text></View>
          </View>
        </View>
      </Card>
      <View style={styles.actions}>
        <AppButton label="Pause Tracking" variant="ghost" />
        <AppButton label="Stop Tracking" variant="danger" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing.xl },
  mapShell: { flex: 1, padding: spacing.sm },
  map: { width: '100%', height: 520, borderRadius: radius.lg },
  dashboardOverlay: { position: 'absolute', left: 24, right: 24, bottom: 24, gap: spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.lg },
  statLabel: { fontSize: 13, fontWeight: '700' },
  statValue: { fontSize: 26, fontWeight: '900' },
  actions: { flexDirection: 'row', gap: spacing.sm },
});
