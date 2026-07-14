import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { LatLng, Marker, Polyline, Region } from 'react-native-maps';

import { AppHeader, Card, Screen } from '@/src/components/ui';
import { incidents } from '@/src/data/mock-data';
import { spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { api } from '@/src/services/api';
import { getCurrentLocation } from '@/src/services/locationService';
import { RoadBounds, RoadFeature } from '@/src/types/map';

const fallbackRegion = {
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
  const [activeFilter, setActiveFilter] = useState<'Traffic' | 'Incidents' | 'Roads'>('Traffic');
  const [roads, setRoads] = useState<RoadFeature[]>([]);
  const [isLoadingRoads, setIsLoadingRoads] = useState(false);
  const [roadError, setRoadError] = useState<string | null>(null);
  const [isViewportTooLarge, setIsViewportTooLarge] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const latestBounds = useRef(boundsFromRegion(fallbackRegion));
  const requestVersion = useRef(0);
  const abortController = useRef<AbortController | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapReady = useRef(false);
  const isFocused = useRef(false);
  const pendingRegion = useRef<Region | null>(null);
  const pendingFallbackLoad = useRef(false);
  const suppressNextRegionLoad = useRef(false);
  const initializationComplete = useRef(false);

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

  const applyPendingRegion = useCallback(() => {
    const region = pendingRegion.current;
    if (!region || !mapReady.current || !isFocused.current) {
      return;
    }

    pendingRegion.current = null;
    latestBounds.current = boundsFromRegion(region);
    initializationComplete.current = true;

    if (pendingFallbackLoad.current) {
      pendingFallbackLoad.current = false;
      void loadRoads(latestBounds.current);
      return;
    }

    suppressNextRegionLoad.current = true;
    mapRef.current?.animateToRegion(region, 500);
  }, [loadRoads]);

  const selectCurrentLocation = useCallback(async () => {
    try {
      const location = await getCurrentLocation();
      if (!isFocused.current) {
        return;
      }

      const coordinate = { latitude: location.latitude, longitude: location.longitude };
      setUserLocation(coordinate);
      setLocationError(null);
      pendingFallbackLoad.current = false;
      pendingRegion.current = { ...coordinate, latitudeDelta: 0.04, longitudeDelta: 0.04 };
      applyPendingRegion();
    } catch (error) {
      if (!isFocused.current) {
        return;
      }

      setUserLocation(null);
      setLocationError(error instanceof Error ? error.message : 'Unable to get your location.');
      pendingFallbackLoad.current = true;
      pendingRegion.current = fallbackRegion;
      applyPendingRegion();
    }
  }, [applyPendingRegion]);

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      initializationComplete.current = false;
      void selectCurrentLocation();

      return () => {
        isFocused.current = false;
        initializationComplete.current = false;
        pendingRegion.current = null;
        pendingFallbackLoad.current = false;
        suppressNextRegionLoad.current = false;

        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
        abortController.current?.abort();
        requestVersion.current += 1;
      };
    }, [selectCurrentLocation]),
  );

  const handleMapReady = useCallback(() => {
    mapReady.current = true;
    applyPendingRegion();
  }, [applyPendingRegion]);

  const handleRegionChange = useCallback((region: Region) => {
    const bounds = boundsFromRegion(region);
    latestBounds.current = bounds;

    if (!initializationComplete.current || !isFocused.current) {
      return;
    }

    if (suppressNextRegionLoad.current) {
      suppressNextRegionLoad.current = false;
      void loadRoads(bounds);
      return;
    }

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
      <AppHeader
        title="Live traffic"
        subtitle="See what is happening around you."
        right={
          <Pressable
            accessibilityLabel="Report an incident"
            accessibilityRole="button"
            onPress={() => router.push('/report-incident')}
            style={({ pressed }) => [styles.reportButton, { backgroundColor: theme.primary, opacity: pressed ? 0.82 : 1 }]}>
            <MaterialCommunityIcons color="#FFFFFF" name="plus" size={21} />
          </Pressable>
        }
      />
      <View style={styles.filterRow}>
        {(['Traffic', 'Incidents', 'Roads'] as const).map((filter) => {
          const selected = activeFilter === filter;
          return (
            <Pressable
              key={filter}
              accessibilityRole="button"
              onPress={() => setActiveFilter(filter)}
              style={({ pressed }) => [styles.filterButton, { backgroundColor: selected ? theme.primary : theme.surface, borderColor: selected ? theme.primary : theme.border, opacity: pressed ? 0.82 : 1 }]}>
              <Text style={[styles.filterText, { color: selected ? '#FFFFFF' : theme.textSecondary }]}>{filter}</Text>
            </Pressable>
          );
        })}
      </View>
      <Card style={styles.mapShell}>
        <MapView
          ref={mapRef}
          initialRegion={fallbackRegion}
          onMapReady={handleMapReady}
          onRegionChangeComplete={handleRegionChange}
          showsUserLocation={Boolean(userLocation)}
          style={styles.map}>
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
            <Marker
              key={incident.id}
              coordinate={incident.coordinate}
              title={incident.type}
              description={incident.roadName}
              pinColor={incident.severity === 'High' ? '#E5484D' : incident.severity === 'Medium' ? '#E99A20' : '#22A06B'}
            />
          ))}
          {userLocation && <Marker coordinate={userLocation} title="You" pinColor={theme.primary} />}
        </MapView>
        <View style={[styles.locationBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.locationBannerIcon, { backgroundColor: theme.primarySoft }]}>
            <MaterialCommunityIcons color={theme.primary} name="map-marker-radius-outline" size={19} />
          </View>
          <View style={styles.locationBannerCopy}>
            <Text style={[styles.locationBannerTitle, { color: theme.textPrimary }]}>Your area</Text>
            <Text numberOfLines={1} style={[styles.locationBannerText, { color: theme.textSecondary }]}>{userLocation ? 'Location found · live road data' : 'Finding your current location...'}</Text>
          </View>
        </View>
        <View style={styles.mapControls}>
          <Pressable
            accessibilityLabel="Center on my location"
            accessibilityRole="button"
            onPress={() => void selectCurrentLocation()}
            style={({ pressed }) => [styles.mapControl, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}>
            <MaterialCommunityIcons color={theme.primary} name="crosshairs-gps" size={22} />
          </Pressable>
          <Pressable
            accessibilityLabel="Report an incident"
            accessibilityRole="button"
            onPress={() => router.push('/report-incident')}
            style={({ pressed }) => [styles.mapControl, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}>
            <MaterialCommunityIcons color={theme.textPrimary} name="alert-outline" size={22} />
          </Pressable>
        </View>
        {(isLoadingRoads || roadError || locationError || isViewportTooLarge || isTruncated) && (
          <View style={[styles.roadStatus, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {isLoadingRoads ? <ActivityIndicator color={theme.primary} size="small" /> : <MaterialCommunityIcons color={roadError || locationError ? theme.danger : theme.primary} name={roadError || locationError ? 'alert-circle-outline' : 'information-outline'} size={19} />}
            <Text style={[styles.roadStatusText, { color: theme.textPrimary }]}>
              {isViewportTooLarge
                ? 'Zoom in a little to load roads.'
                : locationError ?? roadError ?? (isTruncated ? 'Showing nearby roads. Zoom in for detail.' : 'Loading nearby roads...')}
            </Text>
            {roadError && (
              <Pressable accessibilityRole="button" onPress={() => void loadRoads(latestBounds.current)} hitSlop={8}>
                <Text style={[styles.retryText, { color: theme.primary }]}>Retry</Text>
              </Pressable>
            )}
          </View>
        )}
        <View style={[styles.mapLegend, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#22A06B' }]} /><Text style={[styles.legendText, { color: theme.textSecondary }]}>Clear</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#E99A20' }]} /><Text style={[styles.legendText, { color: theme.textSecondary }]}>Slow</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#E5484D' }]} /><Text style={[styles.legendText, { color: theme.textSecondary }]}>Incident</Text></View>
        </View>
      </Card>
      <Card style={styles.summaryCard}>
        <View style={styles.summaryIcon}><MaterialCommunityIcons color="#6D3DF5" name="traffic-light-outline" size={20} /></View>
        <View style={styles.summaryCopy}>
          <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>Traffic update</Text>
          <Text style={[styles.infoBody, { color: theme.textSecondary }]}>Slowdowns are building around Spintex Road and Circle. Liberation Road is moving steadily.</Text>
        </View>
        <MaterialCommunityIcons color={theme.textMuted} name="chevron-right" size={20} />
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
    gap: 8,
  },
  reportButton: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  filterButton: { minHeight: 38, paddingHorizontal: 15, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  filterText: { fontSize: 13, fontWeight: '800' },
  mapShell: {
    flex: 1,
    padding: 8,
    borderRadius: 24,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: 500,
    borderRadius: 18,
  },
  locationBanner: { position: 'absolute', top: 22, left: 22, right: 82, minHeight: 58, borderRadius: 17, borderWidth: 1, padding: 9, flexDirection: 'row', alignItems: 'center', gap: 9 },
  locationBannerIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  locationBannerCopy: { flex: 1 },
  locationBannerTitle: { fontSize: 13, lineHeight: 17, fontWeight: '800' },
  locationBannerText: { fontSize: 11, lineHeight: 16, fontWeight: '500' },
  mapControls: { position: 'absolute', right: 22, top: 22, gap: 8 },
  mapControl: { width: 48, height: 48, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  roadStatus: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 73,
    borderRadius: 15,
    borderWidth: 1,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roadStatusText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  retryText: { fontSize: 12, fontWeight: '800' },
  mapLegend: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 22,
    height: 40,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: '700' },
  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  summaryIcon: { width: 39, height: 39, borderRadius: 13, backgroundColor: '#F0EBFF', alignItems: 'center', justifyContent: 'center' },
  summaryCopy: { flex: 1, gap: 2 },
  infoTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  infoBody: {
    fontSize: 12,
    lineHeight: 17,
  },
});
