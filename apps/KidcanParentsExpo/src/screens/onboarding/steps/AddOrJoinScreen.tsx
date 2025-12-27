// src/screens/onboarding/AddOrJoinScreen.tsx
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { AppText } from "../../../components/common/AppText";
import { SelectableCard } from "../../../components/common/SelectableCard";
import {
  OnboardingScreen,
  onboardingQuestionText,
} from "../../../components/onboarding/OnboardingScreen";
import type { RootStackParamList } from "../../../navigation/types";
import { colors, spacing } from "../../../theme";

type Props = NativeStackScreenProps<RootStackParamList, "AddOrJoin">;

const AddOrJoinScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { role } = route.params;

  return (
    <OnboardingScreen>
      <AppText
        size={18}
        weight="heavy"
        color={colors.textDark}
        style={onboardingQuestionText}
      >
        {t("onboarding.addOrJoin.title")}
      </AppText>

      <View style={styles.cardList}>
        <SelectableCard
          label={t("onboarding.addOrJoin.addKidTitle")}
          icon={
            <AppText size={26} weight="medium">
              👧
            </AppText>
          }
          onPress={() => navigation.navigate("ChildName", { role })}
        />

        <SelectableCard
          label={t("onboarding.addOrJoin.joinFamilyTitle")}
          icon={
            <AppText size={26} weight="medium">
              🏡
            </AppText>
          }
          onPress={() => navigation.navigate("JoinFamily", { role })}
        />
      </View>
    </OnboardingScreen>
  );
};

export default AddOrJoinScreen;

const styles = StyleSheet.create({
  cardList: {
    marginTop: spacing.lg,
    gap: 12,
  },
});
