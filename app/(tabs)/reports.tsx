import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton, AppHeader, Card, Chip, ListRow, Screen, SectionTitle } from '@/src/components/ui';
import { incidents } from '@/src/data/mock-data';
import { spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export default function ReportsScreen() {
  const theme = useAppTheme();

  return (
    <Screen scrollable>
      <AppHeader title="Community Reports" subtitle="Recent incidents, traffic updates, and alerts from nearby commuters" />
      <View style={styles.actions}>
        <AppButton label="Report Incident" onPress={() => router.push('/report-incident')} />
        <AppButton label="My Reports" variant="ghost" onPress={() => router.push('/my-reports')} />
      </View>
      <SectionTitle title="Recent incidents" action="Feed" />
      {incidents.map((incident) => (
        <Card key={incident.id}>
          <View style={styles.rowTop}>
            <Chip label={incident.type} tone={incident.status === 'Verified' ? 'success' : incident.status === 'Resolved' ? 'primary' : 'warning'} />
            <Text style={[styles.time, { color: theme.textSecondary }]}>{incident.timestamp}</Text>
          </View>
          <Text style={[styles.road, { color: theme.textPrimary }]}>{incident.roadName}</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>{incident.description}</Text>
          <View style={styles.rowBottom}>
            <Chip label={`${incident.status}`} tone={incident.status === 'Verified' ? 'success' : incident.status === 'Resolved' ? 'primary' : 'warning'} />
            <Text style={[styles.upvotes, { color: theme.textSecondary }]}>{incident.upvotes} upvotes · {incident.verifiedByCommunity} verifies</Text>
          </View>
          <View style={styles.actions}>
            <AppButton label="Verify Report" variant="ghost" />
            <AppButton label="Upvote Report" variant="outline" />
            <AppButton label="Share" variant="outline" onPress={() => router.push('/incident-details')} />
          </View>
        </Card>
      ))}
      <SectionTitle title="Community alerts" />
      <ListRow title="Peak-hour caution" subtitle="Use Liberation Road as the preferred corridor toward Airport City after 6 PM today." />
      <ListRow title="Weather watch" subtitle="Localized rainfall may increase flooding risk near Kaneshie and Odaw tonight." />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    alignItems: 'center',
  },
  time: {
    fontSize: 13,
    fontWeight: '700',
  },
  road: {
    fontSize: 17,
    fontWeight: '800',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    alignItems: 'center',
  },
  upvotes: {
    fontSize: 13,
    flex: 1,
    textAlign: 'right',
  },
});
