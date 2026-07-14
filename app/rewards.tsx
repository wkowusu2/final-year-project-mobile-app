import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { currentUser, leaderboard, rewards } from '@/src/data/mock-data';
import { useAppTheme } from '@/src/hooks/useAppTheme';

const metricData = [
  { label: 'Points', value: '4,820', icon: 'star-outline', color: '#B77908', background: '#FFF6D9' },
  { label: 'Drive time', value: '312h', icon: 'clock-outline', color: '#6D3DF5', background: '#F0EBFF' },
  { label: 'Reports', value: '46', icon: 'file-document-outline', color: '#078B7C', background: '#E4F8F5' },
] as const;

export default function RewardsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}>
          <MaterialCommunityIcons color={theme.textPrimary} name="chevron-left" size={23} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: theme.textSecondary }]}>YOUR CONTRIBUTION</Text>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Rewards</Text>
        </View>
      </View>

      <View style={styles.levelHero}>
        <View style={styles.levelTopRow}>
          <View style={styles.levelBadge}><MaterialCommunityIcons color="#B77908" name="medal" size={26} /></View>
          <View style={styles.levelTopCopy}>
            <Text style={styles.levelLabel}>CURRENT LEVEL</Text>
            <Text style={styles.levelName}>Gold contributor</Text>
          </View>
          <Text style={styles.rankLabel}>#2{`\n`}in Accra</Text>
        </View>
        <Text style={styles.levelMessage}>You are helping make every journey safer.</Text>
        <View style={styles.progressLabels}><Text style={styles.progressLabel}>320 / 500 points</Text><Text style={styles.progressLabel}>Platinum</Text></View>
        <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
        <Text style={styles.progressHint}>180 more points to reach your next level</Text>
      </View>

      <View style={styles.metricRow}>
        {metricData.map((metric) => (
          <View key={metric.label} style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.metricIcon, { backgroundColor: metric.background }]}><MaterialCommunityIcons color={metric.color} name={metric.icon} size={18} /></View>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{metric.value}</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>{metric.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <View><Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Your badges</Text><Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Keep contributing to unlock more.</Text></View>
        <Text style={[styles.badgeCount, { color: theme.primary }]}>1 / {rewards.length}</Text>
      </View>
      <View style={styles.badgeList}>
        {rewards.map((reward, index) => {
          const unlocked = reward.unlocked;
          const accent = index === 0 ? '#B77908' : index === 1 ? '#078B7C' : '#6D3DF5';
          const background = index === 0 ? '#FFF6D9' : index === 1 ? '#E4F8F5' : '#F0EBFF';
          const icon = index === 0 ? 'weather-sunset-up' : index === 1 ? 'shield-check-outline' : 'chart-timeline-variant';
          return (
            <View key={reward.id} style={[styles.badgeCard, { backgroundColor: theme.surface, borderColor: unlocked ? accent : theme.border }]}>
              <View style={[styles.badgeIcon, { backgroundColor: unlocked ? background : theme.backgroundMuted }]}>
                <MaterialCommunityIcons color={unlocked ? accent : theme.textMuted} name={icon} size={22} />
              </View>
              <View style={styles.badgeCopy}>
                <View style={styles.badgeTitleRow}>
                  <Text style={[styles.badgeTitle, { color: theme.textPrimary }]}>{reward.name}</Text>
                  <View style={[styles.badgeStatus, { backgroundColor: unlocked ? background : theme.backgroundMuted }]}><Text style={[styles.badgeStatusText, { color: unlocked ? accent : theme.textSecondary }]}>{unlocked ? 'Earned' : `${reward.progress}%`}</Text></View>
                </View>
                <Text style={[styles.badgeDescription, { color: theme.textSecondary }]}>{reward.description}</Text>
                {!unlocked && <View style={[styles.badgeProgressTrack, { backgroundColor: theme.backgroundMuted }]}><View style={[styles.badgeProgressFill, { width: `${reward.progress}%`, backgroundColor: accent }]} /></View>}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.sectionHeader}>
        <View><Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Top contributors</Text><Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>This month in Greater Accra</Text></View>
      </View>
      <View style={[styles.leaderboard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {leaderboard.map((entry, index) => {
          const isCurrentUser = entry.name === currentUser.name;
          return (
            <View key={entry.id} style={[styles.leaderRow, index < leaderboard.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
              <View style={[styles.rank, { backgroundColor: index === 0 ? '#FFF6D9' : isCurrentUser ? theme.primarySoft : theme.backgroundMuted }]}><Text style={[styles.rankText, { color: index === 0 ? '#B77908' : isCurrentUser ? theme.primary : theme.textSecondary }]}>{index + 1}</Text></View>
              <View style={[styles.leaderAvatar, { backgroundColor: isCurrentUser ? theme.primary : index === 0 ? '#D69A22' : '#8892A6' }]}><Text style={styles.leaderInitial}>{entry.name.charAt(0)}</Text></View>
              <View style={styles.leaderCopy}>
                <Text style={[styles.leaderName, { color: theme.textPrimary }]}>{entry.name}{isCurrentUser ? '  · You' : ''}</Text>
                <Text style={[styles.leaderMeta, { color: theme.textSecondary }]}>{entry.trackingHours} hrs · {entry.reports} reports</Text>
              </View>
              <Text style={[styles.leaderPoints, { color: isCurrentUser ? theme.primary : theme.textPrimary }]}>{entry.points.toLocaleString()}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 43, height: 43, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1 },
  eyebrow: { fontSize: 10, lineHeight: 14, fontWeight: '900', letterSpacing: 1, marginBottom: 2 },
  title: { fontSize: 27, lineHeight: 33, fontWeight: '800', letterSpacing: -0.6 },
  levelHero: { backgroundColor: '#5420CD', borderRadius: 25, padding: 19 },
  levelTopRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  levelBadge: { width: 49, height: 49, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  levelTopCopy: { flex: 1 },
  levelLabel: { color: '#DCD0FF', fontSize: 9, fontWeight: '900', letterSpacing: 0.9 },
  levelName: { color: '#FFFFFF', fontSize: 19, lineHeight: 24, fontWeight: '800', marginTop: 2 },
  rankLabel: { color: '#F8D782', fontSize: 11, lineHeight: 15, fontWeight: '800', textAlign: 'right' },
  levelMessage: { color: '#FFFFFF', fontSize: 15, lineHeight: 21, fontWeight: '700', marginTop: 19 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  progressLabel: { color: '#DCD0FF', fontSize: 11, fontWeight: '700' },
  progressTrack: { height: 9, borderRadius: 999, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.18)', marginTop: 7 },
  progressFill: { width: '64%', height: '100%', borderRadius: 999, backgroundColor: '#F8D782' },
  progressHint: { color: '#DCD0FF', fontSize: 11, fontWeight: '600', marginTop: 8 },
  metricRow: { flexDirection: 'row', gap: 9 },
  metricCard: { flex: 1, minHeight: 109, borderRadius: 19, borderWidth: 1, padding: 11, alignItems: 'center' },
  metricIcon: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  metricValue: { fontSize: 18, lineHeight: 22, fontWeight: '800', letterSpacing: -0.3 },
  metricLabel: { fontSize: 11, lineHeight: 15, fontWeight: '600', marginTop: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 1 },
  sectionTitle: { fontSize: 19, lineHeight: 24, fontWeight: '800', letterSpacing: -0.25 },
  sectionSubtitle: { fontSize: 12, lineHeight: 17, fontWeight: '500', marginTop: 1 },
  badgeCount: { fontSize: 12, fontWeight: '800', marginBottom: 2 },
  badgeList: { gap: 9 },
  badgeCard: { minHeight: 88, borderWidth: 1, borderRadius: 19, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11 },
  badgeIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  badgeCopy: { flex: 1 },
  badgeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  badgeTitle: { flex: 1, fontSize: 14, lineHeight: 19, fontWeight: '800' },
  badgeStatus: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  badgeStatusText: { fontSize: 10, fontWeight: '800' },
  badgeDescription: { fontSize: 11, lineHeight: 16, fontWeight: '500', marginTop: 1 },
  badgeProgressTrack: { height: 5, borderRadius: 999, overflow: 'hidden', marginTop: 8 },
  badgeProgressFill: { height: '100%', borderRadius: 999 },
  leaderboard: { borderWidth: 1, borderRadius: 20, overflow: 'hidden' },
  leaderRow: { minHeight: 70, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9 },
  rank: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 11, fontWeight: '900' },
  leaderAvatar: { width: 33, height: 33, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  leaderInitial: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  leaderCopy: { flex: 1 },
  leaderName: { fontSize: 13, lineHeight: 18, fontWeight: '800' },
  leaderMeta: { fontSize: 10, lineHeight: 15, fontWeight: '500' },
  leaderPoints: { fontSize: 13, fontWeight: '800' },
});
