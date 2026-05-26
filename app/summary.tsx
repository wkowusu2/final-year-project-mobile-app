import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { InfoCard } from '@/src/components/InfoCard';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Colors } from '@/src/constants/colors';
import { storageService } from '@/src/services/storageService';
import { TrackingSummary } from '@/src/types/tracking';

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export default function SummaryScreen() {
  const [summary, setSummary] = useState<TrackingSummary | null>(null);

  useFocusEffect(
    useCallback(() => {
      storageService.getSummary().then(setSummary);
    }, []),
  );

  if (!summary) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>No completed session yet</Text>
        <PrimaryButton title="Back Home" onPress={() => router.replace('/home')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Session complete</Text>
      <View style={styles.grid}>
        <InfoCard title="Session duration" value={formatDuration(summary.durationSeconds)} />
        <InfoCard title="GPS points collected" value={`${summary.pointsCollected}`} />
        <InfoCard title="Points synced" value={`${summary.pointsSynced}`} />
        <InfoCard title="Unsynced points" value={`${summary.unsyncedPoints}`} />
        <InfoCard title="Start time" value={new Date(summary.startedAt).toLocaleString()} />
        <InfoCard title="End time" value={new Date(summary.endedAt).toLocaleString()} />
      </View>
      <PrimaryButton title="Back Home" onPress={() => router.replace('/home')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 18, backgroundColor: Colors.background },
  heading: { color: Colors.textPrimary, fontSize: 28, fontWeight: '900' },
  grid: { gap: 12 },
});
