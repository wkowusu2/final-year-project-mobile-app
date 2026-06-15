import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { radius, spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

const permissionItems = [
  {
    id: 'location',
    title: 'Location Access',
    description: 'Used to detect current position and nearby road conditions.',
  },
  {
    id: 'background-location',
    title: 'Background Location',
    description: 'Needed to continue trip tracking while the app is minimized.',
  },
  {
    id: 'activity',
    title: 'Activity Recognition',
    description: 'Improves journey detection and commuter movement quality.',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Delivers incidents, route changes, and traffic alerts in real time.',
  },
] as const;

export default function PermissionsScreen() {
  const theme = useAppTheme();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const colors = useMemo(
    () => ({
      background: theme.mode === 'dark' ? '#0F172A' : '#FFF7F3',
      card: theme.mode === 'dark' ? '#182235' : '#FFFFFF',
      text: theme.mode === 'dark' ? '#F8FAFC' : '#0F172A',
      subtext: theme.mode === 'dark' ? '#CBD5E1' : '#475569',
      muted: theme.mode === 'dark' ? '#94A3B8' : '#94A3B8',
      border: theme.mode === 'dark' ? '#334155' : '#E2E8F0',
      accent: '#F97316',
      accentPressed: '#EA580C',
      chip: theme.mode === 'dark' ? '#1F2937' : '#FFF1E6',
      selectedCard: theme.mode === 'dark' ? '#1E293B' : '#FFF1E6',
      segmentInactive: theme.mode === 'dark' ? '#334155' : '#FED7AA',
    }),
    [theme.mode],
  );

  const selectedCount = selectedPermissions.length;

  function togglePermission(id: string) {
    setSelectedPermissions((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.panel, { backgroundColor: colors.card }]}>
          <View style={styles.hero}>
            <View style={[styles.badge, { backgroundColor: colors.chip }]}>
              <Text style={styles.badgeText}>SETUP</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Permission setup</Text>
            <Text style={[styles.description, { color: colors.subtext }]}>
              Choose the permissions you want to enable and track your setup progress as you go.
            </Text>
          </View>

          <View style={styles.progressRow}>
            {permissionItems.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.progress,
                  {
                    backgroundColor: index < selectedCount ? colors.accent : colors.segmentInactive,
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.permissionList}>
            {permissionItems.map((item) => {
              const selected = selectedPermissions.includes(item.id);

              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => togglePermission(item.id)}
                  style={({ pressed }) => [
                    styles.permissionCard,
                    {
                      backgroundColor: selected ? colors.selectedCard : colors.card,
                      borderColor: selected ? colors.accent : colors.border,
                      opacity: pressed ? 0.92 : 1,
                    },
                  ]}>
                  <View style={styles.permissionCardHeader}>
                    <Text style={[styles.permissionTitle, { color: colors.text }]}>{item.title}</Text>
                    <View
                      style={[
                        styles.checkmark,
                        {
                          backgroundColor: selected ? colors.accent : 'transparent',
                          borderColor: selected ? colors.accent : colors.border,
                        },
                      ]}>
                      {selected ? <Text style={styles.checkmarkText}>✓</Text> : null}
                    </View>
                  </View>
                  <Text style={[styles.permissionBody, { color: colors.subtext }]}>{item.description}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/(tabs)/home')}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: pressed ? colors.accentPressed : colors.accent,
              },
            ]}>
            <Text style={styles.primaryButtonText}>Continue to Dashboard</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  panel: {
    borderRadius: 32,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.md,
  },
  badge: {
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    color: '#F97316',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  progress: {
    flex: 1,
    height: 10,
    borderRadius: radius.round,
  },
  permissionList: {
    gap: spacing.md,
  },
  permissionCard: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  permissionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  permissionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: radius.round,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  permissionBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});
