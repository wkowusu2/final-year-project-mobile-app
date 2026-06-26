import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

const accountStats = [
  { id: 'tracked', label: 'KM Tracked', value: '1,284', icon: 'map-marker-distance' },
  { id: 'reports', label: 'Reports', value: '6', icon: 'file-document-outline' },
  { id: 'score', label: 'Score', value: '3,240', icon: 'star-outline' },
] as const;

const menuItems = [
  { id: 'settings', title: 'Settings', subtitle: 'App preferences & controls', icon: 'cog-outline', route: '/settings', tone: 'primary' },
  { id: 'privacy', title: 'Privacy', subtitle: 'Data sharing & anonymization', icon: 'shield-outline', tone: 'teal' },
  { id: 'help', title: 'Help & Support', subtitle: 'FAQ, contact us', icon: 'help-circle-outline', tone: 'purple' },
  { id: 'logout', title: 'Log Out', subtitle: 'Sign out of your account', icon: 'logout-variant', tone: 'danger', route: '/(auth)/login' },
] as const;

export default function ProfileScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + 20 }]}
      showsVerticalScrollIndicator={false}>
      <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.profileTopRow}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>JD</Text>
          </View>

          <View style={styles.profileCopy}>
            <Text style={[styles.name, { color: theme.textPrimary }]}>Juan dela Cruz</Text>
            <Text style={[styles.email, { color: theme.textSecondary }]}>juan@example.com</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badgeIcon, { backgroundColor: '#FEF3C7' }]}>
                <MaterialCommunityIcons color="#D97706" name="medal" size={12} />
              </View>
              <Text style={[styles.badgeText, { color: '#B45309' }]}>Gold Contributor</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.metricRow}>
        {accountStats.map((metric) => (
          <View key={metric.id} style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.metricIcon, metric.id === 'reports' ? styles.metricIconTeal : metric.id === 'score' ? styles.metricIconAmber : styles.metricIconPurple]}>
              <MaterialCommunityIcons
                color={metric.id === 'reports' ? '#14B8A6' : metric.id === 'score' ? '#F59E0B' : '#7C3AED'}
                name={metric.icon as never}
                size={18}
              />
            </View>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{metric.value}</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>{metric.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.levelCard, { backgroundColor: '#ECE4FF' }]}>
        <View style={styles.levelRow}>
          <Text style={styles.levelTitle}>Gold Level</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/rewards')}>
            <Text style={styles.levelAction}>View Rewards</Text>
          </Pressable>
        </View>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.levelHint}>320/500 pts to Platinum</Text>
      </View>

      <View style={styles.menuList}>
        {menuItems.map((item) => {
          const isDanger = item.tone === 'danger';
          const iconBg = item.tone === 'primary' ? '#F3E8FF' : item.tone === 'teal' ? '#ECFBF7' : item.tone === 'purple' ? '#F5F3FF' : '#FEE2E2';
          const iconColor = item.tone === 'primary' ? '#7C3AED' : item.tone === 'teal' ? '#14B8A6' : item.tone === 'purple' ? '#A855F7' : '#EF4444';

          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() => {
                if (item.route) {
                  if (item.route === '/(auth)/login') {
                    router.replace(item.route);
                    return;
                  }
                  router.push(item.route);
                }
              }}
              style={({ pressed }) => [
                styles.menuItem,
                {
                  backgroundColor: isDanger ? '#FFF1F2' : theme.surface,
                  borderColor: isDanger ? '#FECACA' : theme.border,
                  opacity: pressed ? 0.96 : 1,
                },
              ]}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
                  <MaterialCommunityIcons color={iconColor} name={item.icon as never} size={18} />
                </View>
                <View style={styles.menuTextBlock}>
                  <Text style={[styles.menuTitle, { color: isDanger ? '#EF4444' : theme.textPrimary }]}>{item.title}</Text>
                  <Text style={[styles.menuSubtitle, { color: isDanger ? '#FB7185' : theme.textSecondary }]}>{item.subtitle}</Text>
                </View>
              </View>
              <MaterialCommunityIcons color={isDanger ? '#FB7185' : theme.textMuted} name="chevron-right" size={20} />
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.footer, { color: theme.textMuted }]}>TrafficPulse v2.41</Text>
      <Text style={[styles.footerSubtext, { color: theme.textMuted }]}>© 2026 TrafficPulse Inc.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 12,
    gap: 12,
  },
  profileCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  profileCopy: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  email: {
    fontSize: 13,
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  badgeIcon: {
    width: 16,
    height: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minHeight: 98,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIcon: {
    width: 26,
    height: 26,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricIconPurple: {
    backgroundColor: '#F3E8FF',
  },
  metricIconTeal: {
    backgroundColor: '#ECFBF7',
  },
  metricIconAmber: {
    backgroundColor: '#FFF7E0',
  },
  metricValue: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  metricLabel: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 18,
  },
  levelCard: {
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1F1147',
  },
  levelAction: {
    fontSize: 13,
    fontWeight: '800',
    color: '#A855F7',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(124, 58, 237, 0.14)',
  },
  progressFill: {
    width: '72%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#6D28D9',
  },
  levelHint: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B21A8',
  },
  menuList: {
    gap: 10,
  },
  menuItem: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextBlock: {
    flex: 1,
    gap: 2,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  menuSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
  },
  footerSubtext: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: -8,
  },
});
