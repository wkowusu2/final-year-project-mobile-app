import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Colors } from '@/src/constants/colors';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>RP</Text>
        </View>
        <Text style={styles.title}>RoadPulse Ghana</Text>
        <Text style={styles.description}>
          Help monitor urban traffic through crowdsourced GPS data.
        </Text>
      </View>
      <PrimaryButton title="Get Started" onPress={() => router.push('/register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 40,
    backgroundColor: Colors.background,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  logo: {
    width: 82,
    height: 82,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  logoText: {
    color: Colors.card,
    fontSize: 28,
    fontWeight: '900',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 17,
    lineHeight: 25,
    textAlign: 'center',
  },
});
