import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { InfoCard } from '@/src/components/InfoCard';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Colors } from '@/src/constants/colors';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { storageService } from '@/src/services/storageService';
import { syncPendingPoints } from '@/src/services/trackingService';
import { DriverProfile } from '@/src/types/driver';

export default function SettingsScreen() {
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const { isOnline } = useNetworkStatus();

  const load = useCallback(async () => {
    const [profile, points] = await Promise.all([
      storageService.getDriver(),
      storageService.getPendingPoints(),
    ]);
    setDriver(profile);
    setPendingCount(points.length);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function syncNow() {
    if (!driver) {
      return;
    }

    setSyncing(true);
    try {
      const result = await syncPendingPoints(driver, isOnline);
      await load();
      Alert.alert('Sync complete', `${result.synced} point(s) synced. ${result.remaining} remaining.`);
    } catch (error) {
      Alert.alert('Sync failed', error instanceof Error ? error.message : 'Try again later.');
    } finally {
      setSyncing(false);
    }
  }

  async function logout() {
    await storageService.logout();
    router.replace('/welcome');
  }

  return (
    <View style={styles.container}>
      <InfoCard title="Profile">
        <Text style={styles.name}>{driver?.fullName ?? 'No driver profile'}</Text>
        <Text style={styles.text}>{driver?.phoneNumber}</Text>
        <Text style={styles.text}>
          {driver ? `${driver.vehicleType}${driver.vehiclePlateNumber ? ` - ${driver.vehiclePlateNumber}` : ''}` : ''}
        </Text>
      </InfoCard>

      <Pressable style={styles.row}>
        <Text style={styles.rowTitle}>View profile</Text>
        <Text style={styles.rowValue}>{driver?.driverId ?? 'Unavailable'}</Text>
      </Pressable>

      <Pressable onPress={syncNow} style={styles.row}>
        <Text style={styles.rowTitle}>Sync unsent data</Text>
        <Text style={styles.rowValue}>{pendingCount} pending</Text>
      </Pressable>

      <InfoCard title="About project">
        <Text style={styles.text}>
          Crowdsourced Traffic Congestion Monitoring System for Urban Roads in Ghana collects
          clean GPS movement data from participating drivers. The backend handles storage, map
          matching, and congestion analysis.
        </Text>
      </InfoCard>

      <View style={styles.actions}>
        <PrimaryButton title="Sync Unsent Data" loading={syncing} onPress={syncNow} />
        <PrimaryButton title="Logout" variant="danger" onPress={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 14, backgroundColor: Colors.background },
  name: { color: Colors.textPrimary, fontSize: 20, fontWeight: '900' },
  text: { color: Colors.textSecondary, fontSize: 15, lineHeight: 22 },
  row: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    padding: 16,
    gap: 4,
  },
  rowTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '800' },
  rowValue: { color: Colors.textSecondary, fontSize: 13 },
  actions: { marginTop: 'auto', gap: 12 },
});
