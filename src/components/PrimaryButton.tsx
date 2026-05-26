import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { Colors } from '@/src/constants/colors';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
};

export function PrimaryButton({ title, onPress, disabled, loading, variant = 'primary' }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        (pressed || disabled || loading) && styles.dimmed,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.card} />
      ) : (
        <Text style={[styles.text, variant === 'outline' && styles.outlineText]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.secondary },
  danger: { backgroundColor: Colors.danger },
  outline: { backgroundColor: Colors.card, borderColor: Colors.border, borderWidth: 1 },
  dimmed: { opacity: 0.72 },
  text: { color: Colors.card, fontSize: 16, fontWeight: '700' },
  outlineText: { color: Colors.primary },
});
