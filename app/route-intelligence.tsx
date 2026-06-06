import { Text } from 'react-native';

import { AppHeader, Card, Screen, SectionTitle } from '@/src/components/ui';
import { routeInsights } from '@/src/data/mock-data';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export default function RouteIntelligenceScreen() {
  const theme = useAppTheme();

  return (
    <Screen scrollable>
      <AppHeader title="Route Intelligence" subtitle="Search roads and compare typical traffic behavior over time" />
      {routeInsights.map((route) => (
        <Card key={route.id}>
          <SectionTitle title={route.name} />
          <Text style={{ color: theme.textSecondary }}>Typical traffic: {route.typicalTraffic}</Text>
          <Text style={{ color: theme.textSecondary }}>Average speed: {route.averageSpeed}</Text>
          <Text style={{ color: theme.textSecondary }}>Peak congestion: {route.peakTimes}</Text>
          <Text style={{ color: theme.textSecondary }}>Best travel time: {route.bestTravelTime}</Text>
        </Card>
      ))}
    </Screen>
  );
}
