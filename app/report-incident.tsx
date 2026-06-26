import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/src/hooks/useAppTheme';
import { locationSuggestions, reportIncidentTypes, severityOptions } from '@/src/data/report-data';
import { spacing } from '@/src/constants/design';

export default function ReportIncidentScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [selectedType, setSelectedType] = useState(reportIncidentTypes[0].id);
  const [description, setDescription] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<(typeof severityOptions)[number]['id']>('medium');
  const location = locationSuggestions[0];

  const canSubmit = description.trim().length > 0 && location.length > 0 && selectedType.length > 0;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + 18 }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <Pressable style={styles.backButton} accessibilityRole="button" onPress={() => router.back()}>
          <MaterialCommunityIcons color="#1B1D35" name="chevron-left" size={24} />
        </Pressable>
        <View style={styles.headingBlock}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Report Incident</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Help others stay safe</Text>
        </View>
      </View>

      <View>
        <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Incident Type</Text>
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
                    backgroundColor: selected ? '#F7F3FF' : theme.surface,
                    opacity: pressed ? 0.95 : 1,
                  },
                ]}>
                <View style={[styles.typeIcon, { backgroundColor: item.iconBg }]}>
                  <MaterialCommunityIcons color={item.iconColor} name={item.icon as never} size={20} />
                </View>
                <Text style={[styles.typeText, { color: theme.textPrimary }]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.fieldSection}>
        <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Description</Text>
        <View style={[styles.textAreaWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TextInput
            multiline
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the incident in detail..."
            placeholderTextColor={theme.textMuted}
            style={[styles.textArea, { color: theme.textPrimary }]}
            textAlignVertical="top"
          />
        </View>
      </View>

      <View>
        <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Severity</Text>
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
                  {
                    borderColor: selected ? option.color : theme.border,
                    backgroundColor: selected ? option.bg : theme.surface,
                    opacity: pressed ? 0.95 : 1,
                  },
                ]}>
                <Text style={[styles.severityText, { color: selected ? option.color : theme.textSecondary }]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Location</Text>
        <Pressable style={[styles.locationField, { backgroundColor: theme.surface, borderColor: theme.border }]} accessibilityRole="button">
          <View style={styles.locationLeft}>
            <MaterialCommunityIcons color={theme.primary} name="map-marker-outline" size={18} />
            <View>
              <Text style={[styles.locationTitle, { color: theme.textPrimary }]}>{location}</Text>
              <Text style={[styles.locationSubtitle, { color: theme.textSecondary }]}>Mandaluyong City · Auto-detected</Text>
            </View>
          </View>
          <MaterialCommunityIcons color={theme.textSecondary} name="chevron-down" size={20} />
        </Pressable>
      </View>

      <View>
        <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Photos (Optional)</Text>
        <View style={styles.photoRow}>
          <Pressable style={[styles.photoCard, { backgroundColor: theme.surface, borderColor: theme.border }]} accessibilityRole="button">
            <MaterialCommunityIcons color={theme.primary} name="camera-outline" size={22} />
            <Text style={[styles.photoText, { color: theme.textSecondary }]}>Take Photo</Text>
          </Pressable>
          <Pressable style={[styles.photoCard, { backgroundColor: theme.surface, borderColor: theme.border }]} accessibilityRole="button">
            <MaterialCommunityIcons color={theme.primary} name="image-outline" size={22} />
            <Text style={[styles.photoText, { color: theme.textSecondary }]}>Upload Photo</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={!canSubmit}
        onPress={() => router.push('/incident-details')}
        style={({ pressed }) => [
          styles.submitButton,
          {
            backgroundColor: canSubmit ? theme.primary : '#D2D6E3',
            opacity: pressed && canSubmit ? 0.95 : 1,
          },
        ]}>
        <Text style={styles.submitButtonText}>Submit Report</Text>
      </Pressable>

      <View style={{ height: 8 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: '#F1F3F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingBlock: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeCard: {
    width: '23%',
    minHeight: 70,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 6,
  },
  typeIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeText: {
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  fieldSection: {
    gap: 0,
  },
  textAreaWrap: {
    minHeight: 68,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textArea: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 42,
  },
  severityRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  severityPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  severityText: {
    fontSize: 13,
    fontWeight: '700',
  },
  locationField: {
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  locationLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  locationSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoCard: {
    flex: 1,
    minHeight: 76,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photoText: {
    fontSize: 12,
    fontWeight: '700',
  },
  submitButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
