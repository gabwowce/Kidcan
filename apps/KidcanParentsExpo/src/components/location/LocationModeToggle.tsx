// src/components/location/LocationModeToggle.tsx
import React from "react";
import { StyleSheet, TouchableOpacity, type ViewStyle } from "react-native";
import type { LocationMode } from "../../screens/location/LocationsScreen";
import { GlassCard } from "../../theme/glassStyles";
import { AppText } from "../common/AppText";

type Props = {
  mode: LocationMode;
  onChangeMode: (mode: LocationMode) => void;
  style?: ViewStyle;
};

export const LocationModeToggle: React.FC<Props> = ({
  mode,
  onChangeMode,
  style,
}) => {
  const isMap = mode === "map";
  const isSafeZones = mode === "safeZones";

  return (
    <GlassCard style={StyleSheet.flatten([styles.wrapper, style])}>
      <TouchableOpacity
        style={[styles.button, isMap && styles.buttonActive]}
        onPress={() => onChangeMode("map")}
      >
        <AppText
          size={14}
          weight={isMap ? "heavy" : "bold"}
          style={[styles.text, isMap && styles.textActive]}
        >
          Map
        </AppText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isSafeZones && styles.buttonActive]}
        onPress={() => onChangeMode("safeZones")}
      >
        <AppText
          size={14}
          weight={isSafeZones ? "heavy" : "bold"}
          style={[styles.text, isSafeZones && styles.textActive]}
        >
          Safe Zones
        </AppText>
      </TouchableOpacity>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 44,
  },
  buttonActive: {
    backgroundColor: "#4B4B4B",
  },
  text: {
    color: "#4B4B4B",
  },
  textActive: {
    color: "#FFFFFF",
  },
});
