import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { AuthTokens, DriverProfile } from '@/src/types/driver';
import { GpsPoint, TrackingSummary } from '@/src/types/tracking';

const KEYS = {
  driver: 'roadpulse.driver',
  pendingPoints: 'roadpulse.pendingGpsPoints',
  lastSyncAt: 'roadpulse.lastSyncAt',
  summary: 'roadpulse.lastSummary',
  accessToken: 'roadpulse.accessToken',
  refreshToken: 'roadpulse.refreshToken',
  doneOnBoarding: 'roadpulse.doneOnBoarding',
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

export const storageService = {
  saveDriver(driver: DriverProfile) {
    return AsyncStorage.setItem(KEYS.driver, JSON.stringify(driver));
  },
  getDriver() {
    return readJson<DriverProfile | null>(KEYS.driver, null);
  },
  clearDriver() {
    return AsyncStorage.removeItem(KEYS.driver);
  },
  async saveAuthTokens(tokens: AuthTokens) {
    await SecureStore.setItemAsync(KEYS.accessToken, tokens.accessToken);
    await SecureStore.setItemAsync(KEYS.refreshToken, tokens.refreshToken);
  },
  getAccessToken() {
    return SecureStore.getItemAsync(KEYS.accessToken);
  },
  getRefreshToken() {
    return SecureStore.getItemAsync(KEYS.refreshToken);
  },
  async clearTokens() {
    await SecureStore.deleteItemAsync(KEYS.accessToken);
    await SecureStore.deleteItemAsync(KEYS.refreshToken);
  },
  saveDoneOnBoarding(value: boolean) {
    return AsyncStorage.setItem(KEYS.doneOnBoarding, JSON.stringify(value));
  },
  async getDoneOnBoarding() {
    const raw = await AsyncStorage.getItem(KEYS.doneOnBoarding);
    return raw ? (JSON.parse(raw) as boolean) : null;
  },
  clearDoneOnBoarding() {
    return AsyncStorage.removeItem(KEYS.doneOnBoarding);
  },
  getPendingPoints() {
    return readJson<GpsPoint[]>(KEYS.pendingPoints, []);
  },
  async appendPendingPoints(points: GpsPoint[]) {
    const existing = await this.getPendingPoints();
    await AsyncStorage.setItem(KEYS.pendingPoints, JSON.stringify([...existing, ...points]));
  },
  savePendingPoints(points: GpsPoint[]) {
    return AsyncStorage.setItem(KEYS.pendingPoints, JSON.stringify(points));
  },
  async removePendingPoints(ids: string[]) {
    const existing = await this.getPendingPoints();
    await this.savePendingPoints(existing.filter((point) => !ids.includes(point.id)));
  },
  saveLastSyncAt(value: string) {
    return AsyncStorage.setItem(KEYS.lastSyncAt, value);
  },
  getLastSyncAt() {
    return AsyncStorage.getItem(KEYS.lastSyncAt);
  },
  saveSummary(summary: TrackingSummary) {
    return AsyncStorage.setItem(KEYS.summary, JSON.stringify(summary));
  },
  getSummary() {
    return readJson<TrackingSummary | null>(KEYS.summary, null);
  },
  async logout() {
    await AsyncStorage.multiRemove([KEYS.driver, KEYS.pendingPoints, KEYS.lastSyncAt, KEYS.summary, KEYS.doneOnBoarding]);
    await this.clearTokens();
  },
};
