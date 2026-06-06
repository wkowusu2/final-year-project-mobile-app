import { StyleSheet, Text, View } from 'react-native';

import { AppHeader, Card, Chip, Screen } from '@/src/components/ui';
import { incidents } from '@/src/data/mock-data';
import { spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export default function MyReportsScreen() {
  const theme = useAppTheme();

  return (
    <Screen scrollable>
      <AppHeader title="My Reports" subtitle="Search, filter, and track the status of your traffic incident submissions" />
      <View style={styles.filters}>
        <Chip label="Search reports" tone="primary" />
        <Chip label="Status" tone="default" />
        <Chip label="Location" tone="default" />
      </View>
      {incidents.map((incident) => (
        <Card key={incident.id}>
          <View style={styles.topRow}>
            <Text style={[styles.type, { color: theme.textPrimary }]}>{incident.type}</Text>
            <Chip label={incident.status} tone={incident.status === 'Verified' ? 'success' : incident.status === 'Resolved' ? 'primary' : 'warning'} />
          </View>
          <Text style={[styles.meta, { color: theme.textSecondary }]}>{incident.timestamp} · {incident.roadName}</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  type: { fontSize: 16, fontWeight: '800' },
  meta: { fontSize: 14 },
});
