import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
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
} from "react-native";

import { api } from "@/src/services/api";

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (!digits) {
    return "";
  }
  return digits.startsWith("0") ? digits : `0${digits.slice(0, 9)}`;
}

function formatGhanaPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  return digits.replace(/(\d{4})(\d{0,3})(\d{0,3})/, "$1 $2 $3").trim();
}

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = phone.length === 10 && phone.startsWith("0");
  const colors = {
    background: "#FFFFFF",
    heroText: "#1B1D35",
    subtext: "#7C8194",
    border: "#E4E7F0",
    field: "#FFFFFF",
    fieldMuted: "#F9FAFF",
    label: "#50566B",
    accent: "#5B21F0",
    accentPressed: "#4B17D6",
    buttonDisabled: "#D2D6E3",
    buttonText: "#FFFFFF",
    link: "#5B21F0",
  };

  async function continueToOtp() {
    if (!isValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.sendOtp(phone);

      if (!response.success) {
        Alert.alert(
          "Unable to send OTP",
          response.error ?? "Something went wrong.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Retry", onPress: () => void continueToOtp() },
          ],
        );
        return;
      }

      router.push({
        pathname: "/(auth)/otp",
        params: { phone, mode: "login" },
      });
    } catch (error) {
      Alert.alert(
        "Unable to send OTP",
        error instanceof Error ? error.message : "Something went wrong.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: () => void continueToOtp() },
        ],
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topIcon}>
          <View style={styles.topIconBase}>
            <View
              style={[styles.topIconBlend, { backgroundColor: "#5B21F0" }]}
            />
            <View
              style={[
                styles.topIconBlend,
                styles.topIconBlendRight,
                { backgroundColor: "#14B8A6" },
              ]}
            />
            <MaterialCommunityIcons color="#FFFFFF" name="home" size={28} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.heroText }]}>
            Welcome Back
          </Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Enter your phone number to receive a one-time code
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.label }]}>
              Phone Number
            </Text>
            <View style={styles.phoneRow}>
              <View
                style={[
                  styles.countryChip,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.fieldMuted,
                  },
                ]}
              >
                <Text style={styles.flag}>🇬🇭</Text>
                <Text style={[styles.countryCode, { color: colors.heroText }]}>
                  +233
                </Text>
              </View>
              <View
                style={[
                  styles.phoneInputWrap,
                  { borderColor: colors.border, backgroundColor: colors.field },
                ]}
              >
                <MaterialCommunityIcons
                  color={colors.subtext}
                  name="phone-outline"
                  size={18}
                />
                <TextInput
                  value={formatGhanaPhone(phone)}
                  onChangeText={(value) => setPhone(normalizePhone(value))}
                  placeholder="0XX XXX XXXX"
                  placeholderTextColor="#B0B5C7"
                  keyboardType="number-pad"
                  style={[
                    styles.input,
                    styles.phoneInput,
                    { color: colors.heroText },
                  ]}
                />
              </View>
            </View>
          </View>

          <Text style={[styles.legalText, { color: colors.subtext }]}>
            By continuing, you agree to our{" "}
            <Text style={[styles.link, { color: colors.link }]}>
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text style={[styles.link, { color: colors.link }]}>
              Privacy Policy
            </Text>
            . Standard message rates may apply.
          </Text>

          <Pressable
            accessibilityRole="button"
            disabled={!isValid || isSubmitting}
            onPress={continueToOtp}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor:
                  !isValid || isSubmitting
                    ? colors.buttonDisabled
                    : pressed
                      ? colors.accentPressed
                      : colors.accent,
              },
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? "Sending..." : "Send OTP"}
            </Text>
            <MaterialCommunityIcons
              color="#FFFFFF"
              name="chevron-right"
              size={20}
            />
          </Pressable>

          {/* <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.subtext }]}>
            Don&apos;t have an account?{" "}
          </Text>
          <Pressable onPress={() => router.replace("/(auth)/signup")}>
            <Text style={[styles.footerLink, { color: colors.link }]}>
              Register
            </Text>
          </Pressable>
        </View> */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 48,
    paddingBottom: 18,
  },
  topIcon: {
    marginBottom: 14,
  },
  topIconBase: {
    width: 42,
    height: 42,
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F46E5",
  },
  topIconBlend: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.95,
  },
  topIconBlendRight: {
    left: "50%",
  },
  content: {
    gap: 8,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    flex: 1,
    gap: 18,
    paddingTop: 18,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
  },
  phoneRow: {
    flexDirection: "row",
    gap: 10,
  },
  countryChip: {
    width: 88,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  flag: {
    fontSize: 18,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: "700",
  },
  phoneInputWrap: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  phoneInput: {
    letterSpacing: 0.2,
  },
  legalText: {
    fontSize: 12,
    lineHeight: 18,
  },
  link: {
    fontWeight: "700",
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 2,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "800",
  },
});
