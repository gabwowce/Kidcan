// src/screens/settings/InviteParentScreen.tsx
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { createFamilyInvite, FamilyInvite } from "../../api/family";
import { supabase } from "../../api/supabaseClient";
import { AppButton } from "../../components/common/AppButton";
import { PAIRING_STATUS_POLL_MS } from "../../config/onboarding";
import type { SettingsStackParamList } from "../../navigation/types";
import { colors, spacing } from "../../theme";

type Props = NativeStackScreenProps<SettingsStackParamList, "InviteParent">;

export const InviteParentScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [invite, setInvite] = useState<FamilyInvite | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasNavigatedToSuccess, setHasNavigatedToSuccess] = useState(false);

  const loadInvite = async () => {
    try {
      setLoading(true);
      setHasNavigatedToSuccess(false); // naujam kodui – naujas stebėjimas
      const data = await createFamilyInvite();
      setInvite(data);
    } catch (e) {
      console.log("InviteParentScreen error", e);
      Alert.alert(
        t("common.error", "Klaida"),
        t("inviteParent.error_message", "Nepavyko sugeneruoti kodo")
      );
    } finally {
      setLoading(false);
    }
  };

  // pirmą kartą užėjus – sugeneruojam kodą
  useEffect(() => {
    void loadInvite();
  }, []);

  // 🔁 POLLING: kas 3 s. tikrinam, ar šis kvietimas tapo used=TRUE
  useEffect(() => {
    if (!invite?.code) return;

    let cancelled = false;
    let intervalId: NodeJS.Timeout | null = null;

    const checkUsed = async () => {
      try {
        const { data, error } = await supabase
          .from("family_invites")
          .select("used, code")
          .eq("code", invite.code)
          .maybeSingle();

        if (error) {
          console.log("checkUsed error", error);
          return;
        }

        if (!cancelled) {
          console.log("checkUsed result =>", data);
        }

        if (!cancelled && data?.used && !hasNavigatedToSuccess) {
          setHasNavigatedToSuccess(true);
          navigation.navigate("InviteParentSuccess", { code: invite.code });
        }
      } catch (e) {
        if (!cancelled) {
          console.log("checkUsed exception", e);
        }
      }
    };

    // pirma karta – iškart patikrinam
    void checkUsed();
    // toliau – kas 3 sekundes
    intervalId = setInterval(checkUsed, PAIRING_STATUS_POLL_MS);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [invite?.code, hasNavigatedToSuccess, navigation]);

  const handleShare = async () => {
    if (!invite) return;

    try {
      await Share.share({
        message: t(
          "inviteParent.share_text",
          "Prisijunk prie mūsų šeimos Kidcan programėlėje su šiuo kodu: {{code}}",
          { code: invite.code }
        ),
      });
      // čia nieko daugiau – laukiame, kol kitas tėvas panaudos kodą,
      // ir polling efektas viršuje pats nuves į InviteParentSuccess
    } catch (e) {
      console.log("Share error", e);
    }
  };

  if (!invite && loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>
          {t("inviteParent.loading", "Generuojamas kodas...")}
        </Text>
      </View>
    );
  }

  if (!invite) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>
          {t("inviteParent.no_code_title", "Kodo nepavyko gauti")}
        </Text>
        <Text style={styles.subtitle}>
          {t(
            "inviteParent.no_code_subtitle",
            "Pabandyk dar kartą – jei nepavyks, patikrink interneto ryšį."
          )}
        </Text>
        <AppButton
          label={t("common.try_again", "Bandyti dar kartą")}
          onPress={loadInvite}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t("inviteParent.title", "Pakviesti kitą tėvą / mamą")}
      </Text>

      <Text style={styles.subtitle}>
        {t(
          "inviteParent.subtitle",
          "Kitas tėvas atsisiunčia Kidcan, pasirenka „Prisijungti prie šeimos“ ir įveda šį kodą:"
        )}
      </Text>

      <View style={styles.codeBox}>
        <Text style={styles.codeText}>{invite.code}</Text>
      </View>

      <Text style={styles.expiry}>
        {t("inviteParent.expires", {
          defaultValue: "Galioja iki: {{date}}",
          date: new Date(invite.expires_at).toLocaleString(),
        })}
      </Text>

      <AppButton
        label={t("inviteParent.share_button", "Pasidalinti kodu")}
        onPress={handleShare}
      />

      <View style={{ height: spacing.lg }} />

      <AppButton
        variant="light"
        label={t("inviteParent.refresh_button", "Sugeneruoti naują kodą")}
        onPress={loadInvite}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "#FEF7EC",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textMuted ?? "#8B7A67",
  },
  container: {
    flex: 1,
    backgroundColor: "#FEF7EC",
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#362F27",
  },
  subtitle: {
    fontSize: 14,
    color: "#8B7A67",
  },
  codeBox: {
    marginTop: spacing.lg,
    paddingVertical: spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2D6C5",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  codeText: {
    fontSize: 32,
    letterSpacing: 6,
    fontWeight: "700",
    color: "#362F27",
  },
  expiry: {
    fontSize: 12,
    color: "#8B7A67",
  },
});
