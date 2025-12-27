// src/components/location/LocationGpsButton.tsx
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { GlassCard } from "../../theme/glassStyles";

export type LocationGpsButtonVariant = "map" | "dashboard";

type Props = {
  variant?: LocationGpsButtonVariant;
  style?: ViewStyle;
  onPress?: () => void;
};

export const LocationGpsButton: React.FC<Props> = ({
  variant = "map",
  style,
  onPress,
}) => {
  const isMap = variant === "map";

  return (
    <GlassCard style={[isMap ? styles.mapBtn : styles.dashboardBtn, style]}>
      <Feather
        name="navigation"
        size={18}
        color="#0065F4"
        // kad būtų paspaudžiamas
        onPress={onPress}
      />
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  // didesnis, kad sutaptų su 68px kortele
  mapBtn: {
    width: 50,
    height: 68,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  // mažas „pill“ dashboard'ui
  dashboardBtn: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
