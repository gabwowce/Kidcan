// src/screens/auth/RegisterScreen.tsx
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useOnboarding } from "../../context/OnboardingContext";
import { useOnboardingFlag } from "../../context/OnboardingFlagContext";
import type { RootStackParamList } from "../../navigation/types";
import { colors, spacing } from "../../theme";

import { useAppDispatch } from "../../store/hooks";
import { googleLoginThunk, registerThunk } from "../../store/slices/authSlice";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

const RegisterScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const familyCode = route.params?.familyCode;

  // variant: 'returning' (default) | 'afterPairing'
  const variant =
    route.params?.variant === "afterPairing" ? "afterPairing" : "returning";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { parentRole } = useOnboarding();
  const { completeOnboarding } = useOnboardingFlag();

  const handleEmailRegister = async () => {
    const trimmedEmail = email.trim();
    console.log("Trying to register:", trimmedEmail);

    if (!trimmedEmail || password.length < 6 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await dispatch(
        registerThunk({
          email: trimmedEmail,
          password,
          familyCode: familyCode ?? null,
          parentRole: parentRole ?? null,
        })
      ).unwrap();

      await completeOnboarding();
    } catch (e: any) {
      console.log("Email register error", e);
      Alert.alert(
        "Registracija nepavyko",
        e?.message ?? "Patikrink el. paštą ir slaptažodį"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await dispatch(googleLoginThunk()).unwrap();
      // OAuth pabaigs deep link handleris App.tsx
      // Jei norėsi: po sėkmingo setSession galim automatiškai kviesti completeFamilyJoin(familyCode, parentRole)
    } catch (e) {
      console.log("Google auth error", e);
      Alert.alert(
        "Klaida",
        "Nepavyko prisijungti su Google. Bandyk dar kartą."
      );
    }
  };

  const goToLogin = () => navigation.navigate("Login");

  const title =
    variant === "afterPairing"
      ? t("auth.afterPairing.title")
      : t("auth.returning.title");

  const subtitle =
    variant === "afterPairing"
      ? t("auth.afterPairing.subtitle")
      : t("auth.returning.subtitle");

  const disabled = !email.trim() || password.length < 6 || isSubmitting;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {/* EMAIL REGISTRACIJA */}
        <View style={styles.emailBlock}>
          <TextInput
            style={styles.input}
            placeholder={t("auth.emailPlaceholder")}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder={t("auth.passwordPlaceholder")}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.buttonEmail, disabled && styles.buttonEmailDisabled]}
            onPress={handleEmailRegister}
            disabled={disabled}
          >
            <Text style={styles.buttonEmailText}>
              {isSubmitting
                ? t("common.loading", "Kuriama...")
                : t("auth.register")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SOCIAL */}
        <TouchableOpacity style={styles.buttonGoogle} onPress={handleGoogle}>
          <Text style={styles.buttonGoogleText}>
            {t("auth.registerWithGoogle")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToLogin}>
          <Text style={styles.loginLink}>
            {t("auth.alreadyHaveAccount")}{" "}
            <Text style={styles.loginLinkBold}>{t("auth.login")}</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          {t("auth.agreePrefix")}{" "}
          <Text style={styles.link}>{t("auth.terms")}</Text> {t("auth.and")}{" "}
          <Text style={styles.link}>{t("auth.privacy")}</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundOnboarding,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: "center",
  },
  card: {
    flexGrow: 0,
    backgroundColor: "#FFF6E9",
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: "stretch",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textDark,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 24,
  },
  emailBlock: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#E3E6F0",
    marginBottom: 10,
    fontSize: 14,
  },
  buttonEmail: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    marginTop: 4,
  },
  buttonEmailDisabled: {
    opacity: 0.5,
  },
  buttonEmailText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonGoogle: {
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E3E6F0",
  },
  buttonGoogleText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textDark,
  },
  loginLink: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 8,
  },
  loginLinkBold: {
    color: colors.primary,
    fontWeight: "600",
  },
  terms: {
    fontSize: 11,
    color: "#B0B3C0",
    textAlign: "center",
  },
  link: {
    color: colors.primary,
    textDecorationLine: "underline",
  },
});
