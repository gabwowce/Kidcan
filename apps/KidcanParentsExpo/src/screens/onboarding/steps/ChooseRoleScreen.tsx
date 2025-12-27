// src/screens/onboarding/ChooseRoleScreen.tsx
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { AppButton } from "../../../components/common/AppButton";
import { AppText } from "../../../components/common/AppText";
import { SelectableCard } from "../../../components/common/SelectableCard";
import {
  OnboardingScreen,
  onboardingQuestionText,
} from "../../../components/onboarding/OnboardingScreen";
import { parentRoles } from "../../../config/parentRoles";
import { useOnboarding } from "../../../context/OnboardingContext";
import type { RootStackParamList } from "../../../navigation/types";
import { colors } from "../../../theme";

type Props = NativeStackScreenProps<RootStackParamList, "ChooseRole">;

const ChooseRoleScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { parentRole, setParentRole } = useOnboarding();

  const selected = parentRole ?? "guardian";

  const handleNext = () => {
    if (!selected) return;
    setParentRole(selected);
    navigation.navigate("AddOrJoin", { role: selected });
  };

  return (
    <OnboardingScreen
      footer={
        <AppButton
          label={t("onboarding.chooseRole.continue")}
          variant="primary"
          onPress={handleNext}
          disabled={!selected}
        />
      }
    >
      <AppText
        size={18}
        weight="heavy"
        color={colors.textDark}
        style={onboardingQuestionText}
      >
        {t("onboarding.chooseRole.question")}
      </AppText>

      <View style={styles.grid}>
        {parentRoles.map((role) => {
          const isActive = selected === role.id;
          return (
            <SelectableCard
              key={role.id}
              variant="tile"
              style={styles.tile}
              label={t(role.labelKey)}
              icon={
                <AppText size={26} weight="medium">
                  {role.icon}
                </AppText>
              }
              selected={isActive}
              onPress={() => setParentRole(role.id)}
            />
          );
        })}
      </View>
    </OnboardingScreen>
  );
};

export default ChooseRoleScreen;

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tile: {
    width: "48%",
    marginBottom: 12,
  },
});
