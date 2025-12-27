import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../api/supabaseClient";
import { Screen } from "../../components/layout/Screen";
import type { SettingsStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<SettingsStackParamList, "AddChild">;

type Gender = "girl" | "boy" | "other";

export const AddChildScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("girl");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => name.trim().length >= 2 && !loading,
    [name, loading]
  );

  const handleCreate = async () => {
    const cleanName = name.trim();

    if (cleanName.length < 2) {
      Alert.alert("Per trumpas vardas", "Įvesk bent 2 simbolius.");
      return;
    }

    try {
      setLoading(true);

      // ✅ pakeisk į tavo realų endpointą:
      // - jei turėjot RPC: supabase.rpc(...)
      // - jei turėjot Edge Function: supabase.functions.invoke(...)
      const { data, error } = await supabase.functions.invoke("family", {
        body: {
          action: "create_child_and_pairing_code",
          name: cleanName,
          gender,
        },
      });

      if (error || !data?.code) {
        console.log("AddChild error", error, data);
        Alert.alert("Klaida", "Nepavyko sukurti vaiko. Bandyk dar kartą.");
        return;
      }

      // data.code -> pairing kodukas
      navigation.replace("InviteParentSuccess", { code: data.code });
    } catch (e) {
      console.log(e);
      Alert.alert("Klaida", "Įvyko klaida. Bandyk vėliau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll style={styles.screen}>
      <Text style={styles.title}>Add child</Text>
      <Text style={styles.subtitle}>
        Įvesk vaiko duomenis ir sugeneruosim kodą vaiko telefonui.
      </Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. Gabrielė"
        placeholderTextColor="#B7A692"
        style={styles.input}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
      />

      <Text style={[styles.label, { marginTop: 14 }]}>Gender</Text>
      <View style={styles.genderRow}>
        <GenderPill
          label="Girl"
          active={gender === "girl"}
          onPress={() => setGender("girl")}
        />
        <GenderPill
          label="Boy"
          active={gender === "boy"}
          onPress={() => setGender("boy")}
        />
        <GenderPill
          label="Other"
          active={gender === "other"}
          onPress={() => setGender("other")}
        />
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        disabled={!canSubmit}
        onPress={handleCreate}
        style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.primaryBtnText}>Create & get code</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.goBack()}
        style={styles.secondaryBtn}
      >
        <Text style={styles.secondaryBtnText}>Cancel</Text>
      </TouchableOpacity>
    </Screen>
  );
};

const GenderPill = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={[styles.genderPill, active && styles.genderPillActive]}
  >
    <Text
      style={[styles.genderPillText, active && styles.genderPillTextActive]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  screen: { backgroundColor: "#FEF7EC" },
  title: { fontSize: 22, fontWeight: "800", color: "#362F27", marginTop: 6 },
  subtitle: { marginTop: 6, color: "#8B7A67", fontSize: 13, lineHeight: 18 },

  label: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#362F27",
  },

  input: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    color: "#362F27",
  },

  genderRow: { flexDirection: "row", gap: 10 },

  genderPill: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  genderPillActive: { backgroundColor: "#1F2937", borderColor: "transparent" },
  genderPillText: { fontSize: 14, fontWeight: "700", color: "#111827" },
  genderPillTextActive: { color: "#FFFFFF" },

  primaryBtn: {
    marginTop: 18,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FF6B3D",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },

  secondaryBtn: {
    marginTop: 10,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  secondaryBtnText: { color: "#362F27", fontSize: 14, fontWeight: "700" },
});
