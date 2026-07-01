import { useCallback, useRef, useState } from 'react';
import * as Location from 'expo-location';

import { GPS_BATCH_SIZE, GPS_MAX_ACCURACY_METERS } from '@/src/constants/api';
import { api } from '@/src/services/api';
import { toGpsPoint, watchForegroundLocation } from '@/src/services/locationService';
import { storageService } from '@/src/services/storageService';
import { storeOrSyncBatch, syncPendingPoints } from '@/src/services/trackingService';
import { DriverProfile } from '@/src/types/driver';
import { GpsPoint, GpsStatus, TrackingSession, TrackingSummary } from '@/src/types/tracking';

export function useLocationTracking(driver: DriverProfile | null, isOnline: boolean) {
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const bufferRef = useRef<GpsPoint[]>([]);
  const [session, setSession] = useState<TrackingSession | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('Unavailable');
  const [pointsCollected, setPointsCollected] = useState(0);
  const [pointsSynced, setPointsSynced] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const flushBuffer = useCallback(async () => {
    if (!driver || bufferRef.current.length === 0) {
      return 0;
    }

    const batch = bufferRef.current;
    bufferRef.current = [];
    const result = await storeOrSyncBatch(driver, isOnline, batch);
    setPointsSynced((value) => value + result.synced);
    return result.synced;
  }, [driver, isOnline]);

  const startTracking = useCallback(async () => {
    if (!driver) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setError('Location permission is required before tracking can start.');
        return;
      }

      const startedAt = new Date().toISOString();
      const response = await api.startSession(driver.driverId, startedAt);
      const activeSession = { sessionId: response.sessionId, startedAt };
      setSession(activeSession);
      setPointsCollected(0);
      setPointsSynced(0);
      bufferRef.current = [];

      subscriptionRef.current = await watchForegroundLocation(async (location) => {
        const accuracy = location.coords.accuracy;
        const status = accuracy == null ? 'Unavailable' : accuracy <= GPS_MAX_ACCURACY_METERS ? 'Good' : 'Weak';
        setGpsStatus(status);

        // Only clean points are useful for later map matching, so weak fixes are discarded here.
        if (accuracy == null || accuracy > GPS_MAX_ACCURACY_METERS) {
          return;
        }

        const point = toGpsPoint(location, driver.driverId, activeSession.sessionId);
        bufferRef.current = [...bufferRef.current, point];
        setPointsCollected((value) => value + 1);

        if (bufferRef.current.length >= GPS_BATCH_SIZE) {
          await flushBuffer();
        }
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to start tracking.');
    } finally {
      setLoading(false);
    }
  }, [driver, flushBuffer]);

  const stopTracking = useCallback(async () => {
    if (!driver || !session) {
      return null;
    }

    setLoading(true);
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;

    const endedAt = new Date().toISOString();
    let syncedOnStop = 0;

    try {
      syncedOnStop = await flushBuffer();
      await api.stopSession(session.sessionId, endedAt);
    } finally {
      const pending = await storageService.getPendingPoints();
      const summary: TrackingSummary = {
        sessionId: session.sessionId,
        startedAt: session.startedAt,
        endedAt,
        durationSeconds: Math.max(
          0,
          Math.round((new Date(endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000),
        ),
        pointsCollected,
        pointsSynced: pointsSynced + syncedOnStop,
        unsyncedPoints: pending.filter((point) => point.sessionId === session.sessionId).length,
      };

      await storageService.saveSummary(summary);
      setSession(null);
      setGpsStatus('Unavailable');
      setLoading(false);
      return summary;
    }
  }, [driver, flushBuffer, pointsCollected, pointsSynced, session]);

  const syncNow = useCallback(async () => {
    if (!driver) {
      return { synced: 0, remaining: 0 };
    }

    const result = await syncPendingPoints(driver, isOnline);
    setPointsSynced((value) => value + result.synced);
    return result;
  }, [driver, isOnline]);

  return {
    error,
    gpsStatus,
    isTracking: Boolean(session),
    loading,
    pointsCollected,
    pointsSynced,
    session,
    startTracking,
    stopTracking,
    syncNow,
  };
}
