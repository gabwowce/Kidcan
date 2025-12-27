import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, TextInput, View } from "react-native";

import { AppButton } from "../../../components/common/AppButton";
import { AppText } from "../../../components/common/AppText";
import { OnboardingScreen } from "../../../components/onboarding/OnboardingScreen";
import type { SettingsStackParamList } from "../../../navigation/types";
import { colors, spacing } from "../../../theme";

type Props = NativeStackScreenProps<SettingsStackParamList, "AddChildName">;

const AddChildNameScreen: React.FC<Props> = ({ navigation }) => {
  const [childName, setChildName] = useState("");

  const canContinue = useMemo(() => childName.trim().length >= 2, [childName]);

  const handleContinue = () => {
    const name = childName.trim();
    if (name.length < 2) {
      Alert.alert("Per trumpas vardas", "Įvesk bent 2 simbolius.");
      return;
    }
    navigation.navigate("AddChildGender", { childName: name });
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
        <AppText
          size={20}
          weight="heavy"
          color={colors.textDark}
          style={styles.title}
        >
          What’s your kid’s name?
        </AppText>

        <TextInput
          value={childName}
          onChangeText={setChildName}
          placeholder="Name"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />
      </View>
    </OnboardingScreen>
  );
};

export default AddChildNameScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
  },
  title: { textAlign: "center", marginBottom: 18 },
  input: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    color: colors.textDark,
    fontSize: 16,
  },
});
