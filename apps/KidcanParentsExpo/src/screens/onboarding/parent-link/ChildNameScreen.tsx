// src/screens/onboarding/parent-link/ChildNameScreen.tsx
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

import { AppButton } from "../../../components/common/AppButton";
import { AppInput } from "../../../components/common/AppInput";
import { AppText } from "../../../components/common/AppText";
import { OnboardingScreen } from "../../../components/onboarding/OnboardingScreen";
import type { RootStackParamList } from "../../../navigation/types";
import { colors } from "../../../theme";

type Props = NativeStackScreenProps<RootStackParamList, "ChildName">;

const ChildNameScreen: React.FC<Props> = ({ navigation, route }) => {
  const { role } = route.params;
  const [name, setName] = useState("");

  const trimmedName = name.trim();
  const canContinue = trimmedName.length > 0;

  const handleContinue = () => {
    if (!canContinue) return;
    navigation.navigate("ChildGender", { role, childName: trimmedName });
  };

  return (
    <OnboardingScreen
      footer={
        <AppButton
          label="Continue"
          variant="primary"
          onPress={handleContinue}
          disabled={!canContinue}
        />
      }
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <View style={styles.content}>
          {/* Title */}
          <AppText
            size={22}
            weight="heavy"
            color={colors.textDark}
            style={styles.title}
          >
            {`Let's give your\nlittle one a name`}
          </AppText>

          {/* Subtitle */}
          <AppText
            size={14}
            weight="bold"
            color={colors.textMuted}
            style={styles.subtitle}
          >
            What should we call the little one?
          </AppText>

          {/* Name input */}
          <AppInput
            placeholder="e.g. Erik"
            value={name}
            onChangeText={setName}
            maxLength={30}
            // šitam ekrane border apačioj ne toks storas
            style={styles.nameInput}
          />

          {/* Secure & compliant row */}
          <View style={styles.secureRow}>
            <AppText size={12} weight="heavy" color="#000000">
              {/* paprastas „shield“/lock feel */}
              🔒 Secure &amp; Compliant
            </AppText>
            <AppText size={12} weight="medium" color="#939393">
              {"   |   "}
            </AppText>

            <AppText
              size={12}
              weight="heavy"
              color="#939393"
              style={styles.secureText}
            >
              GDPR • COPPA • CCPA
            </AppText>
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
      </KeyboardAvoidingView>
    </OnboardingScreen>
  );
};

export default ChildNameScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    marginTop: 18,
    marginBottom: 32,
    textAlign: "center",
  },
  nameInput: {
    width: "100%",
    marginBottom: 32,
  },
  secureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },
  secureText: {
    // truputį nutolsta nuo „Secure & Compliant“
  },
  whyBlock: {
    marginTop: 24,
    alignItems: "center",
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
