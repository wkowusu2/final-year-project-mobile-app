import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';

import { InfoCard } from '@/src/components/InfoCard';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { StatusBadge } from '@/src/components/StatusBadge';
import { Colors } from '@/src/constants/colors';
import { useLocationTracking } from '@/src/hooks/useLocationTracking';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { storageService } from '@/src/services/storageService';
import { DriverProfile } from '@/src/types/driver';

const ACCRA_REGION = {
  latitude: 5.6037,
  longitude: -0.187,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function HomeScreen() {
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const { isOnline } = useNetworkStatus();
  const tracking = useLocationTracking(driver, isOnline);
  const { syncNow } = tracking;

  const refreshStorageStats = useCallback(async () => {
    const [pending, syncTime] = await Promise.all([
      storageService.getPendingPoints(),
      storageService.getLastSyncAt(),
    ]);
    setPendingCount(pending.length);
    setLastSyncAt(syncTime);
  }, []);

  useFocusEffect(
    useCallback(() => {
      storageService.getDriver().then((profile) => {
        if (!profile) {
          router.replace('/welcome');
          return;
        }
        setDriver(profile);
      });
      refreshStorageStats();
    }, [refreshStorageStats]),
  );

  useEffect(() => {
    if (isOnline && driver) {
      syncNow().finally(refreshStorageStats);
    }
  }, [driver, isOnline, refreshStorageStats, syncNow]);

  async function toggleTracking() {
    if (tracking.isTracking) {
      const summary = await tracking.stopTracking();
      await refreshStorageStats();
      if (summary) {
        router.push('/summary');
      }
      return;
    }

    await tracking.startTracking();
  }

  const gpsTone = tracking.gpsStatus === 'Good' ? 'success' : tracking.gpsStatus === 'Weak' ? 'warning' : 'danger';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.welcome}>Driver</Text>
          <Text style={styles.name}>{driver?.fullName ?? 'Loading...'}</Text>
        </View>
        <Pressable onPress={() => router.push('/settings')} style={styles.settingsButton}>
          <Text style={styles.settingsText}>Settings</Text>
        </Pressable>
      </View>

      <View style={styles.mapWrap}>
        <MapView
          initialRegion={ACCRA_REGION}
          mapType={Platform.select({ android: 'none', default: 'standard' })}
          style={styles.map}>
          <UrlTile
            maximumZ={19}
            tileSize={256}
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker coordinate={{ latitude: ACCRA_REGION.latitude, longitude: ACCRA_REGION.longitude }} />
        </MapView>
      </View>

      <View style={styles.badgeRow}>
        <StatusBadge
          label={tracking.isTracking ? 'Active' : 'Not Active'}
          tone={tracking.isTracking ? 'success' : 'neutral'}
        />
        <StatusBadge label={`GPS ${tracking.gpsStatus}`} tone={gpsTone} />
        <StatusBadge label={isOnline ? 'Online' : 'Offline'} tone={isOnline ? 'info' : 'warning'} />
      </View>

      {tracking.error ? <Text style={styles.error}>{tracking.error}</Text> : null}

      <View style={styles.grid}>
        <InfoCard title="Points collected" value={`${tracking.pointsCollected}`} />
        <InfoCard title="Unsent points" value={`${pendingCount}`} />
        <InfoCard title="Last sync" value={lastSyncAt ? new Date(lastSyncAt).toLocaleTimeString() : 'Never'} />
        <InfoCard title="Synced now" value={`${tracking.pointsSynced}`} />
      </View>

      <PrimaryButton
        loading={tracking.loading}
        onPress={toggleTracking}
        title={tracking.isTracking ? 'Stop Tracking' : 'Start Tracking'}
        variant={tracking.isTracking ? 'danger' : 'primary'}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 18, backgroundColor: Colors.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  welcome: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700' },
  name: { color: Colors.textPrimary, fontSize: 24, fontWeight: '900' },
  settingsButton: {
    borderRadius: 999,
    borderColor: Colors.border,
    borderWidth: 1,
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  settingsText: { color: Colors.primary, fontWeight: '800' },
  mapWrap: {
    height: 230,
    overflow: 'hidden',
    borderRadius: 16,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  map: { width: '100%', height: '100%' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  error: { color: Colors.danger, fontSize: 14, fontWeight: '700' },
  grid: { gap: 12 },
});
