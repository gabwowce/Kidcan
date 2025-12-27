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
import type { SettingsStackParamList } from "../../../navigation/types";
import { colors, spacing } from "../../../theme";

type Props = NativeStackScreenProps<
  SettingsStackParamList,
  "AddChildShowPairingCode"
>;

const PRIMARY_BLUE = "#0065F4";

const AddChildShowPairingCodeScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();

  const {
    pairingCode: initialFormatted,
    rawCode: initialRaw,
    childId,
    childName,
  } = route.params;

  const [displayCode, setDisplayCode] = useState(initialFormatted);
  const [currentRawCode, setCurrentRawCode] = useState(initialRaw);

  const handleSendCode = () => {
    Alert.alert("TODO", "Here you will share the code via message/email.");
  };

  useEffect(() => {
    debugPairingTable();
    let isActive = true;

    const checkStatus = async () => {
      try {
        const status = await getPairingStatus(currentRawCode, childId);
        if (!status || !isActive) return;

        if (status.used) {
          // ✅ čia flow pabaiga settings'e
          navigation.popToTop();
          // arba: navigation.navigate("ChildrenList")
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
  }, [currentRawCode, childId, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      const action = e.data.action;

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
        <AppText
          size={18}
          weight="heavy"
          color={colors.textDark}
          style={styles.title}
        >
          {t("onboarding.joinFamily.title")}
        </AppText>

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

            <AppText size={18} weight="heavy" color={colors.textMuted}>
              📋
            </AppText>
          </View>
        </View>

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

export default AddChildShowPairingCodeScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  title: { textAlign: "center", marginBottom: 10 },
  subtitle: { textAlign: "center", marginBottom: 18, lineHeight: 18 },

  codeCard: {
    width: "100%",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E7EB",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tapToCopy: { marginBottom: 10 },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  waitRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  waitText: { letterSpacing: 0.4 },
});
