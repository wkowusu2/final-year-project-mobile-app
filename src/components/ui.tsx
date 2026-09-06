import { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, shadows, spacing, typography } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export function Screen({ children, scrollable = false, style }: PropsWithChildren<{ scrollable?: boolean; style?: StyleProp<ViewStyle> }>) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const safeAreaStyle = {
    paddingTop: insets.top + spacing.xl,
    paddingBottom: insets.bottom + spacing.xxxl,
  };

  if (scrollable) {
    return (
      <ScrollView
        contentContainerStyle={[
          styles.screen,
          { backgroundColor: theme.background },
          style,
          safeAreaStyle,
        ]}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    );
  }

  return <View style={[styles.screen, { backgroundColor: theme.background }, style, safeAreaStyle]}>{children}</View>;
}

export function AppHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  const theme = useAppTheme();

  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{title}</Text>
        {subtitle ? <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
        shadows.card,
        style,
      ]}>
      {children}
    </View>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: string }) {
  const theme = useAppTheme();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
      {action ? <Text style={[styles.sectionAction, { color: theme.primary }]}>{action}</Text> : null}
    </View>
  );
}

export function AppButton({
  label,
  variant = 'primary',
  onPress,
  loading,
  style,
}: {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  onPress?: () => void;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useAppTheme();

  const variantStyle = {
    primary: { backgroundColor: theme.primary, borderColor: theme.primary, color: theme.textOnPrimary },
    secondary: { backgroundColor: theme.secondary, borderColor: theme.secondary, color: theme.textOnPrimary },
    ghost: { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary },
    danger: { backgroundColor: theme.danger, borderColor: theme.danger, color: theme.textOnPrimary },
    outline: { backgroundColor: 'transparent', borderColor: theme.borderStrong, color: theme.textPrimary },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          opacity: pressed ? 0.78 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variantStyle.color} />
      ) : (
        <Text style={[styles.buttonText, { color: variantStyle.color }]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function AppInput({
  label,
  placeholder,
  value,
  secureTextEntry,
}: {
  label: string;
  placeholder: string;
  value?: string;
  secureTextEntry?: boolean;
}) {
  const theme = useAppTheme();

  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>{label}</Text>
      <TextInput
        defaultValue={value}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        secureTextEntry={secureTextEntry}
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.textPrimary,
          },
        ]}
      />
    </View>
  );
}

export function Chip({
  label,
  tone = 'default',
  style,
}: {
  label: string;
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useAppTheme();
  const chipTone = {
    default: { backgroundColor: theme.backgroundMuted, color: theme.textSecondary },
    primary: { backgroundColor: theme.primarySoft, color: theme.primary },
    success: { backgroundColor: theme.successSoft, color: theme.success },
    warning: { backgroundColor: theme.warningSoft, color: theme.warning },
    danger: { backgroundColor: theme.dangerSoft, color: theme.danger },
  }[tone];

  return (
    <View style={[styles.chip, { backgroundColor: chipTone.backgroundColor }, style]}>
      <Text style={[styles.chipText, { color: chipTone.color }]}>{label}</Text>
    </View>
  );
}

export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  const theme = useAppTheme();
  return (
    <Card style={styles.metricCard}>
      <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{value}</Text>
      {detail ? <Text style={[styles.metricDetail, { color: theme.primary }]}>{detail}</Text> : null}
    </Card>
  );
}

export function ListRow({
  title,
  subtitle,
  right,
  style,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useAppTheme();
  return (
    <Card style={[styles.listRow, style]}>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={[styles.listTitle, { color: theme.textPrimary }]}>{title}</Text>
        {subtitle ? <Text style={[styles.listSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </Card>
  );
}

export function MiniBarChart({ data, color }: { data: { label: string; value: number; highlight?: boolean }[]; color?: string }) {
  const theme = useAppTheme();
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <View style={styles.chartWrap}>
      {data.map((item) => {
        const height = Math.max(18, (item.value / max) * 110);
        const barColor = item.highlight ? theme.primary : color ?? theme.secondary;
        return (
          <View key={item.label} style={styles.chartItem}>
            <View style={[styles.chartBar, { height, backgroundColor: barColor }]} />
            <Text style={[styles.chartLabel, { color: theme.textSecondary }]}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  const theme = useAppTheme();
  return (
    <Card style={styles.emptyState}>
      <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>{description}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.title1,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: typography.body,
    lineHeight: 22,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.title3,
    fontWeight: '800',
  },
  sectionAction: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  button: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonText: {
    fontSize: typography.bodyLarge,
    fontWeight: '800',
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  input: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: typography.bodyLarge,
  },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: typography.caption,
    fontWeight: '800',
  },
  metricCard: {
    flex: 1,
    minWidth: 150,
  },
  metricLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: typography.title2,
    fontWeight: '800',
  },
  metricDetail: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: typography.bodyLarge,
    fontWeight: '800',
  },
  listSubtitle: {
    fontSize: typography.body,
    lineHeight: 21,
  },
  chartWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: 136,
  },
  chartItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  chartBar: {
    width: '100%',
    maxWidth: 22,
    borderRadius: radius.round,
  },
  chartLabel: {
    fontSize: typography.micro,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: typography.title3,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: typography.body,
    lineHeight: 22,
    textAlign: 'center',
  },
});

export const textStyles = StyleSheet.create({
  hero: { fontSize: typography.hero, fontWeight: '900' } as TextStyle,
  title: { fontSize: typography.title2, fontWeight: '800' } as TextStyle,
  body: { fontSize: typography.body, lineHeight: 22 } as TextStyle,
});
