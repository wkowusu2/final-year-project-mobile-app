import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { AppButton, AppHeader, Card, Chip, MetricCard, Screen, SectionTitle } from '@/src/components/ui';
import { congestionSegments, currentUser, dashboardMetrics, incidents, quickActions } from '@/src/data/mock-data';
import { radius, spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

const initialRegion = {
  latitude: 5.6037,
  longitude: -0.187,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

export default function HomeScreen() {
  const theme = useAppTheme();

  const trafficColor = {
    free: theme.congestionFree,
    moderate: theme.congestionModerate,
    heavy: theme.congestionHeavy,
    severe: theme.congestionSevere,
  };

  return (
    <Screen scrollable>
      <AppHeader
        title={`Hello, ${currentUser.name.split(' ')[0]}`}
        subtitle={currentUser.location}
        right={<View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}><Text style={[styles.avatarText, { color: theme.primary }]}>{currentUser.photoInitials}</Text></View>}
      />

      <Card style={styles.mapCard}>
        <MapView initialRegion={initialRegion} style={styles.map}>
          {congestionSegments.map((segment) => (
            <Polyline
              key={segment.id}
              coordinates={segment.coordinates}
              strokeColor={trafficColor[segment.level]}
              strokeWidth={7}
            />
          ))}
          <Marker coordinate={incidents[0].coordinate} title={incidents[0].type} />
          <Marker coordinate={{ latitude: 5.6037, longitude: -0.187 }} title="Current location" pinColor={theme.primary} />
        </MapView>
        <View style={styles.legendRow}>
          <Chip label="Green = Free Flow" tone="success" />
          <Chip label="Yellow = Moderate" tone="warning" />
          <Chip label="Red = Heavy" tone="danger" />
          <Chip label="Dark Red = Severe" tone="danger" />
        </View>
      </Card>

      <View style={styles.metricGrid}>
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.id} label={metric.label} value={metric.value} detail={metric.change} />
        ))}
      </View>

      <SectionTitle title="Quick Actions" />
      <View style={styles.actionsGrid}>
        {quickActions.map((action) => (
          <Card key={action.id} style={styles.actionCard}>
            <Text style={[styles.actionIcon, { color: theme.primary }]}>{action.icon}</Text>
            <Text style={[styles.actionLabel, { color: theme.textPrimary }]}>{action.label}</Text>
            <AppButton label="Open" variant="ghost" onPress={() => router.push(action.route as never)} />
          </Card>
        ))}
      </View>

      <SectionTitle title="Nearby roads" action="View map" />
      {congestionSegments.map((segment) => (
        <Card key={segment.id}>
          <View style={styles.roadRow}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={[styles.roadName, { color: theme.textPrimary }]}>{segment.roadName}</Text>
              <Text style={[styles.roadMeta, { color: theme.textSecondary }]}>{segment.averageSpeed} km/h average · {segment.travelTimeMinutes} min travel time</Text>
            </View>
            <Chip label={segment.level.toUpperCase()} tone={segment.level === 'free' ? 'success' : segment.level === 'moderate' ? 'warning' : 'danger'} />
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  mapCard: {
    padding: spacing.sm,
  },
  map: {
    width: '100%',
    height: 260,
    borderRadius: radius.lg,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionCard: {
    width: '47%',
  },
  actionIcon: {
    fontSize: 24,
    fontWeight: '900',
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  roadRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  roadName: {
    fontSize: 16,
    fontWeight: '800',
  },
  roadMeta: {
    fontSize: 14,
  },
});
