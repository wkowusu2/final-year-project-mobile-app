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

async function ensureLocationPermission() {
  const existingPermission = await getLocationPermission();
  if (existingPermission.status === 'granted') {
    return existingPermission;
  }

  return requestLocationPermission();
}

export async function getCurrentLocationFix(accuracy = Location.Accuracy.High) {
  const permission = await ensureLocationPermission();
  if (permission.status !== 'granted') {
    throw new Error('Location permission was not granted.');
  }

  return Location.getCurrentPositionAsync({ accuracy });
}

export async function getCurrentLocation() {
  const location = await getCurrentLocationFix();
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

/** A faster, balanced-accuracy fix for centering the map outside an active drive. */
export async function getCurrentMapLocation() {
  const location = await getCurrentLocationFix(Location.Accuracy.Balanced);
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

/** Resolves a driver-entered destination immediately while the route screen is visible. */
export async function geocodeDestination(destination: string) {
  const permission = await ensureLocationPermission();
  if (permission.status !== 'granted') throw new Error('Location permission was not granted.');
  const matches = await Location.geocodeAsync(destination);
  const match = matches[0];
  if (!match) throw new Error('We could not find that destination. Try a more specific place name.');
  return { latitude: match.latitude, longitude: match.longitude };
}

/**
 * Returns a recent device location without waiting for a new GPS fix. This is
 * intentionally suitable for quickly positioning maps, not for drive tracking.
 */
export async function getLastKnownLocation() {
  const permission = await ensureLocationPermission();
  if (permission.status !== 'granted') {
    throw new Error('Location permission was not granted.');
  }

  const location = await Location.getLastKnownPositionAsync({
    maxAge: 10 * 60 * 1000,
    requiredAccuracy: 1000,
  });

  return location
    ? { latitude: location.coords.latitude, longitude: location.coords.longitude }
    : null;
}

export type DetectedLocation = {
  latitude: number;
  longitude: number;
  roadName: string;
  city: string;
  label: string;
};

async function detectLocation(location: Location.LocationObject): Promise<DetectedLocation> {
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

export async function getDetectedLocation(): Promise<DetectedLocation> {
  return detectLocation(await getCurrentLocationFix());
}

/**
 * Resolves a recent location to a readable area without waiting for a new GPS
 * fix. It is intended for immediate UI feedback before a live fix arrives.
 */
export async function getLastKnownDetectedLocation(): Promise<DetectedLocation | null> {
  const permission = await ensureLocationPermission();
  if (permission.status !== 'granted') {
    throw new Error('Location permission was not granted.');
  }

  const location = await Location.getLastKnownPositionAsync({
    maxAge: 5 * 60 * 1000,
    requiredAccuracy: 500,
  });

  return location ? detectLocation(location) : null;
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
