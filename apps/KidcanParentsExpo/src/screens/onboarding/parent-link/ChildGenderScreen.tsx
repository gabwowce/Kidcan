// src/screens/onboarding/parent-link/ChildGenderScreen.tsx
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppButton } from "../../../components/common/AppButton";
import { AppText } from "../../../components/common/AppText";
import { SelectableCard } from "../../../components/common/SelectableCard";
import { OnboardingScreen } from "../../../components/onboarding/OnboardingScreen";
import type { RootStackParamList } from "../../../navigation/types";
import { colors, spacing } from "../../../theme";

type Props = NativeStackScreenProps<RootStackParamList, "ChildGender">;

type Gender = "daughter" | "son";

const ChildGenderScreen: React.FC<Props> = ({ navigation, route }) => {
  const { role, childName } = route.params;
  const [gender, setGender] = useState<Gender | null>(null);

  const canContinue = !!gender;

  const handleContinue = () => {
    if (!gender) return;

    navigation.navigate("ConnectChild", {
      role,
      childName,
      childGender: gender,
    });
  };

  return (
    <OnboardingScreen
      footer={
        <AppButton
          label="Continue"
          onPress={handleContinue}
          disabled={!canContinue}
        />
      }
    >
      <View style={styles.content}>
        {/* Title */}
        <AppText
          size={20}
          weight="heavy"
          color={colors.textDark}
          style={styles.title}
        >
          {`Is ${childName || "your kid"} a\nson or daughter?`}
        </AppText>

        {/* Options */}
        <View style={styles.optionsRow}>
          <SelectableCard
            variant="tile"
            style={styles.tile}
            label="Daughter"
            icon={<AppText size={28}>👧</AppText>}
            selected={gender === "daughter"}
            onPress={() => setGender("daughter")}
          />
          <SelectableCard
            variant="tile"
            style={styles.tile}
            label="Son"
            icon={<AppText size={28}>👦</AppText>}
            selected={gender === "son"}
            onPress={() => setGender("son")}
          />
        </View>

        {/* Why we ask this */}
        <View style={styles.whyBlock}>
          <AppText
            size={12}
            weight="heavy"
            color="#AFAFAF"
            style={styles.whyTitle}
          >
            WHY WE ASK THIS
          </AppText>

          <AppText
            size={12}
            weight="bold"
            color="#AFAFAF"
            style={styles.whyBody}
          >
            We use the name for navigational{"\n"}
            convenience within the app.
          </AppText>
        </View>
      </View>
    </OnboardingScreen>
  );
};

export default ChildGenderScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center", // per vidurį ekrano
    paddingHorizontal: spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: 28,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 24,
  },
  tile: {
    width: "48%", // du kvadratai vienoje eilėje
  },
  whyBlock: {
    alignItems: "center",
    marginTop: 8,
  },
  whyTitle: {
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  whyBody: {
    textAlign: "center",
    lineHeight: 16,
  },
});
