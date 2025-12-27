// src/screens/settings/TrackingSettingsScreen.tsx
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { supabase } from "../../api/supabaseClient";
import { Screen } from "../../components/layout/Screen";
import { useCurrentChild } from "../../context/CurrentChildContext";
import type { SettingsStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<SettingsStackParamList, "TrackingSettings">;

const TRACKING_PRESETS = {
  standard: {
    baseLocationMin: 5,
    boostLocationMin: 1,
    baseBatteryMin: 30,
    boostBatteryMin: 5,
  },
  high: {
    baseLocationMin: 1,
    boostLocationMin: 0.33, // ~20 s
    baseBatteryMin: 5,
    boostBatteryMin: 1,
  },
} as const;

type TrackingMode = "standard" | "high" | "custom";

type MinutesCfg = {
  baseLocationMin: number;
  boostLocationMin: number;
  baseBatteryMin: number;
  boostBatteryMin: number;
};

export const TrackingSettingsScreen: React.FC<Props> = () => {
  const { t } = useTranslation();
  const { currentChildId } = useCurrentChild();

  // kas dabar galioja (tik parodui)
  const [currentCfg, setCurrentCfg] = useState<MinutesCfg | null>(null);

  // forma (būsimi nustatymai)
  const [baseLocation, setBaseLocation] = useState<string>(
    String(TRACKING_PRESETS.standard.baseLocationMin)
  );
  const [boostLocation, setBoostLocation] = useState<string>(
    String(TRACKING_PRESETS.standard.boostLocationMin)
  );
  const [baseBattery, setBaseBattery] = useState<string>(
    String(TRACKING_PRESETS.standard.baseBatteryMin)
  );
  const [boostBattery, setBoostBattery] = useState<string>(
    String(TRACKING_PRESETS.standard.boostBatteryMin)
  );
  const [mode, setMode] = useState<TrackingMode>("standard");
  const [saving, setSaving] = useState(false);

  // helper lyginti su presetais
  const isClose = (a: number, b: number) => Math.abs(a - b) < 0.01;

  useEffect(() => {
    if (!currentChildId) return;

    const loadFromServer = async () => {
      try {
        const { data, error } = await supabase
          .from("tracking_settings")
          .select(
            "base_location_interval_ms, boost_location_interval_ms, base_battery_interval_ms, boost_battery_interval_ms"
          )
          .eq("child_id", currentChildId)
          .maybeSingle();

        if (error) {
          console.log("tracking_settings load error", error);
          return;
        }
        if (!data) return;

        const toMin = (ms: number) => ms / 60_000;

        const cfg: MinutesCfg = {
          baseLocationMin: toMin(data.base_location_interval_ms),
          boostLocationMin: toMin(data.boost_location_interval_ms),
          baseBatteryMin: toMin(data.base_battery_interval_ms),
          boostBatteryMin: toMin(data.boost_battery_interval_ms),
        };

        setCurrentCfg(cfg);

        // forma startuoja nuo dabartinių
        setBaseLocation(String(cfg.baseLocationMin));
        setBoostLocation(String(cfg.boostLocationMin));
        setBaseBattery(String(cfg.baseBatteryMin));
        setBoostBattery(String(cfg.boostBatteryMin));

        // pabandom atpažinti presetą
        if (
          isClose(
            cfg.baseLocationMin,
            TRACKING_PRESETS.standard.baseLocationMin
          ) &&
          isClose(
            cfg.boostLocationMin,
            TRACKING_PRESETS.standard.boostLocationMin
          ) &&
          isClose(
            cfg.baseBatteryMin,
            TRACKING_PRESETS.standard.baseBatteryMin
          ) &&
          isClose(
            cfg.boostBatteryMin,
            TRACKING_PRESETS.standard.boostBatteryMin
          )
        ) {
          setMode("standard");
        } else if (
          isClose(cfg.baseLocationMin, TRACKING_PRESETS.high.baseLocationMin) &&
          isClose(
            cfg.boostLocationMin,
            TRACKING_PRESETS.high.boostLocationMin
          ) &&
          isClose(cfg.baseBatteryMin, TRACKING_PRESETS.high.baseBatteryMin) &&
          isClose(cfg.boostBatteryMin, TRACKING_PRESETS.high.boostBatteryMin)
        ) {
          setMode("high");
        } else {
          setMode("custom");
        }
      } catch (e) {
        console.log("loadFromServer exception", e);
      }
    };

    void loadFromServer();
  }, [currentChildId]);

  const applyPreset = (profile: "standard" | "high") => {
    const p = TRACKING_PRESETS[profile];
    setMode(profile);
    setBaseLocation(String(p.baseLocationMin));
    setBoostLocation(String(p.boostLocationMin));
    setBaseBattery(String(p.baseBatteryMin));
    setBoostBattery(String(p.boostBatteryMin));
  };

  const handleSave = async () => {
    if (!currentChildId) {
      Alert.alert(
        "Vaikas nepasirinktas",
        "Pirmiausia pasirink vaiką pagrindiniame lange."
      );
      return;
    }

    const baseLocMin = Number(baseLocation);
    const boostLocMin = Number(boostLocation);
    const baseBatMin = Number(baseBattery);
    const boostBatMin = Number(boostBattery);

    if (
      !isFinite(baseLocMin) ||
      !isFinite(boostLocMin) ||
      !isFinite(baseBatMin) ||
      !isFinite(boostBatMin) ||
      baseLocMin <= 0 ||
      boostLocMin <= 0 ||
      baseBatMin <= 0 ||
      boostBatMin <= 0
    ) {
      Alert.alert("Neteisingos reikšmės", "Visi laukai turi būti > 0.");
      return;
    }

    const baseLocationMs = Math.round(baseLocMin * 60_000);
    const boostLocationMs = Math.round(boostLocMin * 60_000);
    const baseBatteryMs = Math.round(baseBatMin * 60_000);
    const boostBatteryMs = Math.round(boostBatMin * 60_000);

    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "child_commands",
        {
          body: {
            action: "update_tracking_config_profile",
            childId: currentChildId,
            baseLocationMs,
            boostLocationMs,
            baseBatteryMs,
            boostBatteryMs,
          },
        }
      );

      if (error || !data?.ok) {
        console.log("update-tracking-config-profile error", error, data);
        Alert.alert(
          "Klaida",
          "Nepavyko išsaugoti sekimo nustatymų. Bandyk vėliau."
        );
        return;
      }

      // atsinaujinam „dabartinius“
      setCurrentCfg({
        baseLocationMin: baseLocMin,
        boostLocationMin: boostLocMin,
        baseBatteryMin: baseBatMin,
        boostBatteryMin: boostBatMin,
      });

      Alert.alert("Išsaugota", "Sekimo nustatymai atnaujinti.");
    } finally {
      setSaving(false);
    }
  };

  const inputEditable = mode === "custom";

  return (
    <Screen
      scroll
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Sekimo nustatymai</Text>
      <Text style={styles.subtitle}>
        Nustatyk, kas kiek laiko siųsti vaiko lokaciją ir baterijos lygį.
      </Text>

      {currentChildId && currentCfg && (
        <View style={styles.currentCard}>
          <Text style={styles.currentTitle}>Dabar naudojama</Text>
          <Text style={styles.currentLine}>
            Lokacija fone: {currentCfg.baseLocationMin} min
          </Text>
          <Text style={styles.currentLine}>
            Lokacija žiūrint žemėlapį: {currentCfg.boostLocationMin} min
          </Text>
          <Text style={styles.currentLine}>
            Baterija fone: {currentCfg.baseBatteryMin} min
          </Text>
          <Text style={styles.currentLine}>
            Baterija žiūrint žemėlapį: {currentCfg.boostBatteryMin} min
          </Text>
        </View>
      )}

      <Text style={styles.info}>
        Bazinis intervalas naudojamas fone, kai programėlės aktyviai nestebi.
        Boost intervalas įsijungia tada, kai esi atsivertusi vaiko žemėlapį ar
        suvestinę — duomenys atnaujinami dažniau, bet labiau naudojama baterija.
      </Text>

      {/* režimo pasirinkimas */}
      <View style={styles.presetRow}>
        <TouchableOpacity
          style={[
            styles.presetButton,
            mode === "standard" && styles.presetButtonActive,
          ]}
          onPress={() => applyPreset("standard")}
        >
          <Text
            style={[
              styles.presetText,
              mode === "standard" && styles.presetTextActive,
            ]}
          >
            Standartinis
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.presetButton,
            mode === "high" && styles.presetButtonActive,
          ]}
          onPress={() => applyPreset("high")}
        >
          <Text
            style={[
              styles.presetText,
              mode === "high" && styles.presetTextActive,
            ]}
          >
            Dažnas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.presetButton,
            mode === "custom" && styles.presetButtonActive,
          ]}
          onPress={() => setMode("custom")}
        >
          <Text
            style={[
              styles.presetText,
              mode === "custom" && styles.presetTextActive,
            ]}
          >
            Mano nustatyti
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Lokacija (bazinė – fone, min.)</Text>
          <TextInput
            value={baseLocation}
            onChangeText={setBaseLocation}
            keyboardType="numeric"
            editable={inputEditable}
            style={[styles.input, !inputEditable && styles.inputDisabled]}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Lokacija (boost – kai žiūri žemėlapį, min.)
          </Text>
          <TextInput
            value={boostLocation}
            onChangeText={setBoostLocation}
            keyboardType="numeric"
            editable={inputEditable}
            style={[styles.input, !inputEditable && styles.inputDisabled]}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Baterija (bazinė – fone, min.)</Text>
          <TextInput
            value={baseBattery}
            onChangeText={setBaseBattery}
            keyboardType="numeric"
            editable={inputEditable}
            style={[styles.input, !inputEditable && styles.inputDisabled]}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Baterija (boost – kai žiūri žemėlapį, min.)
          </Text>
          <TextInput
            value={boostBattery}
            onChangeText={setBoostBattery}
            keyboardType="numeric"
            editable={inputEditable}
            style={[styles.input, !inputEditable && styles.inputDisabled]}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "Saugoma..." : "Išsaugoti"}
        </Text>
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#FEF7EC",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#362F27",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#8B7A67",
    marginBottom: 12,
  },
  currentCard: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2D5C3",
  },
  currentTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#362F27",
    marginBottom: 4,
  },
  currentLine: {
    fontSize: 12,
    color: "#8B7A67",
  },
  info: {
    fontSize: 13,
    color: "#8B7A67",
    marginBottom: 16,
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#FFE3BF",
    alignItems: "center",
    justifyContent: "center",
  },
  presetButtonActive: {
    backgroundColor: "#FF6B3D",
  },
  presetText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#362F27",
  },
  presetTextActive: {
    color: "#FFFFFF",
  },
  form: {
    gap: 12,
    marginBottom: 24,
  },
  field: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    color: "#362F27",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2D5C3",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    fontSize: 14,
    color: "#362F27",
  },
  inputDisabled: {
    backgroundColor: "#F4EBE0",
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: "#FF6B3D",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default TrackingSettingsScreen;
