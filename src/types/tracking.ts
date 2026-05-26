export type GpsStatus = 'Good' | 'Weak' | 'Unavailable';

export type GpsPoint = {
  id: string;
  driverId: string;
  sessionId: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  recordedAt: string;
};

export type TrackingSession = {
  sessionId: string;
  startedAt: string;
  endedAt?: string;
};

export type TrackingSummary = {
  sessionId: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  pointsCollected: number;
  pointsSynced: number;
  unsyncedPoints: number;
};
