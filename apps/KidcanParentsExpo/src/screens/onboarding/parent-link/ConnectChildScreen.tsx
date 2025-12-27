// src/screens/onboarding/ConnectChildScreen.tsx
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, View } from "react-native";

import { createPairing } from "../../../api/pairing";
import { AppButton } from "../../../components/common/AppButton";
import { AppText } from "../../../components/common/AppText";
import { OnboardingScreen } from "../../../components/onboarding/OnboardingScreen";
import type { RootStackParamList } from "../../../navigation/types";
import { colors, spacing } from "../../../theme";

type Props = NativeStackScreenProps<RootStackParamList, "ConnectChild">;

const BORDER_CARD = "#E6E7EB";
const PRIMARY_BLUE = "#0065F4";
const CHECK_GREEN = "#00C853";

const ConnectChildScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { role, childName, childGender } = route.params;
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const { code, child_id } = await createPairing(
        childName,
        childGender,
        role
      );

      const formatted = code.replace(/(\d{3})(\d{3})/, "$1 $2");

      navigation.navigate("ShowPairingCode", {
        pairingCode: formatted,
        rawCode: code,
        childId: child_id,
        role,
        childName,
        childGender,
      });
    } catch (e) {
      console.log("createPairing error", e);
      Alert.alert("Error", "Could not generate pairing code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingScreen
      showBackButton={false}
      footer={
        <AppButton
          label={t("onboarding.connectChild.button")}
          onPress={handleSetup}
          disabled={loading}
        />
      }
    >
      <View style={styles.content}>
        {/* SECTION TITLE */}
        <AppText
          size={12}
          weight="heavy"
          color={colors.textDark}
          style={styles.sectionTitle}
        >
          {t("onboarding.connectChild.sectionTitle")}
        </AppText>

        {/* DIAGRAM */}
        <View style={styles.diagram}>
          {/* Parent column */}
          <View style={styles.deviceColumn}>
            <View style={styles.parentDeviceBox}>
              {/* čia vėliau galėsim įdėti tikrą ikoną */}
              <AppText size={26}>📱</AppText>

              <View style={styles.checkBadge}>
                <AppText size={13} weight="heavy" color="#FFFFFF">
                  ✓
                </AppText>
              </View>
            </View>

            <AppText
              size={12}
              weight="heavy"
              color={colors.textDark}
              style={styles.deviceTitle}
            >
              KidCan Guard
            </AppText>
            <AppText size={11} weight="medium" color={colors.textMuted}>
              For a Parent
            </AppText>
          </View>

          {/* dots */}
          <AppText size={26} weight="heavy" color={colors.textMuted}>
            ⋯
          </AppText>

          {/* Child column */}
          <View style={styles.deviceColumn}>
            <View style={styles.childDeviceBox}>
              <AppText size={28}>👶</AppText>
            </View>

            <AppText
              size={12}
              weight="heavy"
              color={colors.textDark}
              style={styles.deviceTitle}
            >
              KidCan Child
            </AppText>
            <AppText size={11} weight="medium" color={colors.textMuted}>
              For a Kid
            </AppText>
          </View>
        </View>

        {/* INFO CARD */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconBox}>
            <AppText size={22}>👶</AppText>
          </View>

          <View style={styles.infoTextCol}>
            <AppText
              size={14}
              weight="heavy"
              color={colors.textDark}
              style={styles.infoTitle}
            >
              {t("onboarding.connectChild.infoTitle", {
                childName: childName || "",
              })}
            </AppText>

            <AppText size={13} weight="medium" color={colors.textMuted}>
              {t("onboarding.connectChild.infoText", {
                childName: childName || t("common.yourChild", "your child"),
              })}
            </AppText>
          </View>
        </View>
      </View>
    </OnboardingScreen>
  );
};

export default ConnectChildScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    textAlign: "center",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 24,
  },

  diagram: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    marginBottom: 28,
  },
  deviceColumn: {
    alignItems: "center",
  },
  parentDeviceBox: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",

    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 6,
    borderColor: BORDER_CARD,

    position: "relative",
  },
  childDeviceBox: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: PRIMARY_BLUE,

    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 6,
    borderColor: "#004FE0",
  },
  checkBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: CHECK_GREEN,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  deviceTitle: {
    marginTop: 8,
  },

  infoCard: {
    marginTop: 24,
    marginHorizontal: spacing.sm,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 16,
    paddingHorizontal: 16,

    // kaip SelectableCard: 2/2/2/6
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 6,
    borderColor: BORDER_CARD,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: PRIMARY_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoTextCol: {
    flex: 1,
  },
  infoTitle: {
    marginBottom: 4,
  },
});
