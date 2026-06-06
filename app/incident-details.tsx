import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { AppHeader, Card, Chip, Screen } from '@/src/components/ui';
import { incidents } from '@/src/data/mock-data';
import { radius, spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export default function IncidentDetailsScreen() {
  const theme = useAppTheme();
  const incident = incidents[0];

  return (
    <Screen scrollable>
      <AppHeader title="Incident Details" subtitle="Report status, evidence, and map preview" />
      <Card>
        <View style={styles.topRow}>
          <Chip label={incident.type} tone="danger" />
          <Chip label={incident.status} tone="success" />
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{incident.roadName}</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>{incident.description}</Text>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>Reported by {incident.reporterName} · {incident.reporterRole}</Text>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>Timestamp: {incident.timestamp}</Text>
      </Card>
      <Card>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Photo evidence</Text>
        <View style={[styles.photo, { backgroundColor: theme.backgroundMuted }]}>
          <Text style={{ color: theme.textSecondary }}>Traffic scene photo placeholder</Text>
        </View>
      </Card>
      <Card>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Map preview</Text>
        <MapView initialRegion={{ ...incident.coordinate, latitudeDelta: 0.03, longitudeDelta: 0.03 }} style={styles.map}>
          <Marker coordinate={incident.coordinate} title={incident.type} />
        </MapView>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  title: { fontSize: 18, fontWeight: '800' },
  body: { fontSize: 15, lineHeight: 22 },
  meta: { fontSize: 13 },
  photo: { height: 180, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  map: { width: '100%', height: 220, borderRadius: radius.lg },
});
