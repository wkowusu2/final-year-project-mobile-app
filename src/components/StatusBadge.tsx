import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/src/constants/colors';

type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

const toneColors: Record<Tone, { bg: string; fg: string }> = {
  success: { bg: '#DCFCE7', fg: Colors.success },
  warning: { bg: '#FEF3C7', fg: '#B45309' },
  danger: { bg: '#FEE2E2', fg: Colors.danger },
  neutral: { bg: Colors.muted, fg: Colors.textSecondary },
  info: { bg: '#DBEAFE', fg: Colors.secondary },
};

export function StatusBadge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const color = toneColors[tone];

  return (
    <View style={[styles.badge, { backgroundColor: color.bg }]}>
      <Text style={[styles.text, { color: color.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
  },
});
