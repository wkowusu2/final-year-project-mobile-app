import { StyleSheet, Text, View } from 'react-native';

import { AppButton, AppHeader, AppInput, Card, Chip, Screen } from '@/src/components/ui';
import { spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

const types = ['Accident', 'Road Construction', 'Flooding', 'Broken Traffic Light', 'Road Closure', 'Vehicle Breakdown', 'Police Checkpoint', 'Other Hazard'];

export default function ReportIncidentScreen() {
  const theme = useAppTheme();

  return (
    <Screen scrollable>
      <AppHeader title="Report Traffic Incident" subtitle="Share ground truth to improve route choices for the whole city" />
      <Card>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Incident Type</Text>
        <View style={styles.chips}>
          {types.map((type, index) => (
            <Chip key={type} label={type} tone={index === 0 ? 'danger' : 'default'} />
          ))}
        </View>
      </Card>
      <Card>
        <AppInput label="Description" placeholder="Describe what is happening on the road" />
        <AppInput label="Severity" placeholder="Low, Medium, or High" />
        <AppInput label="Location" placeholder="Search or confirm road location" />
      </Card>
      <View style={styles.actions}>
        <AppButton label="Take Photo" variant="ghost" />
        <AppButton label="Upload Photo" variant="outline" />
      </View>
      <AppButton label="Submit Report" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '800' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
