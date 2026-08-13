import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppHeader, Card, Screen } from '@/src/components/ui';
import { spacing } from '@/src/constants/design';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { api } from '@/src/services/api';
import { geocodeDestination, getCurrentMapLocation } from '@/src/services/locationService';
import { RouteAlternative } from '@/src/types/routes';

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes} min`;
}

function formatDistance(meters: number) {
  return `${(meters / 1000).toFixed(meters < 10_000 ? 1 : 0)} km`;
}

export default function RouteIntelligenceScreen() {
  const theme = useAppTheme();
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<RouteAlternative[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findRoutes = async () => {
    if (!destination.trim()) { setError('Enter a destination to compare routes.'); return; }
    setLoading(true); setError(null);
    try {
      const [origin, resolvedDestination] = await Promise.all([getCurrentMapLocation(), geocodeDestination(`${destination.trim()}, Ghana`)]);
      const response = await api.getRouteIntelligence(origin, resolvedDestination);
      if (!response.success || !response.data) throw new Error(response.error ?? 'Unable to calculate routes.');
      setRoutes(response.data.routes);
    } catch (caught) {
      setRoutes([]);
      setError(caught instanceof Error ? caught.message : 'Unable to calculate routes.');
    } finally { setLoading(false); }
  };

  return <Screen scrollable>
    <AppHeader title="Route Intelligence" subtitle="Compare route alternatives using current matched-road traffic." />
    <Card style={[styles.searchCard, { borderColor: theme.border }]}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>WHERE ARE YOU GOING?</Text>
      <View style={[styles.destinationInput, { backgroundColor: theme.backgroundMuted, borderColor: theme.border }]}>
        <MaterialCommunityIcons name="map-marker-outline" color={theme.primary} size={20} />
        <TextInput value={destination} onChangeText={setDestination} placeholder="e.g. KNUST, Kumasi" placeholderTextColor={theme.textMuted} style={[styles.input, { color: theme.textPrimary }]} returnKeyType="search" onSubmitEditing={() => void findRoutes()} />
      </View>
      <Pressable accessibilityRole="button" onPress={() => void findRoutes()} style={({ pressed }) => [styles.searchButton, { backgroundColor: theme.primary, opacity: pressed || loading ? 0.8 : 1 }]}>
        {loading ? <ActivityIndicator color="#fff" /> : <><MaterialCommunityIcons name="directions" color="#fff" size={19} /><Text style={styles.searchButtonText}>Compare routes</Text></>}
      </Pressable>
    </Card>
    {error && <Card style={[styles.messageCard, { borderColor: theme.danger, backgroundColor: theme.dangerSoft }]}><Text style={[styles.messageText, { color: theme.danger }]}>{error}</Text></Card>}
    {!loading && !error && routes.length === 0 && <Card style={styles.messageCard}><Text style={[styles.messageText, { color: theme.textSecondary }]}>Enter a destination to see route alternatives, live traffic evidence, and incident impacts.</Text></Card>}
    {routes.map((route, index) => <RouteCard key={route.id} route={route} recommended={index === 0} />)}
  </Screen>;
}

function RouteCard({ route, recommended }: { route: RouteAlternative; recommended: boolean }) {
  const theme = useAppTheme();
  const trafficColor = route.trafficLevel === 'free' ? theme.success : route.trafficLevel === 'moderate' ? theme.warning : route.trafficLevel === 'heavy' || route.trafficLevel === 'severe' ? theme.danger : theme.textSecondary;
  const extraMinutes = Math.max(0, Math.round((route.estimatedDurationSeconds - route.baseDurationSeconds) / 60));
  return <Card style={[styles.routeCard, recommended && { borderColor: theme.primary, backgroundColor: theme.primarySoft }]}>
    <View style={styles.routeHeader}><View><Text style={[styles.routeTitle, { color: theme.textPrimary }]}>{recommended ? 'Recommended route' : 'Alternative route'}</Text><Text style={[styles.routeMeta, { color: theme.textSecondary }]}>{formatDistance(route.distanceMeters)} · {route.matchedRoadCount} roads with live samples</Text></View>{recommended && <View style={[styles.recommendedBadge, { backgroundColor: theme.primary }]}><Text style={styles.recommendedText}>BEST NOW</Text></View>}</View>
    <View style={styles.etaRow}><Text style={[styles.eta, { color: theme.textPrimary }]}>{formatDuration(route.estimatedDurationSeconds)}</Text><View style={[styles.trafficBadge, { backgroundColor: `${trafficColor}22` }]}><View style={[styles.trafficDot, { backgroundColor: trafficColor }]} /><Text style={[styles.trafficText, { color: trafficColor }]}>{route.trafficLevel === 'unknown' ? 'Limited live data' : `${route.trafficLevel} traffic`}</Text></View></View>
    <Text style={[styles.routeExplanation, { color: theme.textSecondary }]}>{route.medianSpeedKph == null ? 'No recent matched-speed samples on this route. ETA uses the routing baseline.' : `${Math.round(route.medianSpeedKph)} km/h median speed from ${route.trafficSampleCount} recent matched points${extraMinutes ? ` · about ${extraMinutes} min slower than baseline` : ''}.`}</Text>
    {route.incidents.length > 0 && <View style={[styles.incidentNotice, { borderColor: theme.warning, backgroundColor: theme.warningSoft }]}><MaterialCommunityIcons name="alert-outline" color={theme.warning} size={17} /><Text style={[styles.incidentText, { color: theme.textPrimary }]}>{route.incidents.length} active incident{route.incidents.length > 1 ? 's' : ''} near this route</Text></View>}
  </Card>;
}

const styles = StyleSheet.create({
  searchCard: { gap: spacing.sm }, label: { fontSize: 10, fontWeight: '800', letterSpacing: 1 }, destinationInput: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: 12, paddingHorizontal: spacing.sm }, input: { flex: 1, minHeight: 48, fontSize: 15 }, searchButton: { minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }, searchButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' }, messageCard: { padding: spacing.md }, messageText: { fontSize: 13, lineHeight: 20 }, routeCard: { gap: spacing.sm }, routeHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }, routeTitle: { fontSize: 16, fontWeight: '800' }, routeMeta: { fontSize: 12, marginTop: 3 }, recommendedBadge: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 5, alignSelf: 'flex-start' }, recommendedText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: .5 }, etaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, eta: { fontSize: 28, fontWeight: '900', letterSpacing: -1 }, trafficBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, paddingHorizontal: 9, paddingVertical: 6 }, trafficDot: { width: 7, height: 7, borderRadius: 99 }, trafficText: { fontSize: 11, fontWeight: '800', textTransform: 'capitalize' }, routeExplanation: { fontSize: 13, lineHeight: 19 }, incidentNotice: { borderWidth: 1, borderRadius: 10, padding: 9, flexDirection: 'row', gap: 7, alignItems: 'center' }, incidentText: { fontSize: 12, fontWeight: '700' },
});
