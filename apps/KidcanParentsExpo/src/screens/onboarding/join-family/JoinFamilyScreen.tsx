// src/screens/onboarding/join-family/JoinFamilyScreen.tsx
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { checkFamilyCode } from "../../../api/family";
import { AppText } from "../../../components/common/AppText";
import {
  OnboardingScreen,
  onboardingQuestionText,
} from "../../../components/onboarding/OnboardingScreen";
import type { RootStackParamList } from "../../../navigation/types";
import { colors } from "../../../theme";

const CODE_LENGTH = 6;

type Props = NativeStackScreenProps<RootStackParamList, "JoinFamily">;

const JoinFamilyScreen: React.FC<Props> = ({ navigation }) => {
  const [code, setCode] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const inputRef = React.useRef<TextInput | null>(null);
  const prevCodeRef = React.useRef("");

  const handleComplete = async (cleanCode: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const invite = await checkFamilyCode(cleanCode);

      if (!invite) {
        console.log("Family code invalid or expired");
        setIsSubmitting(false);
        return;
      }

      navigation.replace("JoinFamilySuccess", { familyCode: cleanCode });
    } catch (e) {
      console.log("checkFamilyCode error", e);
      setIsSubmitting(false);
    }
  };

  const handleChange = (value: string) => {
    const clean = value.replace(/[^0-9]/g, "");
    setCode(clean);

    if (
      clean.length === CODE_LENGTH &&
      prevCodeRef.current.length !== CODE_LENGTH
    ) {
      void handleComplete(clean);
    }

    prevCodeRef.current = clean;
  };

  const handleBoxPress = () => {
    inputRef.current?.focus();
  };

  return (
    <OnboardingScreen>
      <View style={styles.inner}>
        <AppText
          size={20}
          weight="heavy"
          color={colors.textDark}
          style={onboardingQuestionText}
        >
          Enter your family code
        </AppText>

        <AppText
          size={14}
          weight="bold"
          color={colors.textMuted}
          style={styles.subtitle}
        >
          Ask the family creator for the invite code{"\n"}
          found in their settings.
        </AppText>

        <View style={styles.inputCard}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleBoxPress}
            style={styles.codeRow}
          >
            {Array.from({ length: CODE_LENGTH }).map((_, index) => {
              const digit = code[index] ?? "";
              const isActive = index === code.length && !isSubmitting;

              return (
                <View
                  key={index}
                  style={[
                    styles.codeBox,
                    isActive && styles.codeBoxActive,
                    digit && styles.codeBoxFilled,
                  ]}
                >
                  <AppText size={24} weight="heavy" color={colors.textDark}>
                    {digit}
                  </AppText>
                </View>
              );
            })}

            {/* nematomas TextInput – čia realiai rašom kodą */}
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={handleChange}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              style={styles.hiddenInput}
              autoFocus
            />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity onPress={() => navigation.navigate("JoinFamilyHelp")}>
          <AppText
            size={14}
            weight="heavy"
            color={colors.primary}
            style={styles.helpLink}
          >
            Where is the code?
          </AppText>
        </TouchableOpacity>
      </View>
    </OnboardingScreen>
  );
};

export default JoinFamilyScreen;

const styles = StyleSheet.create({
  inner: {
    flex: 1,
  },
  subtitle: {
    textAlign: "center",
    marginTop: 8,
  },
  inputCard: {
    marginTop: 32,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  label: {
    letterSpacing: 1,
    marginBottom: 16,
  },
  codeRow: {
    flexDirection: "row",
    gap: 10,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    // kaip SelectableCard: top/left/right = 2, bottom = 0
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 6,
    borderColor: "#E6E7EB",
  },
  codeBoxActive: {
    borderColor: "#00B4FC",
    backgroundColor: "#D9F5FF",
  },
  codeBoxFilled: {
    backgroundColor: "#FFFFFF",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  helpLink: {
    textAlign: "center",
    marginTop: 24,
    textDecorationLine: "underline",
  },
});
