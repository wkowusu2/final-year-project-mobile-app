import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { InfoCard } from '@/src/components/InfoCard';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Colors } from '@/src/constants/colors';
import { requestLocationPermission } from '@/src/services/locationService';

export default function PermissionScreen() {
  const [loading, setLoading] = useState(false);

  async function allowLocation() {
    setLoading(true);
    const result = await requestLocationPermission();
    setLoading(false);

    if (result.status !== 'granted') {
      Alert.alert('Permission needed', 'RoadPulse Ghana needs location access while tracking.');
      return;
    }

    router.replace('/home');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Location access keeps the data useful</Text>
      <Text style={styles.copy}>
        RoadPulse Ghana collects GPS movement readings only when you start tracking.
      </Text>

      <InfoCard>
        {['To collect movement data', 'To analyze road congestion', 'To support traffic planning'].map(
          (item) => (
            <View key={item} style={styles.reason}>
              <View style={styles.dot} />
              <Text style={styles.reasonText}>{item}</Text>
            </View>
          ),
        )}
      </InfoCard>

      <View style={styles.actions}>
        <PrimaryButton title="Allow Location Access" loading={loading} onPress={allowLocation} />
        <PrimaryButton title="Continue" variant="outline" onPress={() => router.replace('/home')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 18, backgroundColor: Colors.background },
  heading: { color: Colors.textPrimary, fontSize: 28, fontWeight: '900', lineHeight: 34 },
  copy: { color: Colors.textSecondary, fontSize: 16, lineHeight: 24 },
  reason: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.accent },
  reasonText: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  actions: { marginTop: 'auto', gap: 12 },
});
