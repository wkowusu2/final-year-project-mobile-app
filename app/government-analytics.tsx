import { Text } from 'react-native';

import { AppHeader, Card, MiniBarChart, Screen, SectionTitle } from '@/src/components/ui';
import { governmentMetrics, trafficByDay, trafficByHour } from '@/src/data/mock-data';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export default function GovernmentAnalyticsScreen() {
  const theme = useAppTheme();

  return (
    <Screen scrollable>
      <AppHeader title="Government Analytics Portal Preview" subtitle="A mobile executive dashboard for agencies and institutional stakeholders" />
      {governmentMetrics.map((metric) => (
        <Card key={metric.id}>
          <SectionTitle title={metric.label} />
          <Text style={{ color: theme.textPrimary, fontSize: 24, fontWeight: '900' }}>{metric.value}</Text>
          <Text style={{ color: theme.textSecondary, lineHeight: 22 }}>{metric.insight}</Text>
        </Card>
      ))}
      <Card>
        <SectionTitle title="Traffic Growth Trends" />
        <MiniBarChart data={trafficByDay} color={theme.secondary} />
      </Card>
      <Card>
        <SectionTitle title="Peak Hour Analysis" />
        <MiniBarChart data={trafficByHour} />
      </Card>
      <Card>
        <SectionTitle title="Historical Comparisons" />
        <Text style={{ color: theme.textSecondary }}>Month-over-month comparisons show the largest congestion growth in eastern commuter corridors and interchange bottlenecks.</Text>
      </Card>
    </Screen>
  );
}
