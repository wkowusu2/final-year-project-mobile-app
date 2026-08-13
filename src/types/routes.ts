import { TrafficLevel } from '@/src/types/map';

export type RouteAlternative = {
  id: string;
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  distanceMeters: number;
  baseDurationSeconds: number;
  estimatedDurationSeconds: number;
  trafficLevel: TrafficLevel;
  medianSpeedKph: number | null;
  trafficSampleCount: number;
  matchedRoadCount: number;
  incidents: { id: string; type: string; severity: string; roadName: string }[];
};

export type RouteIntelligenceResponse = {
  success: boolean;
  data: { routes: RouteAlternative[]; generatedAt: string } | null;
  error: string | null;
};
