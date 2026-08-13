export type RoadBounds = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export type RoadFeature = {
  type: 'Feature';
  id: string;
  properties: {
    highway: string;
    name: string | null;
    ref: string | null;
  };
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
};

export type RoadFeatureCollection = {
  type: 'FeatureCollection';
  features: RoadFeature[];
  truncated: boolean;
};

export type RoadsResponse = {
  success: boolean;
  data: RoadFeatureCollection | null;
  error: string | null;
};

export type TrafficLevel = 'free' | 'moderate' | 'heavy' | 'severe' | 'unknown';

export type RoadTraffic = {
  osmId: string;
  sampleCount: number;
  driverCount: number;
  medianSpeedKph: number | null;
  trafficLevel: TrafficLevel;
  lastObservedAt: string;
};

export type MapTrafficResponse = {
  success: boolean;
  data: { roads: RoadTraffic[]; windowMinutes: number; minimumSpeedSamples: number } | null;
  error: string | null;
};
