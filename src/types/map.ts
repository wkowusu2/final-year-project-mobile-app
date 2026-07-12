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
