import * as Location from 'expo-location';
import * as Crypto from 'expo-crypto';

import { GPS_COLLECTION_INTERVAL_MS } from '@/src/constants/api';
import { TrackingPoint } from '@/src/types/tracking';

export async function requestLocationPermission() {
  return Location.requestForegroundPermissionsAsync();
}

export async function getLocationPermission() {
  return Location.getForegroundPermissionsAsync();
}

export async function getCurrentLocationFix() {
  const permission = await requestLocationPermission();
  if (permission.status !== 'granted') {
    throw new Error('Location permission was not granted.');
  }

  return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
}

export async function getCurrentLocation() {
  const location = await getCurrentLocationFix();
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

export type DetectedLocation = {
  latitude: number;
  longitude: number;
  roadName: string;
  city: string;
  label: string;
};

export async function getDetectedLocation(): Promise<DetectedLocation> {
  const location = await getCurrentLocationFix();
  const { latitude, longitude } = location.coords;

  try {
    const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
    const roadName = [address.name, address.streetNumber, address.street]
      .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
      .filter((part, index, parts) => parts.indexOf(part) === index)
      .join(' ');
    const city = address.city ?? address.subregion ?? address.region ?? 'Current area';
    const resolvedRoadName = roadName || 'Current location';
    return { latitude, longitude, roadName: resolvedRoadName, city, label: `${resolvedRoadName}, ${city}` };
  } catch {
    const label = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    return { latitude, longitude, roadName: 'Current location', city: 'Current area', label };
  }
}

function createUuid() {
  return Crypto.randomUUID();
}

export function toGpsPoint(location: Location.LocationObject): TrackingPoint {
  return {
    clientPointId: createUuid(),
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    speedMps: location.coords.speed != null && location.coords.speed >= 0 ? location.coords.speed : null,
    headingDegrees: location.coords.heading != null && location.coords.heading >= 0 ? location.coords.heading : null,
    accuracyMeters: location.coords.accuracy != null && location.coords.accuracy >= 0 ? location.coords.accuracy : null,
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
