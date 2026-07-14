import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

import { GPS_BATCH_SIZE, GPS_MAX_ACCURACY_METERS } from '@/src/constants/api';
import { api } from '@/src/services/api';
import { getCurrentLocationFix, toGpsPoint, watchForegroundLocation } from '@/src/services/locationService';
import { storageService } from '@/src/services/storageService';
import { ActiveTrackingState, GpsStatus, TrackingPoint } from '@/src/types/tracking';

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

export function useLocationTracking(isOnline: boolean) {
  const subscription = useRef<Location.LocationSubscription | null>(null);
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

  const flush = useCallback(async (current: ActiveTrackingState) => {
    if (flushing.current) return flushing.current;
    flushing.current = (async () => {
      while (current.outbox.length) {
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

  const handleLocation = useCallback(async (location: Location.LocationObject) => {
    const accuracy = location.coords.accuracy;
    setGpsStatus(accuracy == null ? 'Unavailable' : accuracy <= GPS_MAX_ACCURACY_METERS ? 'Good' : 'Weak');
    const current = stateRef.current;
    if (!current || accuracy == null || accuracy > GPS_MAX_ACCURACY_METERS) return;

    const rawPoint = toGpsPoint(location);
    const previous = current.latestPoint;
    const elapsedSeconds = previous
      ? (new Date(rawPoint.recordedAt).getTime() - new Date(previous.recordedAt).getTime()) / 1000
      : 0;
    const calculatedSpeed = previous && elapsedSeconds > 0
      ? distanceBetween(previous, rawPoint) / elapsedSeconds
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
      distanceMeters: current.distanceMeters + (previous ? distanceBetween(previous, point) : 0),
      outbox: [...current.outbox, point],
    };
    await persist(next);
    if (isOnline) {
      try { await flush(next); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to sync GPS points.'); }
    }
  }, [flush, isOnline, persist]);

  const beginWatch = useCallback(async () => {
    stopWatch();
    subscription.current = await watchForegroundLocation((location) => { void handleLocation(location); });
  }, [handleLocation, stopWatch]);

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
    return stopWatch;
  }, [recover, stopWatch]);

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
        ? { ...state, session, lifecycle: 'active' as const }
        : { session, lifecycle: 'active' as const, route: [], latestPoint: null, distanceMeters: 0, outbox: [] };
      await persist(next);
      await handleLocation(initialLocation);
      await beginWatch();
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to start tracking.'); }
    finally { setLoading(false); }
  }, [beginWatch, handleLocation, isOnline, persist, state]);

  const resumeTracking = useCallback(async () => {
    if (!isOnline) { setError('Connect to the internet before resuming tracking.'); return; }
    await startTracking();
  }, [isOnline, startTracking]);

  const stopTracking = useCallback(async () => {
    if (!state) return;
    setLoading(true); setError(null); stopWatch();
    const pending = { ...state, lifecycle: 'stopPending' as const };
    await persist(pending);
    try {
      await flush(pending);
      const response = await api.completeTrackingSession(pending.session.id, new Date().toISOString());
      if (!response.success) throw new Error(response.error ?? 'Unable to finish tracking.');
      await persist(null); setGpsStatus('Unavailable');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to finish tracking.'); }
    finally { setLoading(false); }
  }, [flush, persist, state, stopWatch]);

  return { state, gpsStatus, error, loading, startTracking, resumeTracking, stopTracking };
}
