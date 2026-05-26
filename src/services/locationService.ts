import * as Location from 'expo-location';

import { GPS_COLLECTION_INTERVAL_MS } from '@/src/constants/api';
import { GpsPoint } from '@/src/types/tracking';

export async function requestLocationPermission() {
  return Location.requestForegroundPermissionsAsync();
}

export async function getLocationPermission() {
  return Location.getForegroundPermissionsAsync();
}

export function toGpsPoint(
  location: Location.LocationObject,
  driverId: string,
  sessionId: string,
): GpsPoint {
  return {
    id: `${sessionId}-${location.timestamp}`,
    driverId,
    sessionId,
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    speed: location.coords.speed,
    heading: location.coords.heading,
    accuracy: location.coords.accuracy,
    recordedAt: new Date(location.timestamp).toISOString(),
  };
}

export function watchForegroundLocation(
  onLocation: (location: Location.LocationObject) => void,
) {
  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: GPS_COLLECTION_INTERVAL_MS,
      distanceInterval: 5,
    },
    onLocation,
  );
}
