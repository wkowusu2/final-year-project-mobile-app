import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/src/constants/design';
import { locationSuggestions, reportIncidentTypes, severityOptions } from '@/src/data/report-data';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export default function ReportIncidentScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [selectedType, setSelectedType] = useState<(typeof reportIncidentTypes)[number]['id']>(reportIncidentTypes[0].id);
  const [description, setDescription] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<(typeof severityOptions)[number]['id']>('medium');
  const location = locationSuggestions[0];
  const canSubmit = description.trim().length > 0 && location.length > 0;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + 22 }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 }]}>
          <MaterialCommunityIcons color={theme.textPrimary} name="chevron-left" size={23} />
        </Pressable>
        <View style={styles.headingBlock}>
          <Text style={[styles.eyebrow, { color: theme.textSecondary }]}>COMMUNITY SAFETY</Text>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Report an incident</Text>
        </View>
      </View>

      <View style={[styles.guidanceCard, { backgroundColor: theme.primarySoft }]}>
        <View style={[styles.guidanceIcon, { backgroundColor: theme.primary }]}>
          <MaterialCommunityIcons color="#FFFFFF" name="shield-check-outline" size={19} />
        </View>
        <Text style={[styles.guidanceText, { color: theme.textPrimary }]}>Share what you can see. Your report helps drivers make safer choices nearby.</Text>
      </View>

      <View>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>What happened?</Text>
          <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>Choose one</Text>
        </View>
        <View style={styles.typeGrid}>
          {reportIncidentTypes.map((item) => {
            const selected = item.id === selectedType;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => setSelectedType(item.id)}
                style={({ pressed }) => [
                  styles.typeCard,
                  {
                    borderColor: selected ? theme.primary : theme.border,
                    backgroundColor: selected ? theme.primarySoft : theme.surface,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}>
                <View style={[styles.typeIcon, { backgroundColor: selected ? '#FFFFFF' : item.iconBg }]}>
                  <MaterialCommunityIcons color={item.iconColor} name={item.icon as never} size={20} />
                </View>
                <Text style={[styles.typeText, { color: selected ? theme.primary : theme.textPrimary }]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Tell us more</Text>
          <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>{description.length}/280</Text>
        </View>
        <View style={[styles.textAreaWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TextInput
            multiline
            maxLength={280}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe what drivers should be aware of..."
            placeholderTextColor={theme.textMuted}
            style={[styles.textArea, { color: theme.textPrimary }]}
            textAlignVertical="top"
          />
        </View>
      </View>

      <View>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>How serious is it?</Text>
          <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>Required</Text>
        </View>
        <View style={styles.severityRow}>
          {severityOptions.map((option) => {
            const selected = option.id === selectedSeverity;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                onPress={() => setSelectedSeverity(option.id)}
                style={({ pressed }) => [
                  styles.severityPill,
                  { borderColor: selected ? option.color : theme.border, backgroundColor: selected ? option.bg : theme.surface, opacity: pressed ? 0.88 : 1 },
                ]}>
                <Text style={[styles.severityText, { color: selected ? option.color : theme.textSecondary }]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Location</Text>
          <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>Auto-detected</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.locationField, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.86 : 1 }]}>
          <View style={styles.locationLeft}>
            <View style={[styles.locationIcon, { backgroundColor: theme.primarySoft }]}>
              <MaterialCommunityIcons color={theme.primary} name="map-marker-outline" size={18} />
            </View>
            <View style={styles.locationCopy}>
              <Text numberOfLines={1} style={[styles.locationTitle, { color: theme.textPrimary }]}>{location}</Text>
              <Text style={[styles.locationSubtitle, { color: theme.textSecondary }]}>GPS location attached to this report</Text>
            </View>
          </View>
          <MaterialCommunityIcons color={theme.textMuted} name="chevron-right" size={20} />
        </Pressable>
      </View>

      <View>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Add a photo</Text>
          <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>Optional</Text>
        </View>
        <View style={styles.photoRow}>
          <Pressable style={({ pressed }) => [styles.photoCard, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.82 : 1 }]} accessibilityRole="button">
            <View style={[styles.photoIcon, { backgroundColor: theme.primarySoft }]}><MaterialCommunityIcons color={theme.primary} name="camera-outline" size={20} /></View>
            <Text style={[styles.photoText, { color: theme.textPrimary }]}>Take photo</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.photoCard, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.82 : 1 }]} accessibilityRole="button">
            <View style={[styles.photoIcon, { backgroundColor: theme.primarySoft }]}><MaterialCommunityIcons color={theme.primary} name="image-outline" size={20} /></View>
            <Text style={[styles.photoText, { color: theme.textPrimary }]}>Choose photo</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={!canSubmit}
        onPress={() => router.push('/incident-details')}
        style={({ pressed }) => [styles.submitButton, { backgroundColor: canSubmit ? theme.primary : '#D2D6E3', opacity: pressed && canSubmit ? 0.9 : 1 }]}>
        <MaterialCommunityIcons color="#FFFFFF" name="send-outline" size={18} />
        <Text style={styles.submitButtonText}>Submit report</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 43, height: 43, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headingBlock: { flex: 1 },
  eyebrow: { fontSize: 10, lineHeight: 14, fontWeight: '900', letterSpacing: 1, marginBottom: 2 },
  title: { fontSize: 25, lineHeight: 31, fontWeight: '800', letterSpacing: -0.5 },
  guidanceCard: { minHeight: 67, padding: 12, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 10 },
  guidanceIcon: { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  guidanceText: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionLabel: { fontSize: 16, fontWeight: '800' },
  sectionHint: { fontSize: 11, fontWeight: '700' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: { width: '48.5%', minHeight: 78, borderWidth: 1, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 11 },
  typeIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  typeText: { flex: 1, fontSize: 12, lineHeight: 16, fontWeight: '700' },
  textAreaWrap: { minHeight: 104, borderWidth: 1, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  textArea: { fontSize: 14, lineHeight: 21, minHeight: 76 },
  severityRow: { flexDirection: 'row', gap: 7 },
  severityPill: { flex: 1, minHeight: 42, paddingHorizontal: 7, paddingVertical: 8, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  severityText: { fontSize: 12, fontWeight: '800' },
  locationField: { minHeight: 66, borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 9 },
  locationLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  locationCopy: { flex: 1 },
  locationTitle: { fontSize: 14, fontWeight: '800' },
  locationSubtitle: { fontSize: 11, lineHeight: 16, marginTop: 1 },
  photoRow: { flexDirection: 'row', gap: 10 },
  photoCard: { flex: 1, minHeight: 92, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 7 },
  photoIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  photoText: { fontSize: 13, fontWeight: '700' },
  submitButton: { minHeight: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
  submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
