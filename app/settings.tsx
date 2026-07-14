import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/src/hooks/useAppTheme';

type PreferenceRowProps = {
  icon: string;
  iconBackground: string;
  iconColor: string;
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

function PreferenceRow({ icon, iconBackground, iconColor, title, description, value, onChange }: PreferenceRowProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.preferenceRow}>
      <View style={[styles.preferenceIcon, { backgroundColor: iconBackground }]}><MaterialCommunityIcons color={iconColor} name={icon as never} size={20} /></View>
      <View style={styles.preferenceCopy}>
        <Text style={[styles.preferenceTitle, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.preferenceDescription, { color: theme.textSecondary }]}>{description}</Text>
      </View>
      <Switch
        accessibilityLabel={title}
        onValueChange={onChange}
        thumbColor="#FFFFFF"
        trackColor={{ false: theme.borderStrong, true: theme.primary }}
        value={value}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [anonymousSharing, setAnonymousSharing] = useState(true);
  const [autoStart, setAutoStart] = useState(false);
  const [trafficAlerts, setTrafficAlerts] = useState(true);
  const [incidentAlerts, setIncidentAlerts] = useState(true);

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
          <Text style={[styles.eyebrow, { color: theme.textSecondary }]}>PREFERENCES</Text>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>
        </View>
      </View>

      <View style={[styles.infoCard, { backgroundColor: theme.primarySoft }]}>
        <View style={[styles.infoIcon, { backgroundColor: theme.primary }]}><MaterialCommunityIcons color="#FFFFFF" name="tune-variant" size={19} /></View>
        <Text style={[styles.infoText, { color: theme.textPrimary }]}>Set RoadPulse up for the way you drive. You can change these preferences anytime.</Text>
      </View>

      <SettingsGroup title="Privacy and data" description="Control how your driving data is used.">
        <PreferenceRow icon="shield-check-outline" iconBackground={theme.primarySoft} iconColor={theme.primary} title="Anonymous data sharing" description="Help improve traffic without sharing your identity." value={anonymousSharing} onChange={setAnonymousSharing} />
      </SettingsGroup>

      <SettingsGroup title="Tracking" description="Choose when RoadPulse collects trip data.">
        <PreferenceRow icon="navigation-variant-outline" iconBackground={theme.secondarySoft} iconColor={theme.secondary} title="Auto-start tracking" description="Start tracking when a drive is detected." value={autoStart} onChange={setAutoStart} />
        <View style={[styles.noticeRow, { backgroundColor: theme.backgroundMuted }]}>
          <MaterialCommunityIcons color={theme.textSecondary} name="information-outline" size={16} />
          <Text style={[styles.noticeText, { color: theme.textSecondary }]}>Location is collected only while tracking is active.</Text>
        </View>
      </SettingsGroup>

      <SettingsGroup title="Notifications" description="Stay informed about conditions around you.">
        <PreferenceRow icon="car-multiple" iconBackground="#FFF6D9" iconColor="#B77908" title="Traffic alerts" description="Congestion and route changes near you." value={trafficAlerts} onChange={setTrafficAlerts} />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <PreferenceRow icon="alert-outline" iconBackground="#FFF0F1" iconColor="#D84045" title="Incident alerts" description="New hazards and verified reports nearby." value={incidentAlerts} onChange={setIncidentAlerts} />
      </SettingsGroup>

      <SettingsGroup title="App preferences" description="Appearance and language settings.">
        <Pressable accessibilityRole="button" style={({ pressed }) => [styles.linkRow, { opacity: pressed ? 0.8 : 1 }]}>
          <View style={[styles.preferenceIcon, { backgroundColor: theme.primarySoft }]}><MaterialCommunityIcons color={theme.primary} name="theme-light-dark" size={20} /></View>
          <View style={styles.preferenceCopy}>
            <Text style={[styles.preferenceTitle, { color: theme.textPrimary }]}>Appearance</Text>
            <Text style={[styles.preferenceDescription, { color: theme.textSecondary }]}>Following your device theme</Text>
          </View>
          <Text style={[styles.linkValue, { color: theme.textSecondary }]}>System</Text>
          <MaterialCommunityIcons color={theme.textMuted} name="chevron-right" size={20} />
        </Pressable>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <Pressable accessibilityRole="button" style={({ pressed }) => [styles.linkRow, { opacity: pressed ? 0.8 : 1 }]}>
          <View style={[styles.preferenceIcon, { backgroundColor: '#E4F8F5' }]}><MaterialCommunityIcons color="#078B7C" name="translate" size={20} /></View>
          <View style={styles.preferenceCopy}>
            <Text style={[styles.preferenceTitle, { color: theme.textPrimary }]}>Language</Text>
            <Text style={[styles.preferenceDescription, { color: theme.textSecondary }]}>Choose the language used in the app</Text>
          </View>
          <Text style={[styles.linkValue, { color: theme.textSecondary }]}>English</Text>
          <MaterialCommunityIcons color={theme.textMuted} name="chevron-right" size={20} />
        </Pressable>
      </SettingsGroup>

      <Text style={[styles.footer, { color: theme.textMuted }]}>RoadPulse Ghana · Version 1.0.0</Text>
    </ScrollView>
  );
}

function SettingsGroup({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  const theme = useAppTheme();
  return (
    <View>
      <View style={styles.groupHeading}>
        <Text style={[styles.groupTitle, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.groupDescription, { color: theme.textSecondary }]}>{description}</Text>
      </View>
      <View style={[styles.groupCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>{children}</View>
    </View>
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
  infoCard: { minHeight: 67, borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoIcon: { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  infoText: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: '600' },
  groupHeading: { gap: 2, marginBottom: 9 },
  groupTitle: { fontSize: 17, lineHeight: 22, fontWeight: '800', letterSpacing: -0.2 },
  groupDescription: { fontSize: 12, lineHeight: 17, fontWeight: '500' },
  groupCard: { borderWidth: 1, borderRadius: 20, padding: 13 },
  preferenceRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10 },
  preferenceIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  preferenceCopy: { flex: 1 },
  preferenceTitle: { fontSize: 14, lineHeight: 19, fontWeight: '800' },
  preferenceDescription: { fontSize: 11, lineHeight: 16, fontWeight: '500', marginTop: 1 },
  noticeRow: { marginTop: 10, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 7 },
  noticeText: { flex: 1, fontSize: 11, lineHeight: 16, fontWeight: '600' },
  divider: { height: 1, marginVertical: 9 },
  linkRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10 },
  linkValue: { fontSize: 12, fontWeight: '600' },
  footer: { fontSize: 11, fontWeight: '500', textAlign: 'center', marginTop: 1 },
});
