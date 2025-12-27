import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "../../../components/common/AppButton";
import { AppText } from "../../../components/common/AppText";
import Logo from "../../../components/common/Logo";
import type { RootStackParamList } from "../../../navigation/types";
import { colors, spacing } from "../../../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Logo />
        <AppText
          size={20}
          weight="heavy"
          color={colors.textMuted}
          style={styles.subtitle}
        >
          {t("onboarding.welcomeSubtitle")}
        </AppText>
      </View>

      <View style={styles.bottom}>
        <AppButton
          label={t("onboarding.start")}
          variant="primary"
          onPress={() => navigation.navigate("ChooseLanguage")}
        />

        <AppButton
          label={t("onboarding.haveAccount")}
          variant="light"
          onPress={() => navigation.navigate("Login")}
          textStyle={styles.secondaryButtonText}
        />
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundOnboarding,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    paddingTop: 20,
    textAlign: "center",
  },
  bottom: {
    gap: spacing.md,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
});
