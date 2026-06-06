import { Text } from 'react-native';

import { AppHeader, Card, Chip, Screen } from '@/src/components/ui';
import { notifications } from '@/src/data/mock-data';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export default function NotificationsScreen() {
  const theme = useAppTheme();

  return (
    <Screen scrollable>
      <AppHeader title="Notifications" subtitle="Traffic alerts, route updates, incident changes, and community activity" />
      {notifications.map((notification) => (
        <Card key={notification.id}>
          <Chip label={notification.category} tone={notification.unread ? 'primary' : 'default'} />
          <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '800' }}>{notification.title}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 15, lineHeight: 22 }}>{notification.message}</Text>
          <Text style={{ color: theme.textMuted, fontSize: 13 }}>{notification.time}</Text>
        </Card>
      ))}
    </Screen>
  );
}
