import { StyleSheet, Text, View } from 'react-native';
import MapView, { Circle } from 'react-native-maps';

import { AppHeader, Card, Screen } from '@/src/components/ui';
import { heatmapCells } from '@/src/data/mock-data';
import { radius, spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

const points = [
  { latitude: 5.6037, longitude: -0.187, intensity: 0.95 },
  { latitude: 5.5798, longitude: -0.226, intensity: 0.84 },
  { latitude: 5.6356, longitude: -0.103, intensity: 0.88 },
];

export default function TrafficHeatmapScreen() {
  const theme = useAppTheme();

  return (
    <Screen scrollable>
      <AppHeader title="Traffic Heatmap View" subtitle="Congestion hotspots, density, and time-based traffic patterns" />
      <Card>
        <MapView initialRegion={{ latitude: 5.6037, longitude: -0.187, latitudeDelta: 0.18, longitudeDelta: 0.18 }} style={styles.map}>
          {points.map((point, index) => (
            <Circle
              key={index}
              center={point}
              radius={2800}
              fillColor={`rgba(239, 68, 68, ${point.intensity * 0.35})`}
              strokeColor="rgba(239,68,68,0.6)"
            />
          ))}
        </MapView>
      </Card>
      <Card>
        <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '800' }}>Timeline slider</Text>
        <View style={[styles.timeline, { backgroundColor: theme.border }]}>
          <View style={[styles.timelineFill, { backgroundColor: theme.primary }]} />
        </View>
        <View style={styles.labels}>
          {heatmapCells.map((cell) => (
            <Text key={cell.label} style={{ color: theme.textSecondary, fontSize: 12 }}>{cell.label}</Text>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  map: { width: '100%', height: 320, borderRadius: radius.lg },
  timeline: { height: 10, borderRadius: radius.round, overflow: 'hidden' },
  timelineFill: { width: '58%', height: '100%' },
  labels: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
