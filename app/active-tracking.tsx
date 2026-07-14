import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { LatLng, Marker, Polyline } from 'react-native-maps';

import { AppHeader, Card, Chip, Screen } from '@/src/components/ui';
import { spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useLocationTracking } from '@/src/hooks/useLocationTracking';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { getCurrentLocation } from '@/src/services/locationService';

const fallbackRegion = { latitude: 5.6037, longitude: -0.187, latitudeDelta: 0.08, longitudeDelta: 0.08 };

function formatDistance(meters: number) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

function formatDuration(startedAt: string | undefined, now: number) {
  if (!startedAt) return '00:00:00';
  const startedAtMs = new Date(startedAt).getTime();
  if (!Number.isFinite(startedAtMs)) return '00:00:00';

  const seconds = Math.max(0, Math.floor((now - startedAtMs) / 1000));
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const remaining = String(seconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${remaining}`;
}

export default function ActiveTrackingScreen() {
  const theme = useAppTheme();
  const { isOnline } = useNetworkStatus();
  const { state, gpsStatus, error, loading, startTracking, resumeTracking, stopTracking } = useLocationTracking(isOnline);
  const [now, setNow] = useState(Date.now());
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const mapRef = useRef<MapView | null>(null);

  const centerOn = useCallback((coordinate: LatLng, latitudeDelta = 0.018) => {
    mapRef.current?.animateToRegion({ ...coordinate, latitudeDelta, longitudeDelta: latitudeDelta }, 500);
  }, []);

  const locateUser = useCallback(async () => {
    setIsLocating(true);
    try {
      const location = await getCurrentLocation();
      const coordinate = { latitude: location.latitude, longitude: location.longitude };
      setUserLocation(coordinate);
      setLocationError(null);
      centerOn(coordinate);
    } catch (caught) {
      setLocationError(caught instanceof Error ? caught.message : 'Unable to get your location.');
    } finally {
      setIsLocating(false);
    }
  }, [centerOn]);

  useEffect(() => {
    void locateUser();
  }, [locateUser]);

  useEffect(() => {
    if (!state) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [state]);

  useEffect(() => {
    if (!state?.latestPoint) return;
    const coordinate = { latitude: state.latestPoint.latitude, longitude: state.latestPoint.longitude };
    setUserLocation(coordinate);
    centerOn(coordinate);
  }, [centerOn, state?.latestPoint]);

  const latestPoint = state?.latestPoint;
  const mapCoordinate = latestPoint ? { latitude: latestPoint.latitude, longitude: latestPoint.longitude } : userLocation;
  const isActive = state?.lifecycle === 'active';
  const isStopPending = state?.lifecycle === 'stopPending';
  const isPaused = state?.lifecycle === 'pausedOffline';
  const speedKmh = latestPoint?.speedMps == null ? 'Waiting' : `${Math.round(latestPoint.speedMps * 3.6)} km/h`;
  const accuracy = latestPoint?.accuracyMeters == null ? 'Waiting' : `${Math.round(latestPoint.accuracyMeters)} m`;
  const trackingLabel = isActive ? 'Drive in progress' : isPaused ? 'Tracking paused' : isStopPending ? 'Finishing drive' : 'Ready to drive';

  return (
    <Screen style={styles.screen}>
      <AppHeader title="Start a drive" subtitle="Your live location is used only while tracking." />
      <Card style={styles.mapShell}>
        <MapView
          ref={mapRef}
          initialRegion={fallbackRegion}
          showsUserLocation
          showsMyLocationButton={false}
          style={styles.map}>
          {state && state.route.length >= 2 && <Polyline coordinates={state.route} strokeColor={theme.primary} strokeWidth={6} />}
          {mapCoordinate && <Marker coordinate={mapCoordinate} title={isActive ? 'Current drive location' : 'Your location'} pinColor={isActive ? theme.secondary : theme.primary} />}
        </MapView>

        <View style={[styles.liveBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {isLocating ? <ActivityIndicator color={theme.primary} size="small" /> : <View style={[styles.liveDot, { backgroundColor: locationError ? theme.danger : theme.success }]} />}
          <Text style={[styles.liveText, { color: theme.textPrimary }]}>{isLocating ? 'Finding your location' : locationError ? 'Location unavailable' : 'Live location'}</Text>
        </View>
        <Pressable
          accessibilityLabel="Center on my location"
          accessibilityRole="button"
          onPress={() => void locateUser()}
          style={({ pressed }) => [styles.centerButton, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}>
          <MaterialCommunityIcons color={theme.primary} name="crosshairs-gps" size={22} />
        </Pressable>

        <View style={[styles.dashboardOverlay, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.overlayHeader}>
            <Chip label={trackingLabel} tone={isActive ? 'success' : isStopPending ? 'warning' : 'primary'} />
            <Text style={[styles.networkText, { color: isOnline ? theme.success : theme.warning }]}>{isOnline ? 'Online' : 'Offline'}</Text>
          </View>
          <View style={styles.statsRow}>
            <Stat label="Speed" value={speedKmh} color={theme.textPrimary} />
            <Stat label="Distance" value={formatDistance(state?.distanceMeters ?? 0)} color={theme.textPrimary} />
            <Stat label="Duration" value={formatDuration(state?.session.startedAt, now)} color={theme.textPrimary} />
          </View>
          <Text style={[styles.status, { color: error || locationError ? theme.danger : theme.textSecondary }]}>{error ?? locationError ?? `GPS accuracy: ${accuracy} · ${gpsStatus}`}</Text>
        </View>
      </Card>

      <View style={styles.actions}>
        {!state && <PrimaryAction label="Start tracking" icon="navigation" loading={loading} onPress={() => void startTracking()} color={theme.primary} />}
        {isPaused && <PrimaryAction label="Resume tracking" icon="play" loading={loading} onPress={() => void resumeTracking()} color={theme.primary} />}
        {(isActive || isStopPending) && <PrimaryAction label={isStopPending ? 'Retry stop' : 'Stop tracking'} icon="stop" loading={loading} onPress={() => void stopTracking()} color={theme.danger} />}
      </View>
    </Screen>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  const theme = useAppTheme();
  return <View style={styles.stat}><Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text><Text numberOfLines={1} style={[styles.statValue, { color }]}>{value}</Text></View>;
}

function PrimaryAction({ label, icon, loading, onPress, color }: { label: string; icon: string; loading: boolean; onPress: () => void; color: string }) {
  return (
    <Pressable accessibilityRole="button" disabled={loading} onPress={onPress} style={({ pressed }) => [styles.primaryAction, { backgroundColor: color, opacity: pressed || loading ? 0.82 : 1 }]}>
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <><MaterialCommunityIcons color="#FFFFFF" name={icon as never} size={19} /><Text style={styles.primaryActionText}>{label}</Text></>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing.xl },
  mapShell: { flex: 1, padding: 8, borderRadius: 24, overflow: 'hidden' },
  map: { width: '100%', height: 540, borderRadius: 18 },
  liveBadge: { position: 'absolute', top: 22, left: 22, borderWidth: 1, minHeight: 42, borderRadius: 14, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 7 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 12, fontWeight: '800' },
  centerButton: { position: 'absolute', right: 22, top: 22, width: 47, height: 47, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dashboardOverlay: { position: 'absolute', left: 22, right: 22, bottom: 22, borderWidth: 1, borderRadius: 18, padding: 12, gap: 10 },
  overlayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  networkText: { fontSize: 11, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1 },
  statLabel: { fontSize: 10, lineHeight: 14, fontWeight: '700' },
  statValue: { fontSize: 14, lineHeight: 19, fontWeight: '800' },
  status: { fontSize: 11, lineHeight: 16, fontWeight: '600' },
  actions: { minHeight: 56 },
  primaryAction: { minHeight: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
  primaryActionText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
