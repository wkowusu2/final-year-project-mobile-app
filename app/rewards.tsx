import { StyleSheet, Text, View } from 'react-native';

import { AppHeader, Card, MetricCard, Screen, SectionTitle } from '@/src/components/ui';
import { currentUser, leaderboard, rewards } from '@/src/data/mock-data';
import { spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export default function RewardsScreen() {
  const theme = useAppTheme();

  return (
    <Screen scrollable>
      <AppHeader title="Rewards & Contribution" subtitle="Gamified progress, top contributors, and earned achievements" />
      <View style={styles.metricGrid}>
        <MetricCard label="Contribution Score" value={`${currentUser.contributionScore}`} detail="Top performer" />
        <MetricCard label="Tracking Hours" value={`${currentUser.trackingHours}`} detail="Hours tracked" />
        <MetricCard label="Reports Submitted" value={`${currentUser.reportsSubmitted}`} detail="Community reports" />
      </View>
      <SectionTitle title="Badges Earned" />
      {rewards.map((reward) => (
        <Card key={reward.id}>
          <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '800' }}>{reward.name}</Text>
          <Text style={{ color: theme.textSecondary }}>{reward.description}</Text>
          <Text style={{ color: theme.primary, fontWeight: '800' }}>{reward.unlocked ? 'Unlocked' : `${reward.progress}% complete`}</Text>
        </Card>
      ))}
      <SectionTitle title="Top Contributors" />
      {leaderboard.map((entry, index) => (
        <Card key={entry.id}>
          <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '800' }}>#{index + 1} {entry.name}</Text>
          <Text style={{ color: theme.textSecondary }}>{entry.points} pts · {entry.trackingHours} hrs · {entry.reports} reports</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
