// src/screens/auth/LoginScreen.tsx
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "../../components/common/AppButton";
import { AppInput } from "../../components/common/AppInput";
import { AppText } from "../../components/common/AppText";
import { colors, spacing } from "../../theme";

import { useAppDispatch } from "../../store/hooks";
import { googleLoginThunk, loginThunk } from "../../store/slices/authSlice";

type Props = { navigation: any };

export default function LoginScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async () => {
    try {
      await dispatch(loginThunk({ email: email.trim(), password })).unwrap();
    } catch (e: any) {
      console.log("login error", e);
      Alert.alert("Klaida", "Nepavyko prisijungti. Patikrink duomenis.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await dispatch(googleLoginThunk()).unwrap();
      // toliau login užbaigs deep link handleris App.tsx
    } catch (e) {
      console.log("googleLogin error", e);
      Alert.alert(
        "Klaida",
        "Nepavyko prisijungti su Google. Bandyk dar kartą."
      );
    }
  };

  const handleFamilyCode = () => {
    navigation.navigate("JoinFamily", { role: "guardian" });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          {/* HEADER */}
          <View style={styles.header}>
            <AppText
              size={26}
              weight="heavy"
              color={colors.textDark}
              style={styles.title}
            >
              Welcome back!
            </AppText>

            <AppText
              size={14}
              weight="medium"
              color={colors.textMuted}
              style={styles.subtitle}
            >
              Login to manage your kid&apos;s family settings{"\n"}
              and view reports.
            </AppText>
          </View>

          {/* EMAIL */}
          <View style={styles.emailBlock}>
            <AppInput
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              inputStyle={styles.inputText}
            />

            <AppInput
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              inputStyle={styles.inputText}
            />
          </View>

          <AppButton
            label="Login"
            variant="primary"
            onPress={handleEmailLogin}
          />

          {/* OR separator */}
          <View style={styles.separatorRow}>
            <View style={styles.separatorLine} />
            <AppText size={12} weight="medium" color={colors.textMuted}>
              OR
            </AppText>
            <View style={styles.separatorLine} />
          </View>

          {/* SOCIAL + FAMILY CODE */}
          <View style={styles.actions}>
            <AppButton
              label="Continue with Google"
              variant="light"
              onPress={handleGoogleLogin}
              iconLeft={
                <View style={styles.googleIconBubble}>
                  <AppText size={16} weight="heavy" color="#4285F4">
                    G
                  </AppText>
                </View>
              }
            />

            <AppButton
              label="Continue with Apple"
              variant="dark"
              onPress={() => {}}
              iconLeft={
                <AppText size={18} weight="heavy" color="#FFFFFF">
                  
                </AppText>
              }
            />

            <View style={styles.separatorRow}>
              <View style={styles.separatorLine} />
            </View>

            <AppButton
              label="I have a family code"
              variant="primary"
              onPress={handleFamilyCode}
            />
          </View>

          {/* TERMS */}
          <View style={styles.bottom}>
            <AppText size={11} weight="medium" color={colors.textMuted}>
              By logging in, you agree to our{" "}
              <AppText size={11} weight="heavy" color={colors.primary}>
                Terms
              </AppText>{" "}
              and{" "}
              <AppText size={11} weight="heavy" color={colors.primary}>
                Privacy Policy
              </AppText>
            </AppText>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.backgroundOnboarding,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: { textAlign: "center", marginBottom: 8 },
  subtitle: { textAlign: "center" },

  emailBlock: { gap: 8, marginBottom: 24 },
  inputText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Gilroy-Medium",
    textAlign: "left",
  },

  actions: { gap: 10 },
  googleIconBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E6E7EB",
    marginRight: 8,
  },

  separatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 24,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },

  bottom: { marginTop: "auto", alignItems: "center", marginBottom: 4 },
});
