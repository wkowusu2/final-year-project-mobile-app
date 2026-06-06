import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton, AppHeader, Card, MetricCard, Screen, SectionTitle } from '@/src/components/ui';
import { currentUser } from '@/src/data/mock-data';
import { radius, spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export default function ProfileScreen() {
  const theme = useAppTheme();

  return (
    <Screen scrollable>
      <AppHeader title="Profile" subtitle="Contribution level, preferences, and account settings" />
      <Card style={styles.profileCard}>
        <View style={[styles.photo, { backgroundColor: theme.primarySoft }]}>
          <Text style={[styles.photoText, { color: theme.primary }]}>{currentUser.photoInitials}</Text>
        </View>
        <Text style={[styles.name, { color: theme.textPrimary }]}>{currentUser.name}</Text>
        <Text style={[styles.level, { color: theme.textSecondary }]}>{currentUser.contributionLevel}</Text>
      </Card>

      <View style={styles.metricGrid}>
        <MetricCard label="Kilometers Tracked" value={`${currentUser.kilometersTracked}`} detail="This year" />
        <MetricCard label="Reports Submitted" value={`${currentUser.reportsSubmitted}`} detail="Community verified" />
        <MetricCard label="Contribution Score" value={`${currentUser.contributionScore}`} detail="Top 10%" />
      </View>

      <SectionTitle title="Menu" />
      <View style={styles.actions}>
        <AppButton label="Notifications" variant="ghost" onPress={() => router.push('/notifications')} />
        <AppButton label="Rewards" variant="ghost" onPress={() => router.push('/rewards')} />
        <AppButton label="Settings" variant="ghost" onPress={() => router.push('/settings')} />
        <AppButton label="Help" variant="outline" />
        <AppButton label="Logout" variant="danger" onPress={() => router.replace('/(auth)/login')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: 'center',
  },
  photo: {
    width: 90,
    height: 90,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    fontSize: 28,
    fontWeight: '900',
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
  },
  level: {
    fontSize: 15,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
});
