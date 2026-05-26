import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Colors } from '@/src/constants/colors';
import { api } from '@/src/services/api';
import { storageService } from '@/src/services/storageService';
import { VehicleType } from '@/src/types/driver';

const vehicleTypes: VehicleType[] = ['Car', 'Taxi', 'Trotro', 'Bus', 'Motorcycle', 'Truck'];

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Car');
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!fullName.trim() || !phoneNumber.trim()) {
      Alert.alert('Missing details', 'Full name and phone number are required.');
      return;
    }

    setLoading(true);

    try {
      const driver = await api.registerDriver({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        vehicleType,
        vehiclePlateNumber: vehiclePlateNumber.trim() || undefined,
      });
      await storageService.saveDriver(driver);
      router.replace('/permissions');
    } catch (error) {
      Alert.alert('Registration failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboard}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Create driver profile</Text>
        <Text style={styles.copy}>
          This profile identifies your GPS contributions for traffic analysis only.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={setFullName}
            placeholder="Enter full name"
            placeholderTextColor={Colors.textSecondary}
            style={styles.input}
            value={fullName}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone number</Text>
          <TextInput
            keyboardType="phone-pad"
            onChangeText={setPhoneNumber}
            placeholder="Enter phone number"
            placeholderTextColor={Colors.textSecondary}
            style={styles.input}
            value={phoneNumber}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Vehicle type</Text>
          <View style={styles.chips}>
            {vehicleTypes.map((type) => (
              <Pressable
                key={type}
                onPress={() => setVehicleType(type)}
                style={[styles.chip, vehicleType === type && styles.chipSelected]}>
                <Text style={[styles.chipText, vehicleType === type && styles.chipTextSelected]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Vehicle plate number</Text>
          <TextInput
            autoCapitalize="characters"
            onChangeText={setVehiclePlateNumber}
            placeholder="Optional"
            placeholderTextColor={Colors.textSecondary}
            style={styles.input}
            value={vehiclePlateNumber}
          />
        </View>

        <PrimaryButton title="Register" loading={loading} onPress={handleRegister} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 20, gap: 18 },
  heading: { color: Colors.textPrimary, fontSize: 28, fontWeight: '900' },
  copy: { color: Colors.textSecondary, fontSize: 15, lineHeight: 22 },
  field: { gap: 8 },
  label: { color: Colors.textPrimary, fontSize: 14, fontWeight: '800' },
  input: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    borderRadius: 999,
    borderColor: Colors.border,
    borderWidth: 1,
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipSelected: { borderColor: Colors.primary, backgroundColor: '#CCFBF1' },
  chipText: { color: Colors.textSecondary, fontWeight: '700' },
  chipTextSelected: { color: Colors.primary },
});
