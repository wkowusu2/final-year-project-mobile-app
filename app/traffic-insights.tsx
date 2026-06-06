import { Text } from 'react-native';

import { AppHeader, Card, MiniBarChart, Screen, SectionTitle } from '@/src/components/ui';
import { routeComparison, trafficByDay, trafficByHour } from '@/src/data/mock-data';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export default function TrafficInsightsScreen() {
  const theme = useAppTheme();

  return (
    <Screen scrollable>
      <AppHeader title="Traffic Insights Dashboard" subtitle="Most congested routes, fastest corridors, peak hours, and weekly trends" />
      <Card>
        <SectionTitle title="Most Congested Routes" />
        <Text style={{ color: theme.textSecondary }}>Spintex Road, Graphic Road, Ring Road Central, and Kaneshie First Light remain the top recurring delay corridors.</Text>
      </Card>
      <Card>
        <SectionTitle title="Fastest Routes" />
        <Text style={{ color: theme.textSecondary }}>Independence Avenue and selected sections of Liberation Road remain the most reliable off-peak connectors.</Text>
      </Card>
      <Card>
        <SectionTitle title="Peak Traffic Hours" />
        <MiniBarChart data={trafficByHour} />
      </Card>
      <Card>
        <SectionTitle title="Weekly Trends" />
        <MiniBarChart data={trafficByDay} color={theme.secondary} />
      </Card>
      <Card>
        <SectionTitle title="Route Comparison" />
        <MiniBarChart data={routeComparison} color={theme.warning} />
      </Card>
    </Screen>
  );
}
