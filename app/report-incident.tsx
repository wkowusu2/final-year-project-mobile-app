import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/src/constants/design';
import { reportIncidentTypes, severityOptions } from '@/src/data/report-data';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { api } from '@/src/services/api';
import { DetectedLocation, getDetectedLocation } from '@/src/services/locationService';

export default function ReportIncidentScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [selectedType, setSelectedType] = useState<(typeof reportIncidentTypes)[number]['id']>(reportIncidentTypes[0].id);
  const [description, setDescription] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<(typeof severityOptions)[number]['id']>('medium');
  const [detectedLocation, setDetectedLocation] = useState<DetectedLocation | null>(null);
  const [locating, setLocating] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const canSubmit = description.trim().length > 0 && Boolean(detectedLocation) && !locating && !submitting;
  const incidentType = reportIncidentTypes.find((item) => item.id === selectedType)?.label ?? 'Other Hazard';

  const detectLocation = useCallback(async () => {
    setLocating(true);
    setLocationError(null);
    try {
      setDetectedLocation(await getDetectedLocation());
    } catch (caught) {
      setDetectedLocation(null);
      setLocationError(caught instanceof Error ? caught.message : 'Unable to detect your location.');
    } finally {
      setLocating(false);
    }
  }, []);

  useEffect(() => { void detectLocation(); }, [detectLocation]);

  async function choosePhoto(source: 'camera' | 'library') {
    const permission = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { setSubmitError(`Photo ${source === 'camera' ? 'camera' : 'library'} permission was not granted.`); return; }
    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.75 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.75 });
    if (result.canceled) return;
    const asset = result.assets[0];
    setPhoto({ uri: asset.uri, name: asset.fileName ?? `incident-${Date.now()}.jpg`, type: asset.mimeType ?? 'image/jpeg' });
    setSubmitError(null);
  }

  async function submitReport() {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (!detectedLocation) throw new Error('Your location is still being detected.');
      const response = await api.createIncident({
        type: incidentType,
        description: description.trim(),
        severity: selectedSeverity,
        roadName: detectedLocation.roadName,
        city: detectedLocation.city,
        latitude: detectedLocation.latitude,
        longitude: detectedLocation.longitude,
        photo: photo ?? undefined,
      });
      if (!response.success) throw new Error(response.error ?? 'Unable to submit your report.');
      router.replace('/(tabs)/home');
    } catch (caught) {
      setSubmitError(caught instanceof Error ? caught.message : 'Unable to submit your report.');
    } finally {
      setSubmitting(false);
    }
  }

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
          <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>{locating ? 'Detecting...' : 'Auto-detected'}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => void detectLocation()}
          style={({ pressed }) => [styles.locationField, { backgroundColor: theme.surface, borderColor: locationError ? theme.danger : theme.border, opacity: pressed ? 0.86 : 1 }]}>
          <View style={styles.locationLeft}>
            <View style={[styles.locationIcon, { backgroundColor: theme.primarySoft }]}>
              <MaterialCommunityIcons color={theme.primary} name="map-marker-outline" size={18} />
            </View>
            <View style={styles.locationCopy}>
              <Text numberOfLines={1} style={[styles.locationTitle, { color: theme.textPrimary }]}>{locating ? 'Finding your location...' : detectedLocation?.label ?? 'Location unavailable'}</Text>
              <Text style={[styles.locationSubtitle, { color: locationError ? theme.danger : theme.textSecondary }]}>{locationError ?? (detectedLocation ? 'GPS location attached to this report' : 'Tap to try again')}</Text>
            </View>
          </View>
          {locating ? <ActivityIndicator color={theme.primary} size="small" /> : <MaterialCommunityIcons color={theme.textMuted} name="refresh" size={20} />}
        </Pressable>
      </View>

      <View>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: theme.textPrimary }]}>Add a photo</Text>
          <Text style={[styles.sectionHint, { color: theme.textSecondary }]}>Optional</Text>
        </View>
        <View style={styles.photoRow}>
          <Pressable onPress={() => void choosePhoto('camera')} style={({ pressed }) => [styles.photoCard, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.82 : 1 }]} accessibilityRole="button">
            <View style={[styles.photoIcon, { backgroundColor: theme.primarySoft }]}><MaterialCommunityIcons color={theme.primary} name="camera-outline" size={20} /></View>
            <Text style={[styles.photoText, { color: theme.textPrimary }]}>Take photo</Text>
          </Pressable>
          <Pressable onPress={() => void choosePhoto('library')} style={({ pressed }) => [styles.photoCard, { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.82 : 1 }]} accessibilityRole="button">
            <View style={[styles.photoIcon, { backgroundColor: theme.primarySoft }]}><MaterialCommunityIcons color={theme.primary} name="image-outline" size={20} /></View>
            <Text style={[styles.photoText, { color: theme.textPrimary }]}>Choose photo</Text>
          </Pressable>
        </View>
        {photo && <View style={styles.previewRow}><Image source={{ uri: photo.uri }} style={styles.previewImage} /><Text numberOfLines={1} style={[styles.previewText, { color: theme.textSecondary }]}>{photo.name}</Text><Pressable accessibilityRole="button" onPress={() => setPhoto(null)}><MaterialCommunityIcons color={theme.danger} name="close-circle-outline" size={21} /></Pressable></View>}
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={!canSubmit}
        onPress={() => void submitReport()}
        style={({ pressed }) => [styles.submitButton, { backgroundColor: canSubmit ? theme.primary : '#D2D6E3', opacity: pressed && canSubmit ? 0.9 : 1 }]}>
        <MaterialCommunityIcons color="#FFFFFF" name="send-outline" size={18} />
        <Text style={styles.submitButtonText}>{submitting ? 'Submitting report...' : 'Submit report'}</Text>
      </Pressable>
      {submitError && <Text style={[styles.submitError, { color: theme.danger }]}>{submitError}</Text>}
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
  submitError: { fontSize: 12, lineHeight: 17, fontWeight: '600', textAlign: 'center', marginTop: -10 },
  previewRow: { minHeight: 54, borderRadius: 14, padding: 7, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#F4F0FF' },
  previewImage: { width: 40, height: 40, borderRadius: 10 },
  previewText: { flex: 1, fontSize: 12, fontWeight: '600' },
});
