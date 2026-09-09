import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import * as Crypto from 'expo-crypto';

import { GPS_BATCH_SIZE, GPS_MAX_ACCURACY_METERS, GPS_MIN_MOVEMENT_METERS } from '@/src/constants/api';
import { api } from '@/src/services/api';
import { getCurrentLocationFix, toGpsPoint, watchForegroundLocation } from '@/src/services/locationService';
import { storageService } from '@/src/services/storageService';
import { ActiveTrackingState, GpsStatus, TrackingPoint } from '@/src/types/tracking';

const DEMO_POINT_INTERVAL_MS = 2_000;

// A short, repeatable corridor on Ayeduase Road, Kumasi. The first point of a
// demo is always the driver's real current location; these points then carry
// the marker along the road for a presentation-safe simulated drive.
const AYEDUASE_ROAD_ROUTE = [
  { latitude: 6.67566, longitude: -1.56361 },
  { latitude: 6.67571, longitude: -1.56295 },
  { latitude: 6.67576, longitude: -1.56229 },
  { latitude: 6.67581, longitude: -1.56163 },
  { latitude: 6.67586, longitude: -1.56097 },
  { latitude: 6.67590, longitude: -1.56031 },
  { latitude: 6.67591, longitude: -1.55965 },
  { latitude: 6.67592, longitude: -1.55890 },
  { latitude: 6.67588, longitude: -1.55824 },
  { latitude: 6.67583, longitude: -1.55758 },
  { latitude: 6.67578, longitude: -1.55692 },
] as const;

function buildAyeduaseDemoPath() {
  const points: { latitude: number; longitude: number }[] = [];
  for (let index = 0; index < AYEDUASE_ROAD_ROUTE.length - 1; index += 1) {
    const start = AYEDUASE_ROAD_ROUTE[index];
    const end = AYEDUASE_ROAD_ROUTE[index + 1];
    // Approximately 22 m per two-second update gives a visibly smooth marker
    // while retaining a credible 40 km/h demonstration speed.
    const latitudeMeters = (end.latitude - start.latitude) * 111_320;
    const longitudeMeters = (end.longitude - start.longitude) * 110_600;
    const stepCount = Math.max(1, Math.ceil(Math.hypot(latitudeMeters, longitudeMeters) / 22));
    for (let step = 0; step < stepCount; step += 1) {
      const ratio = step / stepCount;
      points.push({
        latitude: start.latitude + (end.latitude - start.latitude) * ratio,
        longitude: start.longitude + (end.longitude - start.longitude) * ratio,
      });
    }
  }
  points.push(AYEDUASE_ROAD_ROUTE[AYEDUASE_ROAD_ROUTE.length - 1]);
  return points;
}

function hasValidTimestamp(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(new Date(value).getTime());
}

function distanceBetween(a: TrackingPoint, b: TrackingPoint) {
  const radians = (value: number) => value * Math.PI / 180;
  const earthRadius = 6_371_000;
  const deltaLatitude = radians(b.latitude - a.latitude);
  const deltaLongitude = radians(b.longitude - a.longitude);
  const value = Math.sin(deltaLatitude / 2) ** 2 + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(deltaLongitude / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function bearingBetween(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const radians = (value: number) => value * Math.PI / 180;
  const degrees = (value: number) => value * 180 / Math.PI;
  const deltaLongitude = radians(b.longitude - a.longitude);
  const y = Math.sin(deltaLongitude) * Math.cos(radians(b.latitude));
  const x = Math.cos(radians(a.latitude)) * Math.sin(radians(b.latitude))
    - Math.sin(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.cos(deltaLongitude);
  return (degrees(Math.atan2(y, x)) + 360) % 360;
}

export function useLocationTracking(isOnline: boolean) {
  const subscription = useRef<Location.LocationSubscription | null>(null);
  const demoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const flushing = useRef<Promise<void> | null>(null);
  const [state, setState] = useState<ActiveTrackingState | null>(null);
  const stateRef = useRef<ActiveTrackingState | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('Unavailable');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const persist = useCallback(async (next: ActiveTrackingState | null) => {
    stateRef.current = next;
    setState(next);
    if (next) await storageService.saveActiveTracking(next);
    else await storageService.clearActiveTracking();
  }, []);

  const stopWatch = useCallback(() => {
    subscription.current?.remove();
    subscription.current = null;
  }, []);

  const stopDemo = useCallback(() => {
    if (demoTimer.current) clearInterval(demoTimer.current);
    demoTimer.current = null;
  }, []);

  const flush = useCallback(async (current: ActiveTrackingState, force = false) => {
    if (flushing.current) return flushing.current;
    flushing.current = (async () => {
      while (current.outbox.length >= GPS_BATCH_SIZE || (force && current.outbox.length > 0)) {
        const batch = current.outbox.slice(0, GPS_BATCH_SIZE);
        const response = await api.sendTrackingPoints(current.session.id, batch);
        if (!response.success || !response.data) throw new Error(response.error ?? 'Unable to sync GPS points.');
        const accepted = new Set(response.data.acceptedClientPointIds);
        current.outbox = current.outbox.filter((point) => !accepted.has(point.clientPointId));
        await persist({ ...current, outbox: [...current.outbox] });
      }
    })().finally(() => { flushing.current = null; });
    return flushing.current;
  }, [persist]);

  const processPoint = useCallback(async (rawPoint: TrackingPoint) => {
    const accuracy = rawPoint.accuracyMeters;
    setGpsStatus(accuracy == null ? 'Unavailable' : accuracy <= GPS_MAX_ACCURACY_METERS ? 'Good' : 'Weak');
    const current = stateRef.current;
    if (!current || accuracy == null || accuracy > GPS_MAX_ACCURACY_METERS) return;

    const previous = current.latestPoint;
    const movementMeters = previous ? distanceBetween(previous, rawPoint) : 0;
    const minimumReliableMovement = previous
      ? Math.max(GPS_MIN_MOVEMENT_METERS, accuracy, previous.accuracyMeters ?? 0)
      : 0;

    // GPS coordinates naturally drift while a device is stationary. Do not
    // turn that drift into trip distance until a point exceeds both a small
    // movement floor and the reported uncertainty of the GPS fixes.
    if (previous && movementMeters < minimumReliableMovement) return;

    const elapsedSeconds = previous
      ? (new Date(rawPoint.recordedAt).getTime() - new Date(previous.recordedAt).getTime()) / 1000
      : 0;
    const calculatedSpeed = previous && elapsedSeconds > 0
      ? movementMeters / elapsedSeconds
      : 0;
    const point: TrackingPoint = {
      ...rawPoint,
      // Some devices omit the optional native GPS speed. Calculate it from
      // consecutive accepted GPS fixes so the driver still sees a live speed.
      speedMps: rawPoint.speedMps ?? calculatedSpeed,
    };
    const next: ActiveTrackingState = {
      ...current,
      latestPoint: point,
      route: [...current.route, { latitude: point.latitude, longitude: point.longitude }].slice(-500),
      distanceMeters: current.distanceMeters + movementMeters,
      outbox: [...current.outbox, point],
    };
    await persist(next);
    // Send normal drive updates as a sequence. Valhalla needs at least two
    // points to map-match a trace reliably; batching five points also gives it
    // enough movement context for parallel roads and junctions.
    if (isOnline && next.outbox.length >= GPS_BATCH_SIZE) {
      try { await flush(next); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to sync GPS points.'); }
    }
  }, [flush, isOnline, persist]);

  const handleLocation = useCallback(async (location: Location.LocationObject) => {
    await processPoint(toGpsPoint(location));
  }, [processPoint]);

  const beginWatch = useCallback(async () => {
    stopDemo();
    stopWatch();
    subscription.current = await watchForegroundLocation((location) => { void handleLocation(location); });
  }, [handleLocation, stopDemo, stopWatch]);

  const recover = useCallback(async () => {
    try {
      const saved = await storageService.getActiveTracking();
      if (saved) await persist(saved);
      if (!isOnline) return;

      const response = await api.getActiveTrackingSession();
      if (response.success && response.data?.session) {
        const session = {
          ...response.data.session,
          startedAt: hasValidTimestamp(response.data.session.startedAt)
            ? response.data.session.startedAt
            : new Date().toISOString(),
        };
        if (!saved || saved.session.id !== session.id) {
          await persist({ session, lifecycle: 'pausedOffline', route: [], latestPoint: null, distanceMeters: 0, outbox: [] });
        } else if (!hasValidTimestamp(saved.session.startedAt)) {
          await persist({ ...saved, session });
        }
      } else if (saved?.lifecycle !== 'stopPending') {
        await persist(null);
      }
    } catch (caught) {
      console.warn('Unable to recover the active tracking session.', caught);
      setError(caught instanceof Error ? caught.message : 'Unable to recover the active tracking session.');
    }
  }, [isOnline, persist]);

  useEffect(() => {
    void recover();
    return () => { stopWatch(); stopDemo(); };
  }, [recover, stopDemo, stopWatch]);

  useEffect(() => {
    if (!isOnline && state?.lifecycle === 'active') {
      stopWatch();
      void persist({ ...state, lifecycle: 'pausedOffline' });
    }
  }, [isOnline, persist, state, stopWatch]);

  const startTracking = useCallback(async () => {
    if (!isOnline) { setError('Connect to the internet before starting tracking.'); return; }
    setLoading(true); setError(null);
    try {
      const initialLocation = await getCurrentLocationFix();
      const startedAt = new Date().toISOString();
      const response = await api.startTrackingSession(startedAt);
      const returnedSession = response.data?.session;
      if (!response.success || !returnedSession) throw new Error(response.error ?? 'Unable to start tracking.');

      const session = {
        ...returnedSession,
        startedAt: hasValidTimestamp(returnedSession.startedAt) ? returnedSession.startedAt : startedAt,
      };
      const next = state?.session.id === session.id
        ? { ...state, session, lifecycle: 'active' as const, source: 'live' as const }
        : { session, lifecycle: 'active' as const, source: 'live' as const, route: [], latestPoint: null, distanceMeters: 0, outbox: [] };
      await persist(next);
      await handleLocation(initialLocation);
      await beginWatch();
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to start tracking.'); }
    finally { setLoading(false); }
  }, [beginWatch, handleLocation, isOnline, persist, state]);

  const startDemoTracking = useCallback(async () => {
    if (!isOnline) { setError('Connect to the internet before starting the demonstration.'); return; }
    setLoading(true); setError(null); stopWatch(); stopDemo();
    try {
      const initialLocation = await getCurrentLocationFix();
      const startedAt = new Date().toISOString();
      const response = await api.startTrackingSession(startedAt);
      const returnedSession = response.data?.session;
      if (!response.success || !returnedSession) throw new Error(response.error ?? 'Unable to start the demonstration.');

      const session = { ...returnedSession, startedAt: hasValidTimestamp(returnedSession.startedAt) ? returnedSession.startedAt : startedAt };
      const next: ActiveTrackingState = { session, lifecycle: 'active', source: 'demo', route: [], latestPoint: null, distanceMeters: 0, outbox: [] };
      await persist(next);
      await handleLocation(initialLocation);

      const demoPath = buildAyeduaseDemoPath();
      let index = 0;
      let direction = 1;
      demoTimer.current = setInterval(() => {
        const current = stateRef.current;
        if (!current || current.lifecycle !== 'active' || current.source !== 'demo') { stopDemo(); return; }
        const coordinate = demoPath[index];
        const nextIndex = index + direction;
        const following = demoPath[nextIndex] ?? demoPath[index];
        if (nextIndex < 0 || nextIndex >= demoPath.length) direction *= -1;
        else index = nextIndex;
        void processPoint({
          clientPointId: Crypto.randomUUID(),
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          speedMps: 11.1,
          headingDegrees: bearingBetween(coordinate, following),
          accuracyMeters: 5,
          recordedAt: new Date().toISOString(),
        });
      }, DEMO_POINT_INTERVAL_MS);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to start the demonstration.'); }
    finally { setLoading(false); }
  }, [handleLocation, isOnline, persist, processPoint, stopDemo, stopWatch]);

  const resumeTracking = useCallback(async () => {
    if (!isOnline) { setError('Connect to the internet before resuming tracking.'); return; }
    await startTracking();
  }, [isOnline, startTracking]);

  const stopTracking = useCallback(async () => {
    if (!state) return;
    setLoading(true); setError(null); stopWatch(); stopDemo();
    const pending = { ...state, lifecycle: 'stopPending' as const };
    await persist(pending);
    try {
      await flush(pending, true);
      const response = await api.completeTrackingSession(pending.session.id, new Date().toISOString());
      if (!response.success) throw new Error(response.error ?? 'Unable to finish tracking.');
      await persist(null); setGpsStatus('Unavailable');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to finish tracking.'); }
    finally { setLoading(false); }
  }, [flush, persist, state, stopDemo, stopWatch]);

  return { state, gpsStatus, error, loading, startTracking, startDemoTracking, resumeTracking, stopTracking };
}
