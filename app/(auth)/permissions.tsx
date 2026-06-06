import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton, Card, Chip, Screen } from '@/src/components/ui';
import { spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

const permissionItems = [
  ['Location Access', 'Used to detect current position and nearby road conditions.'],
  ['Background Location', 'Needed to continue trip tracking while the app is minimized.'],
  ['Activity Recognition', 'Improves journey detection and commuter movement quality.'],
  ['Notifications', 'Delivers incidents, route changes, and traffic alerts in real time.'],
] as const;

export default function PermissionsScreen() {
  const theme = useAppTheme();

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Permission setup</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>TrafficPulse explains every permission so commuters and institutions can trust how data is used.</Text>
      </View>

      <View style={styles.progressRow}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={[styles.progress, { backgroundColor: item <= 4 ? theme.primary : theme.border }]} />
        ))}
      </View>

      {permissionItems.map(([title, description]) => (
        <Card key={title}>
          <Chip label={title} tone="primary" />
          <Text style={[styles.permissionBody, { color: theme.textSecondary }]}>{description}</Text>
        </Card>
      ))}

      <AppButton label="Continue to Dashboard" onPress={() => router.replace('/(tabs)/home')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  progress: {
    flex: 1,
    height: 8,
    borderRadius: 999,
  },
  permissionBody: {
    fontSize: 15,
    lineHeight: 22,
  },
});
