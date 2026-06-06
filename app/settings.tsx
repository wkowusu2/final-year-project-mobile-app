import { Text, View } from 'react-native';

import { AppHeader, Card, Chip, Screen, SectionTitle } from '@/src/components/ui';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export default function SettingsScreen() {
  const theme = useAppTheme();

  return (
    <Screen scrollable>
      <AppHeader title="Settings" subtitle="Privacy, tracking, notifications, appearance, and language controls" />
      <Card>
        <SectionTitle title="Privacy" />
        <View style={{ gap: 12 }}>
          <Chip label="Anonymous Data Sharing" tone="primary" />
          <Chip label="Data Collection Controls" tone="default" />
        </View>
      </Card>
      <Card>
        <SectionTitle title="Tracking" />
        <View style={{ gap: 12 }}>
          <Chip label="Auto Start Tracking" tone="default" />
          <Chip label="Background Tracking" tone="primary" />
        </View>
      </Card>
      <Card>
        <SectionTitle title="Notifications" />
        <View style={{ gap: 12 }}>
          <Chip label="Traffic Alerts" tone="primary" />
          <Chip label="Incident Alerts" tone="default" />
        </View>
      </Card>
      <Card>
        <SectionTitle title="Appearance" />
        <Text style={{ color: theme.textSecondary }}>Light Mode · Dark Mode</Text>
      </Card>
      <Card>
        <SectionTitle title="Language" />
        <Text style={{ color: theme.textSecondary }}>English · Local Language Support</Text>
      </Card>
    </Screen>
  );
}
