import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const permissionItems = [
  {
    id: 'location',
    title: 'Location Access',
    description: 'Required to show your position on the map and collect traffic data along your route.',
    icon: 'map-marker-outline',
    iconBg: '#EEF2FF',
    iconColor: '#5B21F0',
  },
  {
    id: 'background-location',
    title: 'Background Location',
    description: 'Allows passive data collection even when the app is minimized, improving data quality.',
    icon: 'navigation-outline',
    iconBg: '#ECFBF7',
    iconColor: '#14B8A6',
  },
  {
    id: 'activity',
    title: 'Activity Recognition',
    description: "Detects when you're driving vs. walking so we only collect relevant traffic data.",
    icon: 'alpha-a-box-outline',
    iconBg: '#F3E8FF',
    iconColor: '#A855F7',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Sends alerts for incidents, route changes, and important traffic updates.',
    icon: 'bell-outline',
    iconBg: '#FFF7E8',
    iconColor: '#F59E0B',
  },
] as const;

const colors = {
  background: '#FFFFFF',
  heroText: '#1B1D35',
  subtext: '#7C8194',
  label: '#50566B',
  border: '#E4E7F0',
  card: '#FFFFFF',
  accent: '#5B21F0',
  accentPressed: '#4B17D6',
  primaryBar: '#5B21F0',
  secondaryBar: '#5B21F0',
  disabledBar: '#E3E7F2',
  buttonDisabled: '#D2D6E3',
  buttonText: '#FFFFFF',
  chip: '#F4F6FF',
};

export default function PermissionsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const selectedCount = selectedPermissions.length;
  const bars = useMemo(
    () => permissionItems.map((_, index) => index < selectedCount),
    [selectedCount],
  );
  const canContinue = selectedCount > 0;

  function togglePermission(id: string) {
    setSelectedPermissions((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 18 }]}>
      <View style={styles.topIcon}>
        <View style={styles.topIconBase}>
          <View style={[styles.topIconBlend, { backgroundColor: '#5B21F0' }]} />
          <View style={[styles.topIconBlend, styles.topIconBlendRight, { backgroundColor: '#14B8A6' }]} />
          <MaterialCommunityIcons color="#FFFFFF" name="shield-check" size={28} />
        </View>
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.heroText }]}>App Permissions</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>Allow these permissions to get the best TrafficPulse experience</Text>
      </View>

      <View style={styles.progressRow}>
        {bars.map((active, index) => (
          <View
            key={`${index}-${active ? 'on' : 'off'}`}
            style={[styles.progressBar, { backgroundColor: active ? colors.primaryBar : colors.disabledBar }]}
          />
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
                    borderColor: selected ? colors.accent : colors.border,
                    opacity: pressed ? 0.94 : 1,
                  },
                ]}>
                <View style={[styles.permissionIcon, { backgroundColor: item.iconBg }]}>
                  <MaterialCommunityIcons color={item.iconColor} name={item.icon as never} size={20} />
                </View>

                <View style={styles.permissionBody}>
                  <Text style={[styles.permissionTitle, { color: colors.heroText }]}>{item.title}</Text>
                  <Text style={[styles.permissionDescription, { color: colors.subtext }]}>{item.description}</Text>
                </View>

                <View
                  style={[
                    styles.toggle,
                    {
                      borderColor: selected ? colors.accent : colors.border,
                      backgroundColor: selected ? colors.accent : 'transparent',
                    },
                  ]}>
                  {selected ? <MaterialCommunityIcons color="#FFFFFF" name="check" size={14} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          disabled={!canContinue}
          onPress={() => router.replace('/(tabs)/home')}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: !canContinue ? colors.buttonDisabled : pressed ? colors.accentPressed : colors.accent,
            },
          ]}>
          <Text style={styles.primaryButtonText}>Continue</Text>
          <MaterialCommunityIcons color="#FFFFFF" name="chevron-right" size={20} />
        </Pressable>

        <Pressable accessibilityRole="button" onPress={() => router.replace('/(tabs)/home')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 48,
    paddingBottom: 18,
  },
  topIcon: {
    marginBottom: 14,
  },
  topIconBase: {
    width: 42,
    height: 42,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
  },
  topIconBlend: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.95,
  },
  topIconBlendRight: {
    left: '50%',
  },
  header: {
    gap: 8,
    paddingBottom: 18,
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 10,
    borderRadius: 999,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  permissionList: {
    gap: 12,
  },
  permissionCard: {
    minHeight: 104,
    borderWidth: 1,
    borderRadius: 22,
    backgroundColor: colors.card,
    paddingVertical: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  permissionIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  permissionBody: {
    flex: 1,
    gap: 4,
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  permissionDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  toggle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  footer: {
    gap: 14,
    paddingTop: 12,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  primaryButtonText: {
    color: colors.buttonText,
    fontSize: 15,
    fontWeight: '800',
  },
  skipText: {
    color: '#A1A7BC',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
