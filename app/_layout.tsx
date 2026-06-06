import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useAppTheme } from '@/src/hooks/useAppTheme';

export default function RootLayout() {
  const theme = useAppTheme();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="active-tracking" />
        <Stack.Screen name="report-incident" />
        <Stack.Screen name="incident-details" />
        <Stack.Screen name="my-reports" />
        <Stack.Screen name="route-intelligence" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="rewards" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="traffic-heatmap" />
        <Stack.Screen name="traffic-insights" />
        <Stack.Screen name="government-analytics" />
      </Stack>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
