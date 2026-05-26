import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/src/constants/colors';

export function InfoCard({
  title,
  value,
  children,
}: {
  title?: string;
  value?: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  value: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
});
