import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { LatLng, Marker, Polyline } from 'react-native-maps';

import { AppHeader, Card, Screen } from '@/src/components/ui';
import { spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useLocationTracking } from '@/src/hooks/useLocationTracking';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { api, CurrentRoadResponse, SimulationStatusResponse } from '@/src/services/api';
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

type CurrentRoad = NonNullable<CurrentRoadResponse['data']>['road'];
type SimulationStatus = SimulationStatusResponse['data'];

export default function ActiveTrackingScreen() {
  const theme = useAppTheme();
  const { isOnline } = useNetworkStatus();
  const { state, gpsStatus, error, loading, startTracking, startDemoTracking, resumeTracking, stopTracking } = useLocationTracking(isOnline);
  const [now, setNow] = useState(Date.now());
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [roadCondition, setRoadCondition] = useState<CurrentRoad>(null);
  const [simulation, setSimulation] = useState<SimulationStatus>(null);
  const [showSimulationRoads, setShowSimulationRoads] = useState(false);
  const mapRef = useRef<MapView | null>(null);
  const isActive = state?.lifecycle === 'active';
  const isDemo = state?.source === 'demo';

  const centerOn = useCallback((coordinate: LatLng, latitudeDelta = 0.018) => {
    mapRef.current?.animateToRegion({ ...coordinate, latitudeDelta, longitudeDelta: latitudeDelta }, 500);
  }, []);

  const viewSimulation = useCallback(() => {
    if (!simulation?.running) return;
    setShowSimulationRoads(true);
    centerOn(simulation.center, 0.09);
  }, [centerOn, simulation]);

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

  useEffect(() => {
    if (state?.lifecycle !== 'active') { setRoadCondition(null); return; }
    let cancelled = false;
    const load = async () => { try { const response = await api.getCurrentRoad(); if (!cancelled && response.success) setRoadCondition(response.data?.road ?? null); } catch { /* Optional live-road context. */ } };
    void load();
    const timer = setInterval(() => void load(), 15_000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [state?.lifecycle, state?.session.id]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await api.getSimulationStatus();
        if (!cancelled && response.success) setSimulation(response.data);
      } catch {
        // The simulation card is optional presentation context.
      }
    };
    void load();
    if (!isActive) return () => { cancelled = true; };
    const timer = setInterval(() => void load(), 15_000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [isActive]);

  const latestPoint = state?.latestPoint;
  const mapCoordinate = latestPoint ? { latitude: latestPoint.latitude, longitude: latestPoint.longitude } : userLocation;
  const simulationRoads = Array.isArray(simulation?.roads) ? simulation.roads : [];
  const simulationCenter = simulation?.center ?? { latitude: 6.6752, longitude: -1.5716 };
  const isStopPending = state?.lifecycle === 'stopPending';
  const isPaused = state?.lifecycle === 'pausedOffline';
  const speedKmh = latestPoint?.speedMps == null ? 'Waiting' : `${Math.round(latestPoint.speedMps * 3.6)} km/h`;
  const accuracy = latestPoint?.accuracyMeters == null ? 'Waiting' : `${Math.round(latestPoint.accuracyMeters)} m`;
  const trackingLabel = isActive ? isDemo ? 'Ayeduase demo in progress' : 'Drive in progress' : isPaused ? 'Tracking paused' : isStopPending ? 'Finishing drive' : 'Ready to drive';
  const statusDetail = isActive
    ? isDemo ? 'Simulated GPS points are moving along Ayeduase Road.' : 'Your route is being recorded securely.'
    : isPaused
      ? 'Reconnect to continue recording this drive.'
      : isStopPending
        ? 'Saving your final trip points.'
        : 'Ready when you are.';
  const statusColor = isActive ? theme.success : isStopPending || isPaused ? theme.warning : theme.primary;
  const gpsDetail = error ?? locationError ?? (latestPoint ? `GPS ${gpsStatus} · Accuracy ${accuracy}` : 'GPS will connect when you start');

  return (
    <Screen scrollable style={styles.screen}>
      <AppHeader
        title={isActive ? 'Your drive' : 'Drive tracker'}
        subtitle={isActive ? 'Keep your eyes on the road—we will handle the details.' : 'Your live location is used only while tracking.'}
      />
      <Card style={styles.mapShell}>
        <MapView
          ref={mapRef}
          initialRegion={fallbackRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          style={styles.map}>
          {state && state.route.length >= 2 && <Polyline coordinates={state.route} strokeColor={theme.primary} strokeWidth={6} />}
          {showSimulationRoads && simulationRoads.map((road, index) => <Polyline key={`simulation-road-${index}`} coordinates={road.coordinates.map(([longitude, latitude]) => ({ latitude, longitude }))} strokeColor={trafficColor(road.trafficLevel)} strokeWidth={7} />)}
          {showSimulationRoads && simulationRoads.filter((road) => road.hasIncident).map((road, index) => {
            const [longitude, latitude] = road.coordinates[Math.floor(road.coordinates.length / 2)] ?? [simulationCenter.longitude, simulationCenter.latitude];
            return <Marker key={`simulation-incident-${index}`} coordinate={{ latitude, longitude }} title="Simulated traffic incident" description="Admin presentation simulation"><View style={styles.simulationMarker}><MaterialCommunityIcons color="#FFFFFF" name="alert" size={16} /></View></Marker>;
          })}
          {mapCoordinate && (
            <Marker coordinate={mapCoordinate} title={isActive ? 'Current drive location' : 'Your location'} anchor={{ x: 0.5, y: 0.5 }} style={styles.driverMarkerContainer}>
              <View collapsable={false} style={[styles.driverMarkerHalo, { backgroundColor: isActive ? 'rgba(37, 99, 235, 0.18)' : 'rgba(20, 184, 166, 0.18)' }]}>
                <View style={[styles.driverMarker, { backgroundColor: isActive ? theme.primary : theme.secondary, borderColor: theme.surface }]}>
                  <MaterialCommunityIcons
                    color="#FFFFFF"
                    name="navigation"
                    size={12}
                    style={{ transform: [{ rotate: `${latestPoint?.headingDegrees ?? 0}deg` }] }}
                  />
                </View>
              </View>
            </Marker>
          )}
        </MapView>

        <View style={[styles.liveBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {isLocating ? <ActivityIndicator color={theme.primary} size="small" /> : <View style={[styles.liveDot, { backgroundColor: locationError ? theme.danger : theme.success }]} />}
          <Text style={[styles.liveText, { color: theme.textPrimary }]}>{isLocating ? 'Finding your location' : locationError ? 'Location unavailable' : isDemo ? 'Ayeduase demo location' : 'Live location'}</Text>
        </View>
        <Pressable
          accessibilityLabel="Center on my location"
          accessibilityRole="button"
          onPress={() => void locateUser()}
          style={({ pressed }) => [styles.centerButton, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}>
          <MaterialCommunityIcons color={theme.primary} name="crosshairs-gps" size={22} />
        </Pressable>

      </Card>

      <Card style={styles.dashboardOverlay}>
        <View style={styles.driveHeader}>
          <View style={[styles.driveIcon, { backgroundColor: isActive ? theme.successSoft : theme.primarySoft }]}>
            <MaterialCommunityIcons color={statusColor} name={isActive ? 'navigation-variant' : isPaused ? 'pause-circle-outline' : isStopPending ? 'cloud-upload-outline' : 'steering'} size={21} />
          </View>
          <View style={styles.driveCopy}>
            <Text style={[styles.driveEyebrow, { color: theme.textSecondary }]}>DRIVE STATUS</Text>
            <Text style={[styles.driveTitle, { color: theme.textPrimary }]}>{trackingLabel}</Text>
            <Text style={[styles.driveDetail, { color: theme.textSecondary }]}>{statusDetail}</Text>
          </View>
          <View style={[styles.networkPill, { backgroundColor: isOnline ? theme.successSoft : theme.warningSoft }]}>
            <View style={[styles.networkDot, { backgroundColor: isOnline ? theme.success : theme.warning }]} />
            <Text style={[styles.networkText, { color: isOnline ? theme.success : theme.warning }]}>{isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
        <View style={[styles.statsRow, { borderColor: theme.border }]}>
          <DriveMetric icon="speedometer" label="Speed" value={speedKmh} color={theme.textPrimary} />
          <View style={[styles.metricDivider, { backgroundColor: theme.border }]} />
          <DriveMetric icon="map-marker-distance" label="Distance" value={formatDistance(state?.distanceMeters ?? 0)} color={theme.textPrimary} />
          <View style={[styles.metricDivider, { backgroundColor: theme.border }]} />
          <DriveMetric icon="timer-outline" label="Duration" value={formatDuration(state?.session.startedAt, now)} color={theme.textPrimary} />
        </View>
        <View style={[styles.gpsRow, { backgroundColor: error || locationError ? theme.dangerSoft : theme.backgroundMuted }]}>
          <MaterialCommunityIcons color={error || locationError ? theme.danger : theme.textSecondary} name={error || locationError ? 'alert-circle-outline' : 'satellite-variant'} size={16} />
          <Text numberOfLines={1} style={[styles.status, { color: error || locationError ? theme.danger : theme.textSecondary }]}>{gpsDetail}</Text>
        </View>
      </Card>
      <RoadConditions condition={roadCondition} />
      <SimulationContext simulation={simulation} showingRoads={showSimulationRoads} onView={viewSimulation} />

      <View style={styles.actions}>
        {!state && <><PrimaryAction label="Start tracking" icon="navigation" loading={loading} onPress={() => void startTracking()} color={theme.primary} /><PrimaryAction label="Demo: Ayeduase Road" icon="flask-outline" loading={loading} onPress={() => void startDemoTracking()} color={theme.secondary} /></>}
        {isPaused && <PrimaryAction label="Resume tracking" icon="play" loading={loading} onPress={() => void resumeTracking()} color={theme.primary} />}
        {(isActive || isStopPending) && <PrimaryAction label={isStopPending ? 'Retry stop' : 'Stop tracking'} icon="stop" loading={loading} onPress={() => void stopTracking()} color={theme.danger} />}
      </View>
      <View style={[styles.privacyNote, { backgroundColor: theme.primarySoft, borderColor: theme.border }]}>
        <View style={[styles.privacyIcon, { backgroundColor: theme.surface }]}><MaterialCommunityIcons color={theme.primary} name="shield-check-outline" size={19} /></View>
        <Text style={[styles.privacyText, { color: theme.textSecondary }]}>{isActive ? 'Drive safely. Your trip points will sync whenever your connection is available.' : 'Start only when you are ready to move. Your GPS data helps improve local roads.'}</Text>
      </View>
    </Screen>
  );
}

function RoadConditions({ condition }: { condition: CurrentRoad }) {
  const theme = useAppTheme();
  const tone = condition?.trafficLevel === 'free' ? theme.success : condition?.trafficLevel === 'moderate' ? theme.warning : condition?.trafficLevel === 'heavy' || condition?.trafficLevel === 'severe' ? theme.danger : theme.textSecondary;
  const label = condition?.trafficLevel === 'unknown' || !condition ? 'Waiting for road match' : `${condition.trafficLevel} traffic`;
  const notices = (condition?.advisoryCount ?? 0) + (condition?.incidentCount ?? 0);
  return <Card style={styles.roadConditions}><View style={styles.roadConditionsTop}><View style={[styles.roadConditionsIcon, { backgroundColor: `${tone}22` }]}><MaterialCommunityIcons color={tone} name="road-variant" size={20} /></View><View style={styles.roadConditionsCopy}><Text style={[styles.roadConditionsEyebrow, { color: theme.textSecondary }]}>ROAD CONDITIONS AHEAD</Text><Text numberOfLines={1} style={[styles.roadConditionsTitle, { color: theme.textPrimary }]}>{condition?.roadName ?? 'Matching your current road…'}</Text></View><View style={[styles.trafficPill, { backgroundColor: `${tone}20` }]}><View style={[styles.trafficDot, { backgroundColor: tone }]} /><Text style={[styles.trafficPillText, { color: tone }]}>{label}</Text></View></View><Text style={[styles.roadConditionsDetail, { color: theme.textSecondary }]}>{condition?.medianSpeedKph == null ? 'Traffic appears after recent matched GPS samples are available.' : `${Math.round(condition.medianSpeedKph)} km/h median speed from ${condition.sampleCount} recent matched points.`}</Text>{notices > 0 && <View style={[styles.roadNotice, { backgroundColor: theme.warningSoft }]}><MaterialCommunityIcons color={theme.warning} name="alert-outline" size={17} /><Text style={[styles.roadNoticeText, { color: theme.textPrimary }]}>{notices} active road notice{notices === 1 ? '' : 's'} on this road</Text></View>}</Card>;
}

function trafficColor(level: 'free' | 'moderate' | 'heavy' | 'severe') {
  return level === 'free' ? '#16A34A' : level === 'moderate' ? '#F59E0B' : level === 'heavy' ? '#EA580C' : '#DC2626';
}

function SimulationContext({ simulation, showingRoads, onView }: { simulation: SimulationStatus; showingRoads: boolean; onView: () => void }) {
  const theme = useAppTheme();
  if (!simulation?.running) return null;
  const scenario = simulation.scenario === 'rush_hour' ? 'Rush-hour congestion' : simulation.scenario === 'incident' ? 'Incident bottleneck' : 'Normal flow';
  return <Card style={[styles.simulationCard, { backgroundColor: theme.primarySoft, borderColor: theme.border }]}><View style={styles.simulationTop}><View style={[styles.simulationIcon, { backgroundColor: theme.surface }]}><MaterialCommunityIcons color={theme.primary} name="flask-outline" size={20} /></View><View style={styles.simulationCopy}><Text style={[styles.simulationEyebrow, { color: theme.primary }]}>PRESENTATION SIMULATION ACTIVE</Text><Text style={[styles.simulationTitle, { color: theme.textPrimary }]}>KNUST · {scenario}</Text></View><View style={[styles.simulationLivePill, { backgroundColor: theme.successSoft }]}><View style={[styles.trafficDot, { backgroundColor: theme.success }]} /><Text style={[styles.simulationLiveText, { color: theme.success }]}>Live</Text></View></View><Text style={[styles.simulationDetail, { color: theme.textSecondary }]}>Viewing the same map-matched traffic feed as the admin dashboard: {simulation.driverCount} virtual drivers{simulation.reportId ? ' and a simulated road report' : ''}.</Text><Pressable accessibilityRole="button" onPress={onView} style={({ pressed }) => [styles.simulationMapButton, { backgroundColor: theme.primary, opacity: pressed ? .84 : 1 }]}><MaterialCommunityIcons color="#FFFFFF" name={showingRoads ? 'map-check-outline' : 'map-marker-path'} size={17} /><Text style={styles.simulationMapButtonText}>{showingRoads ? 'Simulation roads shown' : 'View simulation on map'}</Text></Pressable></Card>;
}

function DriveMetric({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  const theme = useAppTheme();
  return (
    <View style={styles.stat}>
      <MaterialCommunityIcons color={theme.textMuted} name={icon as never} size={15} />
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text numberOfLines={1} style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
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
  mapShell: { padding: 8, borderRadius: 26, overflow: 'hidden' },
  map: { width: '100%', height: 320, borderRadius: 20 },
  simulationMarker: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#DC2626', borderWidth: 3, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  driverMarkerContainer: { width: 32, height: 32 },
  driverMarkerHalo: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  driverMarker: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 4, elevation: 3 },
  liveBadge: { position: 'absolute', top: 22, left: 22, borderWidth: 1, minHeight: 40, borderRadius: 14, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 7 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 12, fontWeight: '800' },
  centerButton: { position: 'absolute', right: 22, top: 22, width: 46, height: 46, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dashboardOverlay: { borderRadius: 22, padding: 14, gap: 13 },
  roadConditions: { borderRadius: 22, padding: 14, gap: 9 }, roadConditionsTop: { flexDirection: 'row', alignItems: 'center', gap: 10 }, roadConditionsIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, roadConditionsCopy: { flex: 1 }, roadConditionsEyebrow: { fontSize: 9, fontWeight: '900', letterSpacing: .8 }, roadConditionsTitle: { fontSize: 15, fontWeight: '900', marginTop: 3 }, trafficPill: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }, trafficDot: { width: 6, height: 6, borderRadius: 3 }, trafficPillText: { fontSize: 10, fontWeight: '900', textTransform: 'capitalize' }, roadConditionsDetail: { fontSize: 12, lineHeight: 17, fontWeight: '600' }, roadNotice: { borderRadius: 12, padding: 9, flexDirection: 'row', alignItems: 'center', gap: 7 }, roadNoticeText: { flex: 1, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  simulationCard: { borderWidth: 1, borderRadius: 22, padding: 14, gap: 9 }, simulationTop: { flexDirection: 'row', alignItems: 'center', gap: 10 }, simulationIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, simulationCopy: { flex: 1 }, simulationEyebrow: { fontSize: 9, fontWeight: '900', letterSpacing: .7 }, simulationTitle: { fontSize: 15, fontWeight: '900', marginTop: 3 }, simulationLivePill: { borderRadius: 99, paddingHorizontal: 9, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }, simulationLiveText: { fontSize: 10, fontWeight: '900' }, simulationDetail: { fontSize: 12, lineHeight: 17, fontWeight: '600' }, simulationMapButton: { minHeight: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 }, simulationMapButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  driveHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  driveIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  driveCopy: { flex: 1, gap: 1 },
  driveEyebrow: { fontSize: 9, lineHeight: 13, fontWeight: '900', letterSpacing: 0.7 },
  driveTitle: { fontSize: 15, lineHeight: 20, fontWeight: '900' },
  driveDetail: { fontSize: 11, lineHeight: 15, fontWeight: '600' },
  networkPill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 },
  networkDot: { width: 6, height: 6, borderRadius: 3 },
  networkText: { fontSize: 10, fontWeight: '900' },
  statsRow: { flexDirection: 'row', alignItems: 'stretch', borderTopWidth: 1, paddingTop: 12 },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  metricDivider: { width: 1, marginVertical: 3 },
  statLabel: { fontSize: 10, lineHeight: 14, fontWeight: '700' },
  statValue: { fontSize: 14, lineHeight: 19, fontWeight: '900' },
  gpsRow: { minHeight: 32, borderRadius: 11, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 7 },
  status: { flex: 1, fontSize: 10, lineHeight: 14, fontWeight: '700' },
  privacyNote: { borderWidth: 1, borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  privacyIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  privacyText: { flex: 1, fontSize: 11, lineHeight: 16, fontWeight: '600' },
  actions: { minHeight: 58 },
  primaryAction: { minHeight: 58, borderRadius: 19, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
  primaryActionText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
});
