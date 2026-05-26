import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Colors } from '@/src/constants/colors';
import { storageService } from '@/src/services/storageService';

export default function IndexScreen() {
  const [route, setRoute] = useState<'welcome' | 'home' | null>(null);

  useEffect(() => {
    storageService.getDriver().then((driver) => setRoute(driver ? 'home' : 'welcome'));
  }, []);

  if (route === 'home') {
    return <Redirect href="/home" />;
  }

  if (route === 'welcome') {
    return <Redirect href="/welcome" />;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
