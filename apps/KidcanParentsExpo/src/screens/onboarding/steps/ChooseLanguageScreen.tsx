import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "../../../components/common/AppText";
import { SelectableCard } from "../../../components/common/SelectableCard";
import {
  OnboardingScreen,
  onboardingQuestionText,
} from "../../../components/onboarding/OnboardingScreen";
import { LANGUAGE_OPTIONS, type AppLanguage } from "../../../config/languages";
import { useLanguage } from "../../../context/LanguageContext";
import type { RootStackParamList } from "../../../navigation/types";
import { colors, spacing } from "../../../theme";
type Props = NativeStackScreenProps<RootStackParamList, "ChooseLanguage">;

export default function ChooseLanguageScreen({ navigation }: Props) {
  const { language, setLanguage } = useLanguage();

  const handleSelect = (lang: AppLanguage) => {
    setLanguage(lang);
    navigation.replace("ChooseRole");
  };

  return (
    <OnboardingScreen>
      <AppText
        size={20}
        weight="heavy"
        color={colors.textDark}
        style={onboardingQuestionText}
      >
        Choose your preferred language to continue
      </AppText>

      <View style={styles.list}>
        {LANGUAGE_OPTIONS.map((item) => (
          <SelectableCard
            key={item.code}
            label={item.label}
            icon={<AppText size={20}>{item.flag}</AppText>}
            selected={language === item.code}
            onPress={() => handleSelect(item.code)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  inner: {
    marginTop: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textDark,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  list: {
    width: "100%",
    gap: spacing.md,
  },
});
