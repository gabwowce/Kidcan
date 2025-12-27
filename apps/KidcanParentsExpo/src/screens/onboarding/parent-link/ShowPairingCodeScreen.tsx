// src/screens/onboarding/ShowPairingCodeScreen.tsx
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, View } from "react-native";

import {
  debugPairingTable,
  deleteUnusedPairingCodesForChild,
  getPairingStatus,
  PAIRING_STATUS_POLL_MS,
  regeneratePairingForChild,
} from "../../../api/pairing";
import { AppButton } from "../../../components/common/AppButton";
import { AppText } from "../../../components/common/AppText";
import { OnboardingScreen } from "../../../components/onboarding/OnboardingScreen";
import type { RootStackParamList } from "../../../navigation/types";
import { colors, spacing } from "../../../theme";

type Props = NativeStackScreenProps<RootStackParamList, "ShowPairingCode">;

const CARD_BORDER = "#E6E7EB";
const PRIMARY_BLUE = "#0065F4";

const ShowPairingCodeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();

  const {
    pairingCode: initialFormatted,
    rawCode: initialRaw,
    childId,
    childName,
    role,
  } = route.params;

  const [displayCode, setDisplayCode] = useState(initialFormatted);
  const [currentRawCode, setCurrentRawCode] = useState(initialRaw);

  const handleSendCode = () => {
    Alert.alert("TODO", "Here you will share the code via message/email.");
  };

  // 🔁 pollinam statusą ir regeneruojam, jei pasibaigė
  useEffect(() => {
    debugPairingTable();
    let isActive = true;

    const checkStatus = async () => {
      try {
        const status = await getPairingStatus(currentRawCode, childId);
        if (!status || !isActive) return;

        if (status.used) {
          navigation.replace("PairingSuccess", { childId, childName, role });
          return;
        }

        if (status.isExpired) {
          const { code } = await regeneratePairingForChild(childId);
          if (!isActive) return;

          const formatted = code.replace(/(\d{3})(\d{3})/, "$1 $2");
          setCurrentRawCode(code);
          setDisplayCode(formatted);
        }
      } catch (e) {
        console.log("pairing status error", e);
      }
    };

    checkStatus();
    const intervalId = setInterval(checkStatus, PAIRING_STATUS_POLL_MS);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [currentRawCode, childId, navigation, childName, role]);

  // ištrinam nepanaudotą kodą, jei user grįžta atgal
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      const action = e.data.action;

      if (
        action.type === "REPLACE" &&
        "payload" in action &&
        (action as any).payload?.name === "PairingSuccess"
      ) {
        return;
      }

      if (
        action.type === "GO_BACK" ||
        action.type === "POP" ||
        action.type === "POP_TO_TOP"
      ) {
        deleteUnusedPairingCodesForChild(childId, currentRawCode).catch((err) =>
          console.log("failed to delete pairing code on back", err)
        );
      }
    });

    return unsubscribe;
  }, [navigation, childId, currentRawCode]);

  return (
    <OnboardingScreen
      footer={
        <AppButton
          label={t("onboarding.joinFamily.sendCode")}
          onPress={handleSendCode}
        />
      }
    >
      <View style={styles.content}>
        {/* Title */}
        <AppText
          size={18}
          weight="heavy"
          color={colors.textDark}
          style={styles.title}
        >
          {t("onboarding.joinFamily.title")}
        </AppText>

        {/* Subtitle su mėlynu app pavadinimu */}
        <AppText
          size={13}
          weight="medium"
          color={colors.textMuted}
          style={styles.subtitle}
        >
          {t("onboarding.joinFamily.subtitleBefore")}{" "}
          <AppText size={13} weight="heavy" color={PRIMARY_BLUE}>
            {t("onboarding.joinFamily.appName")}
          </AppText>{" "}
          {t("onboarding.joinFamily.subtitleAfter")}
        </AppText>

        {/* Code card */}
        <View style={styles.codeCard}>
          <AppText
            size={11}
            weight="heavy"
            color={colors.textMuted}
            style={styles.tapToCopy}
          >
            {t("onboarding.joinFamily.tapToCopy").toUpperCase()}
          </AppText>

          <View style={styles.codeRow}>
            <AppText size={32} weight="heavy" color={colors.textDark}>
              {displayCode}
            </AppText>

            {/* paprastas copy ikonos placeholderis */}
            <AppText size={18} weight="heavy" color={colors.textMuted}>
              📋
            </AppText>
          </View>
        </View>

        {/* Waiting for connection */}
        <View style={styles.waitRow}>
          <AppText size={16} color={PRIMARY_BLUE}>
            ⟳
          </AppText>
          <AppText
            size={12}
            weight="heavy"
            color={PRIMARY_BLUE}
            style={styles.waitText}
          >
            {t("onboarding.joinFamily.waitingForConnection").toUpperCase()}
          </AppText>
        </View>
      </View>
    </OnboardingScreen>
  );
};

export default ShowPairingCodeScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
  },
  codeCard: {
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: colors.white,
    paddingVertical: 20,
    paddingHorizontal: 26,
    alignItems: "center",

    // tas pats stroke pattern kaip mygtukuose
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 6,
    borderColor: CARD_BORDER,
  },
  tapToCopy: {
    marginBottom: 10,
    letterSpacing: 1,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  waitRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  waitText: {
    marginLeft: 8,
  },
});
