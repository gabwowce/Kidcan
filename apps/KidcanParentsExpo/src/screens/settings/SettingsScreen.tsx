// src/screens/settings/SettingsScreen.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  SectionList,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { supabase } from "../../api/supabaseClient";
import { Screen } from "../../components/layout/Screen";
import {
  SETTINGS_SECTIONS,
  SettingsItem,
  SettingsSection,
} from "../../config/settingsConfig";
import { useCurrentChild } from "../../context/CurrentChildContext";
import type { SettingsStackParamList } from "../../navigation/types";
import { useAppDispatch } from "../../store/hooks";
import { logoutThunk } from "../../store/slices/authSlice";
const TRACKING_PRESETS = {
  standard: {
    baseLocationMs: 300_000, // 5 min
    boostLocationMs: 60_000, // 1 min
    baseBatteryMs: 1_800_000, // 30 min
    boostBatteryMs: 300_000, // 5 min
  },
  high: {
    baseLocationMs: 60_000, // 1 min
    boostLocationMs: 20_000, // 20 s
    baseBatteryMs: 300_000, // 5 min
    boostBatteryMs: 60_000, // 1 min
  },
} as const;
type Props = NativeStackScreenProps<SettingsStackParamList, "SettingsHome">;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { currentChildId } = useCurrentChild();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [toggles, setToggles] = useState<Record<string, boolean>>({});

  async function updateTrackingSettingsOnServer(
    profile: "standard" | "high",
    childId: number | null
  ) {
    if (!childId) {
      Alert.alert(
        "Vaikas nepasirinktas",
        "Pirmiausia pasirink vaiką pagrindiniame lange."
      );
      return;
    }

    const cfg = TRACKING_PRESETS[profile];

    const { data, error } = await supabase.functions.invoke("child_commands", {
      body: {
        action: "update_tracking_config_profile",
        childId,
        // 👇 realūs skaičiai iš RN
        baseLocationMs: cfg.baseLocationMs,
        boostLocationMs: cfg.boostLocationMs,
        baseBatteryMs: cfg.baseBatteryMs,
        boostBatteryMs: cfg.boostBatteryMs,
      },
    });

    if (error || !data?.ok) {
      console.log("update-tracking-config-profile error", error, data);
      Alert.alert(
        "Klaida",
        "Nepavyko atnaujinti sekimo nustatymų. Bandyk vėliau."
      );
    }
  }

  useEffect(() => {
    (async () => {
      const initial: Record<string, boolean> = {};
      for (const section of SETTINGS_SECTIONS) {
        for (const item of section.data) {
          if (item.type === "toggle") {
            const stored = await AsyncStorage.getItem(item.storageKey);
            initial[item.id] =
              stored !== null ? stored === "true" : item.defaultValue;
          }
        }
      }
      setToggles(initial);
    })();
  }, []);

  const handleToggle = async (
    itemId: string,
    storageKey: string,
    value: boolean
  ) => {
    setToggles((prev) => ({ ...prev, [itemId]: value }));
    await AsyncStorage.setItem(storageKey, value ? "true" : "false");
  };

  const handlePress = (item: SettingsItem) => {
    if (item.type === "navigation") {
      navigation.navigate(item.targetScreen as any, item.params);
      return;
    }

    if (item.type === "action") {
      switch (item.actionId) {
        case "logout":
          Alert.alert(
            t("settings.logout.title", "Atsijungti"),
            t("settings.logout.message", "Ar tikrai nori atsijungti?"),
            [
              {
                text: t("common.cancel", "Atšaukti"),
                style: "cancel",
              },
              {
                text: t("settings.logout.confirm", "Atsijungti"),
                style: "destructive",
                onPress: () => {
                  // svarbu: logout nieko nedaro su hasCompletedOnboarding,
                  // tai po logout tave mes į AUTH, ne į Welcome
                  dispatch(logoutThunk());
                },
              },
            ]
          );
          break;

        case "addChild":
          navigation.navigate("AddChildName");
          break;
        case "inviteParent":
          navigation.navigate("InviteParent");
          break;

        case "debugLog":
          // jei turėsi debug log'ą – pridėsi čia
          break;

        case "trackingConfig":
          Alert.alert(
            t("settings.app.trackingConfig", "Lokacijos atnaujinimo dažnis"),
            t(
              "settings.app.trackingConfig_dialog",
              "Pasirink, kaip dažnai atnaujinti vaiko lokaciją."
            ),
            [
              {
                text: t(
                  "settings.app.trackingConfig.standard",
                  "Standartinis (taupo bateriją)"
                ),
                onPress: () => {
                  updateTrackingSettingsOnServer("standard", currentChildId);
                },
              },
              {
                text: t(
                  "settings.app.trackingConfig.high",
                  "Dažnesnis (daugiau baterijos)"
                ),
                onPress: () => {
                  updateTrackingSettingsOnServer("high", currentChildId);
                },
              },
              {
                text: t("common.cancel", "Atšaukti"),
                style: "cancel",
              },
            ]
          );
          break;

        case "deleteAccount":
          // TODO: ateity – account delete flow
          break;
      }
    }
  };

  const renderItem = ({
    item,
  }: {
    item: SettingsItem;
    index: number;
    section: SettingsSection;
  }) => {
    const content = (
      <View style={styles.rowInner}>
        <View style={styles.rowTextWrapper}>
          <Text style={styles.rowTitle}>{t(item.titleKey)}</Text>
          {item.subtitleKey && (
            <Text style={styles.rowSubtitle}>{t(item.subtitleKey)}</Text>
          )}
        </View>

        {item.type === "toggle" ? (
          <Switch
            value={toggles[item.id] ?? item.defaultValue}
            onValueChange={(val) => handleToggle(item.id, item.storageKey, val)}
            trackColor={{ false: "#D9CBB9", true: "#FF6B3D" }}
            thumbColor="#FFFFFF"
          />
        ) : (
          <View style={styles.chevronPlaceholder} />
        )}
      </View>
    );

    if (item.type === "navigation" || item.type === "action") {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handlePress(item)}
          style={styles.rowCard}
        >
          {content}
        </TouchableOpacity>
      );
    }

    // toggle – be onPress (tik per Switch)
    return <View style={styles.rowCard}>{content}</View>;
  };

  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerBadge} />
      </View>

      <SectionList<SettingsItem, SettingsSection>
        sections={SETTINGS_SECTIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        renderSectionHeader={({ section }) =>
          section.titleKey ? (
            <Text style={styles.sectionTitle}>{t(section.titleKey)}</Text>
          ) : null
        }
        SectionSeparatorComponent={() => (
          <View style={styles.sectionSeparator} />
        )}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#FEF7EC",
  },

  header: {
    marginTop: 4,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#362F27",
    fontSize: 24,
    fontWeight: "700",
  },
  headerBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFE3BF",
  },

  listContent: {
    paddingBottom: 24,
  },

  sectionTitle: {
    marginTop: 8,
    marginBottom: 6,
    color: "#8B7A67",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  sectionSeparator: {
    height: 16,
  },

  rowCard: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  rowInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rowTextWrapper: {
    flexShrink: 1,
    paddingRight: 12,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#362F27",
  },
  rowSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#8B7A67",
  },

  chevronPlaceholder: {
    width: 18,
    height: 18,
  },

  itemSeparator: {
    height: 8,
  },
});

export default SettingsScreen;
