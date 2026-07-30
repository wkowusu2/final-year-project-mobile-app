import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { AuthTokens, DriverProfile } from '@/src/types/driver';
import { ActiveTrackingState } from '@/src/types/tracking';
import { ThemePreference } from '@/src/types/app';

const KEYS = {
  driver: 'roadpulse.driver',
  pendingPoints: 'roadpulse.pendingGpsPoints',
  lastSyncAt: 'roadpulse.lastSyncAt',
  summary: 'roadpulse.lastSummary',
  accessToken: 'roadpulse.accessToken',
  refreshToken: 'roadpulse.refreshToken',
  userId: 'roadpulse.userId',
  hasProfile: 'roadpulse.hasProfile',
  fullName: 'roadpulse.fullName',
  doneOnBoarding: 'roadpulse.doneOnBoarding',
  activeTracking: 'roadpulse.activeTracking',
  themePreference: 'roadpulse.themePreference',
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
  saveUserId(value: string) {
    return AsyncStorage.setItem(KEYS.userId, value);
  },
  getUserId() {
    return AsyncStorage.getItem(KEYS.userId);
  },
  clearUserId() {
    return AsyncStorage.removeItem(KEYS.userId);
  },
  saveHasProfile(value: boolean) {
    return AsyncStorage.setItem(KEYS.hasProfile, JSON.stringify(value));
  },
  async getHasProfile() {
    const raw = await AsyncStorage.getItem(KEYS.hasProfile);
    return raw ? (JSON.parse(raw) as boolean) : null;
  },
  clearHasProfile() {
    return AsyncStorage.removeItem(KEYS.hasProfile);
  },
  saveFullName(value: string) {
    return AsyncStorage.setItem(KEYS.fullName, value);
  },
  getFullName() {
    return AsyncStorage.getItem(KEYS.fullName);
  },
  clearFullName() {
    return AsyncStorage.removeItem(KEYS.fullName);
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
  saveActiveTracking(state: ActiveTrackingState) {
    return AsyncStorage.setItem(KEYS.activeTracking, JSON.stringify(state));
  },
  getActiveTracking() {
    return readJson<ActiveTrackingState | null>(KEYS.activeTracking, null);
  },
  clearActiveTracking() {
    return AsyncStorage.removeItem(KEYS.activeTracking);
  },
  saveThemePreference(value: ThemePreference) {
    return AsyncStorage.setItem(KEYS.themePreference, value);
  },
  async getThemePreference(): Promise<ThemePreference> {
    const value = await AsyncStorage.getItem(KEYS.themePreference);
    return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
  },
  async logout() {
    await AsyncStorage.multiRemove([
      KEYS.driver,
      KEYS.pendingPoints,
      KEYS.lastSyncAt,
      KEYS.summary,
      KEYS.activeTracking,
      KEYS.userId,
      KEYS.hasProfile,
      KEYS.fullName,
      KEYS.doneOnBoarding,
    ]);
    await this.clearTokens();
  },
};
