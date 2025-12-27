// src/screens/settings/InviteParentSuccessScreen.tsx
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { SettingsStackParamList } from "../../navigation/types";
import { colors, radii, spacing } from "../../theme";

type Props = NativeStackScreenProps<
  SettingsStackParamList,
  "InviteParentSuccess"
>;

export const InviteParentSuccessScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();

  const handleBackToSettings = () => {
    navigation.popToTop();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.emoji}>🎉</Text>

        <Text style={styles.title}>
          {t(
            "inviteParent.join_success_title",
            "Kitas tėvas sėkmingai prisijungė"
          )}
        </Text>

        <Text style={styles.subtitle}>
          {t(
            "inviteParent.join_success_message",
            "Nuo šiol abu matysite ir valdysite vaiko nustatymus šioje šeimoje."
          )}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleBackToSettings}
      >
        <Text style={styles.primaryButtonText}>
          {t("inviteParent.back_to_settings", "Grįžti į nustatymus")}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundOnboarding,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 42,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textDark,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  codeBox: {
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: colors.optionBorder,
    alignItems: "center",
  },
  codeLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  codeText: {
    fontSize: 26,
    letterSpacing: 6,
    fontWeight: "700",
    color: colors.textDark,
  },
  primaryButton: {
    borderRadius: radii.full,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
});
