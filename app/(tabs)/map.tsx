import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { AppButton, AppHeader, Card, Chip, Screen } from '@/src/components/ui';
import { congestionSegments, incidents } from '@/src/data/mock-data';
import { radius, spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

const initialRegion = {
  latitude: 5.6037,
  longitude: -0.187,
  latitudeDelta: 0.18,
  longitudeDelta: 0.18,
};

export default function MapScreen() {
  const theme = useAppTheme();
  const trafficColor = {
    free: theme.congestionFree,
    moderate: theme.congestionModerate,
    heavy: theme.congestionHeavy,
    severe: theme.congestionSevere,
  };

  return (
    <Screen style={styles.container}>
      <AppHeader title="Live Traffic Map" subtitle="Traffic layer, incidents, and filters" />
      <View style={styles.filterRow}>
        <Chip label="Time" tone="primary" />
        <Chip label="Congestion Level" tone="warning" />
        <Chip label="Road Type" tone="default" />
      </View>
      <Card style={styles.mapShell}>
        <MapView initialRegion={initialRegion} style={styles.map}>
          {congestionSegments.map((segment) => (
            <Polyline key={segment.id} coordinates={segment.coordinates} strokeWidth={8} strokeColor={trafficColor[segment.level]} />
          ))}
          {incidents.map((incident) => (
            <Marker key={incident.id} coordinate={incident.coordinate} title={incident.type} description={incident.roadName} />
          ))}
          <Marker coordinate={{ latitude: 5.6037, longitude: -0.187 }} title="You" pinColor={theme.primary} />
        </MapView>
        <View style={styles.floatingButtons}>
          <AppButton label="Center Location" variant="ghost" />
          <AppButton label="Report Incident" variant="secondary" onPress={() => router.push('/report-incident')} />
          <AppButton label="Filters" variant="outline" />
        </View>
      </Card>
      <Card>
        <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>Map overview</Text>
        <Text style={[styles.infoBody, { color: theme.textSecondary }]}>Severe delays remain concentrated around Spintex Road and Circle, while Liberation Road is moving with steadier travel times.</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  mapShell: {
    flex: 1,
    padding: spacing.sm,
  },
  map: {
    width: '100%',
    height: 520,
    borderRadius: radius.lg,
  },
  floatingButtons: {
    position: 'absolute',
    right: 20,
    top: 20,
    gap: spacing.sm,
    width: 150,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  infoBody: {
    fontSize: 15,
    lineHeight: 22,
  },
});
