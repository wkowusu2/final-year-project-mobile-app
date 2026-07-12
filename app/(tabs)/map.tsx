import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';

import { AppButton, AppHeader, Card, Chip, Screen } from '@/src/components/ui';
import { incidents } from '@/src/data/mock-data';
import { radius, spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { api } from '@/src/services/api';
import { RoadBounds, RoadFeature } from '@/src/types/map';

const initialRegion = {
  latitude: 5.6037,
  longitude: -0.187,
  latitudeDelta: 0.18,
  longitudeDelta: 0.18,
};
const MAX_VIEWPORT_SPAN = 0.25;

function boundsFromRegion(region: Region): RoadBounds {
  return {
    west: region.longitude - region.longitudeDelta / 2,
    south: region.latitude - region.latitudeDelta / 2,
    east: region.longitude + region.longitudeDelta / 2,
    north: region.latitude + region.latitudeDelta / 2,
  };
}

function coordinatesFromRoad(road: RoadFeature) {
  const coordinates = road.geometry.coordinates.flatMap(([longitude, latitude]) => (
    Number.isFinite(latitude) && Number.isFinite(longitude) ? [{ latitude, longitude }] : []
  ));

  return coordinates.length >= 2 ? coordinates : null;
}

export default function MapScreen() {
  const theme = useAppTheme();
  const [roads, setRoads] = useState<RoadFeature[]>([]);
  const [isLoadingRoads, setIsLoadingRoads] = useState(true);
  const [roadError, setRoadError] = useState<string | null>(null);
  const [isViewportTooLarge, setIsViewportTooLarge] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const latestBounds = useRef(boundsFromRegion(initialRegion));
  const requestVersion = useRef(0);
  const abortController = useRef<AbortController | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadRoads = useCallback(async (bounds: RoadBounds) => {
    latestBounds.current = bounds;
    abortController.current?.abort();

    const controller = new AbortController();
    abortController.current = controller;
    const version = ++requestVersion.current;

    setIsLoadingRoads(true);
    setRoadError(null);

    try {
      const response = await api.getRoads(bounds, controller.signal);
      if (version !== requestVersion.current || controller.signal.aborted) {
        return;
      }

      if (!response.success || !response.data) {
        throw new Error(response.error ?? 'Unable to load roads');
      }

      setRoads(response.data.features);
      setIsTruncated(response.data.truncated);
    } catch (error) {
      if (controller.signal.aborted || version !== requestVersion.current) {
        return;
      }

      setRoadError(error instanceof Error ? error.message : 'Unable to load roads');
    } finally {
      if (version === requestVersion.current) {
        setIsLoadingRoads(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadRoads(latestBounds.current);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      abortController.current?.abort();
    };
  }, [loadRoads]);

  const handleRegionChange = useCallback((region: Region) => {
    const bounds = boundsFromRegion(region);
    latestBounds.current = bounds;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (region.longitudeDelta > MAX_VIEWPORT_SPAN || region.latitudeDelta > MAX_VIEWPORT_SPAN) {
      abortController.current?.abort();
      requestVersion.current += 1;
      setIsLoadingRoads(false);
      setRoadError(null);
      setIsTruncated(false);
      setIsViewportTooLarge(true);
      return;
    }

    setIsViewportTooLarge(false);
    debounceTimer.current = setTimeout(() => {
      void loadRoads(bounds);
    }, 300);
  }, [loadRoads]);

  return (
    <Screen style={styles.container}>
      <AppHeader title="Live Traffic Map" subtitle="Traffic layer, incidents, and filters" />
      <View style={styles.filterRow}>
        <Chip label="Time" tone="primary" />
        <Chip label="Congestion Level" tone="warning" />
        <Chip label="Road Type" tone="default" />
      </View>
      <Card style={styles.mapShell}>
        <MapView initialRegion={initialRegion} onRegionChangeComplete={handleRegionChange} style={styles.map}>
          {roads.map((road) => {
            const coordinates = coordinatesFromRoad(road);
            return coordinates ? (
              <Polyline
                key={road.id}
                coordinates={coordinates}
                strokeWidth={road.properties.highway.includes('motorway') || road.properties.highway.includes('trunk') ? 4 : 3}
                strokeColor={theme.textSecondary}
              />
            ) : null;
          })}
          {incidents.map((incident) => (
            <Marker key={incident.id} coordinate={incident.coordinate} title={incident.type} description={incident.roadName} />
          ))}
          <Marker coordinate={{ latitude: 5.6037, longitude: -0.187 }} title="You" pinColor={theme.primary} />
        </MapView>
        {(isLoadingRoads || roadError || isViewportTooLarge || isTruncated) && (
          <View style={[styles.roadStatus, { backgroundColor: theme.surface }]}>
            {isLoadingRoads && <ActivityIndicator color={theme.primary} size="small" />}
            <Text style={[styles.roadStatusText, { color: theme.textPrimary }]}>
              {isViewportTooLarge
                ? 'Zoom in to load roads.'
                : roadError ?? (isTruncated ? 'Showing nearby roads. Zoom in for more detail.' : 'Loading roads...')}
            </Text>
            {roadError && <AppButton label="Retry" variant="ghost" onPress={() => void loadRoads(latestBounds.current)} />}
          </View>
        )}
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
  roadStatus: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    borderRadius: radius.md,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  roadStatusText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
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
