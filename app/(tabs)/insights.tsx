import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton, AppHeader, Card, MiniBarChart, Screen, SectionTitle } from '@/src/components/ui';
import { heatmapCells, routeComparison, trafficByDay, trafficByHour } from '@/src/data/mock-data';
import { spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export default function InsightsScreen() {
  const theme = useAppTheme();

  return (
    <Screen scrollable>
      <AppHeader title="Traffic Insights Dashboard" subtitle="Analytics for commuters, planners, and operations teams" />
      <View style={styles.actions}>
        <AppButton label="Route Intelligence" onPress={() => router.push('/route-intelligence')} />
        <AppButton label="Government Preview" variant="ghost" onPress={() => router.push('/government-analytics')} />
      </View>
      <Card>
        <SectionTitle title="Traffic by Hour" />
        <MiniBarChart data={trafficByHour} />
      </Card>
      <Card>
        <SectionTitle title="Traffic by Day" />
        <MiniBarChart data={trafficByDay} color={theme.secondary} />
      </Card>
      <Card>
        <SectionTitle title="Congestion Heatmap" action="Open map" />
        <View style={styles.heatmapGrid}>
          {heatmapCells.map((cell) => (
            <View key={cell.label} style={[styles.heatCell, { backgroundColor: `rgba(37, 99, 235, ${Math.max(0.15, cell.value / 100)})` }]}>
              <Text style={styles.heatLabel}>{cell.label}</Text>
              <Text style={styles.heatValue}>{cell.value}%</Text>
            </View>
          ))}
        </View>
      </Card>
      <Card>
        <SectionTitle title="Route Comparison" />
        <MiniBarChart data={routeComparison} color={theme.warning} />
      </Card>
      <AppButton label="Open Full Insights" onPress={() => router.push('/traffic-insights')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  heatCell: {
    width: '30%',
    minHeight: 78,
    borderRadius: 16,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  heatLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  heatValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
});
