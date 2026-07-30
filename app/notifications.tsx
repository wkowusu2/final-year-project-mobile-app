import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader, Card, Screen } from '@/src/components/ui';
import { notifications } from '@/src/data/mock-data';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { NotificationItem } from '@/src/types/app';

const categoryMeta: Record<NotificationItem['category'], { icon: string; color: string; background: string }> = {
  'Traffic Alerts': { icon: 'traffic-light-outline', color: '#D97706', background: '#FFF4DD' },
  'Route Updates': { icon: 'map-marker-path', color: '#2563EB', background: '#EAF2FF' },
  'Incident Updates': { icon: 'alert-outline', color: '#D84045', background: '#FFF0F1' },
  'Community Notifications': { icon: 'account-group-outline', color: '#0F8A7A', background: '#E4F8F5' },
};

export default function NotificationsScreen() {
  const theme = useAppTheme();
  const [items, setItems] = useState(notifications);
  const unreadCount = useMemo(() => items.filter((item) => item.unread).length, [items]);
  const unreadItems = items.filter((item) => item.unread);
  const earlierItems = items.filter((item) => !item.unread);

  function markAsRead(id: string) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, unread: false } : item));
  }

  function markAllAsRead() {
    setItems((current) => current.map((item) => ({ ...item, unread: false })));
  }

  return (
    <Screen scrollable>
      <AppHeader
        title="Notifications"
        subtitle={unreadCount ? `${unreadCount} new update${unreadCount === 1 ? '' : 's'} for your drive` : 'You are all caught up'}
        right={
          unreadCount ? (
            <Pressable accessibilityRole="button" onPress={markAllAsRead} style={({ pressed }) => [styles.markReadButton, { backgroundColor: theme.primarySoft, opacity: pressed ? 0.8 : 1 }]}>
              <MaterialCommunityIcons color={theme.primary} name="check-all" size={19} />
            </Pressable>
          ) : undefined
        }
      />

      <Card style={styles.summaryCard}>
        <View style={styles.summaryTopRow}>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryEyebrow}>YOUR DRIVE INBOX</Text>
            <Text style={styles.summaryTitle}>{unreadCount ? 'Stay ahead of the road' : 'All clear for now'}</Text>
            <Text style={styles.summaryText}>{unreadCount ? 'Important route, traffic, and community updates are waiting for you.' : 'We will let you know when there is something useful for your next journey.'}</Text>
          </View>
          <View style={styles.bellWrap}>
            <MaterialCommunityIcons color="#FFFFFF" name="bell-outline" size={28} />
            {unreadCount ? <View style={styles.unreadBubble}><Text style={styles.unreadBubbleText}>{unreadCount}</Text></View> : null}
          </View>
        </View>
      </Card>

      {unreadItems.length ? <NotificationSection title="NEW" items={unreadItems} onPress={markAsRead} /> : null}
      {earlierItems.length ? <NotificationSection title={unreadItems.length ? 'EARLIER' : 'RECENT'} items={earlierItems} onPress={markAsRead} /> : null}
    </Screen>
  );
}

function NotificationSection({ title, items, onPress }: { title: string; items: NotificationItem[]; onPress: (id: string) => void }) {
  const theme = useAppTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
      <View style={styles.notificationList}>
        {items.map((item) => <NotificationCard key={item.id} notification={item} onPress={onPress} />)}
      </View>
    </View>
  );
}

function NotificationCard({ notification, onPress }: { notification: NotificationItem; onPress: (id: string) => void }) {
  const theme = useAppTheme();
  const meta = categoryMeta[notification.category];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}. ${notification.unread ? 'Unread' : 'Read'}`}
      onPress={() => onPress(notification.id)}
      style={({ pressed }) => [styles.notificationCard, { backgroundColor: notification.unread ? theme.primarySoft : theme.surface, borderColor: notification.unread ? theme.primary : theme.border, opacity: pressed ? 0.82 : 1 }]}
    >
      <View style={[styles.categoryIcon, { backgroundColor: meta.background }]}>
        <MaterialCommunityIcons color={meta.color} name={meta.icon as never} size={21} />
      </View>
      <View style={styles.notificationCopy}>
        <View style={styles.notificationMeta}>
          <Text style={[styles.categoryLabel, { color: notification.unread ? theme.primary : theme.textSecondary }]}>{notification.category}</Text>
          <Text style={[styles.time, { color: theme.textMuted }]}>{notification.time}</Text>
        </View>
        <Text style={[styles.notificationTitle, { color: theme.textPrimary }]}>{notification.title}</Text>
        <Text numberOfLines={2} style={[styles.message, { color: theme.textSecondary }]}>{notification.message}</Text>
      </View>
      {notification.unread ? <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} /> : <MaterialCommunityIcons color={theme.textMuted} name="chevron-right" size={18} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  markReadButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  summaryCard: { padding: 18, borderRadius: 24, backgroundColor: '#0F1F3D', borderColor: '#0F1F3D' },
  summaryTopRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  summaryCopy: { flex: 1, gap: 4 },
  summaryEyebrow: { color: '#C7D7FE', fontSize: 10, fontWeight: '900', letterSpacing: 0.9 },
  summaryTitle: { color: '#FFFFFF', fontSize: 21, lineHeight: 27, fontWeight: '900' },
  summaryText: { color: '#D9E5FF', fontSize: 12, lineHeight: 18, fontWeight: '600' },
  bellWrap: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.14)' },
  unreadBubble: { position: 'absolute', top: -3, right: -3, minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#0F172A' },
  unreadBubbleText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  section: { gap: 9 },
  sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  notificationList: { gap: 10 },
  notificationCard: { minHeight: 104, borderWidth: 1, borderRadius: 20, padding: 13, flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  categoryIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  notificationCopy: { flex: 1, gap: 3 },
  notificationMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  categoryLabel: { flex: 1, fontSize: 10, fontWeight: '900' },
  time: { fontSize: 11, fontWeight: '700' },
  notificationTitle: { fontSize: 14, lineHeight: 19, fontWeight: '900' },
  message: { fontSize: 12, lineHeight: 17, fontWeight: '500' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 7 },
});
