import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { createPairing } from "../../../api/pairing";
import { AppButton } from "../../../components/common/AppButton";
import { AppText } from "../../../components/common/AppText";
import { SelectableCard } from "../../../components/common/SelectableCard";
import { OnboardingScreen } from "../../../components/onboarding/OnboardingScreen";
import { useOnboarding } from "../../../context/OnboardingContext";
import type { SettingsStackParamList } from "../../../navigation/types";
import { colors, spacing } from "../../../theme";

type Gender = "daughter" | "son";
type Props = NativeStackScreenProps<SettingsStackParamList, "AddChildGender">;

const AddChildGenderScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childName } = route.params;
  const { parentRole } = useOnboarding();

  const [gender, setGender] = useState<Gender | null>(null);
  const [loading, setLoading] = useState(false);

  const canContinue = !!gender && !loading;

  const handleContinue = async () => {
    if (!gender) return;

    if (!parentRole) {
      Alert.alert(
        "Trūksta rolės",
        "Nerandam tavo rolės (pagrindinis tėvas / papildomas tėvas). Prisijunk iš naujo arba pereik onboarding."
      );
      return;
    }

    try {
      setLoading(true);

      const { code, child_id } = await createPairing(
        childName,
        gender,
        parentRole
      );

      if (!code || !child_id) {
        console.log("createPairing unexpected response", { code, child_id });
        Alert.alert("Klaida", "Nepavyko sugeneruoti kodo. Bandyk dar kartą.");
        return;
      }

      const formatted = code.replace(/(\d{3})(\d{3})/, "$1 $2");

      navigation.replace("AddChildShowPairingCode", {
        pairingCode: formatted,
        rawCode: code,
        childId: child_id,
        childName,
      });
    } catch (e) {
      console.log("AddChild gender -> create pairing error", e);
      Alert.alert("Klaida", "Nepavyko sugeneruoti kodo. Bandyk dar kartą.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingScreen
      footer={
        <AppButton
          label={loading ? "Creating..." : "Continue"}
          onPress={handleContinue}
          disabled={!canContinue}
        />
      }
    >
      <View style={styles.content}>
        <AppText
          size={20}
          weight="heavy"
          color={colors.textDark}
          style={styles.title}
        >
          {`Is ${childName || "your kid"} a\nson or daughter?`}
        </AppText>

        <View style={styles.optionsRow}>
          <SelectableCard
            variant="tile"
            style={styles.tile}
            label="Daughter"
            icon={<AppText size={28}>👧</AppText>}
            selected={gender === "daughter"}
            onPress={() => setGender("daughter")}
          />
          <SelectableCard
            variant="tile"
            style={styles.tile}
            label="Son"
            icon={<AppText size={28}>👦</AppText>}
            selected={gender === "son"}
            onPress={() => setGender("son")}
          />
        </View>
      </View>
    </OnboardingScreen>
  );
};

export default AddChildGenderScreen;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  title: { textAlign: "center", marginBottom: 28 },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  tile: { width: "48%" },
});
