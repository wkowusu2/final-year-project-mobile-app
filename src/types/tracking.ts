export type GpsStatus = 'Good' | 'Weak' | 'Unavailable';

export type TrackingPoint = {
  clientPointId: string;
  latitude: number;
  longitude: number;
  speedMps: number | null;
  headingDegrees: number | null;
  accuracyMeters: number | null;
  recordedAt: string;
};

export type TrackingSession = {
  id: string;
  status: 'active' | 'completed' | 'cancelled';
  startedAt: string;
  endedAt: string | null;
};

export type TrackingLifecycle = 'active' | 'pausedOffline' | 'stopPending';

export type ActiveTrackingState = {
  session: TrackingSession;
  lifecycle: TrackingLifecycle;
  /** Demo points use the same ingestion flow but are visibly labelled in the app. */
  source?: 'live' | 'demo';
  route: { latitude: number; longitude: number }[];
  latestPoint: TrackingPoint | null;
  distanceMeters: number;
  outbox: TrackingPoint[];
};
