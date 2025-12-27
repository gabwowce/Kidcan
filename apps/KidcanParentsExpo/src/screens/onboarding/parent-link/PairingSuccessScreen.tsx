// src/screens/onboarding/parent-link/PairingSuccessScreen.tsx
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useOnboardingFlag } from "../../../context/OnboardingFlagContext";
import type { RootStackParamList } from "../../../navigation/types";
import { colors, radii, spacing } from "../../../theme";

// ✅ Redux
import { useAppSelector } from "../../../store/hooks";

type Props = NativeStackScreenProps<RootStackParamList, "PairingSuccess">;

const PairingSuccessScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childName, role } = route.params;

  // ✅ token iš Redux
  const token = useAppSelector((s) => s.auth.token);
  const isLoggedIn = !!token;

  const { completeOnboarding } = useOnboardingFlag();

  const handleAddAnotherKid = () => {
    navigation.replace("ChildName", { role });
  };

  useEffect(() => {
    (async () => {
      try {
        await completeOnboarding();
      } catch (e) {
        console.log("PairingSuccess completeOnboarding error", e);
      }
    })();
  }, [completeOnboarding]);

  const handleContinue = () => {
    if (isLoggedIn) {
      // ✅ nieko specialaus nereikia:
      // AppNavigator per useAppBootstrap pats perjungs į MAIN,
      // kai onboarding flag bus true + yra vaikas serveryje.
      navigation.popToTop();
      return;
    }

    // stub parent – po pairing vis tiek reikia susikurti accountą
    navigation.navigate("Register", {
      variant: "afterPairing",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.confetti}>🎉</Text>

        <Text style={styles.connected}>Connected!</Text>

        <Text style={styles.subtitle}>
          You are now linked to{" "}
          <Text style={styles.childName}>{childName}&apos;s</Text> device.
        </Text>
      </View>

      <View>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleAddAnotherKid}
        >
          <Text style={styles.secondaryButtonText}>Add another kid</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PairingSuccessScreen;

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
  confetti: {
    fontSize: 48,
    marginBottom: 12,
  },
  connected: {
    fontSize: 24,
    fontWeight: "800",
    color: "#00C853",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  childName: {
    fontWeight: "700",
    color: colors.textDark,
  },
  secondaryButton: {
    borderRadius: radii.full,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.optionBorder,
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  primaryButton: {
    borderRadius: radii.full,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#00C853",
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
});
