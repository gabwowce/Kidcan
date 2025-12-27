// src/components/dashboard/ChildCard.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { SvgProps } from "react-native-svg";
import { colors } from "../../theme";
import { AppText } from "../common/AppText";

// SVG IMPORTAI KAIP KOMPONENTAI
import Battery10 from "../../assets/battery/10.svg";
import Battery100 from "../../assets/battery/100.svg";
import Battery20 from "../../assets/battery/20.svg";
import Battery30 from "../../assets/battery/30.svg";
import Battery40 from "../../assets/battery/40.svg";
import Battery50 from "../../assets/battery/50.svg";
import Battery60 from "../../assets/battery/60.svg";
import Battery70 from "../../assets/battery/70.svg";
import Battery80 from "../../assets/battery/80.svg";
import Battery90 from "../../assets/battery/90.svg";

export type ChildCardData = {
  id: number;
  name: string;
  battery: number | null;
  gender?: "son" | "daughter" | null;
  isActive?: boolean;
  pairedAt?: string | null;
  color?: string;
};

type Props = {
  child: ChildCardData;
  onPress: () => void;
  selected?: boolean;
};

type BatteryIconComponent = React.ComponentType<SvgProps>;

const BATTERY_ICONS: Record<number, BatteryIconComponent> = {
  10: Battery10,
  20: Battery20,
  30: Battery30,
  40: Battery40,
  50: Battery50,
  60: Battery60,
  70: Battery70,
  80: Battery80,
  90: Battery90,
  100: Battery100,
};

function getBatteryVisual(battery: number | null) {
  let color = "#6B7281";

  if (battery == null) return { color, level: null as number | null };

  let level: number;
  if (battery <= 10) level = 10;
  else if (battery <= 20) level = 20;
  else if (battery <= 30) level = 30;
  else if (battery <= 40) level = 40;
  else if (battery <= 50) level = 50;
  else if (battery <= 60) level = 60;
  else if (battery <= 70) level = 70;
  else if (battery <= 80) level = 80;
  else if (battery <= 90) level = 90;
  else level = 100;

  return { color, level };
}

export const ChildCard: React.FC<Props> = ({ child, onPress, selected }) => {
  const batteryLabel =
    child.battery == null ? "—" : `${child.battery.toString()}%`;

  const { color: batteryColor, level } = getBatteryVisual(child.battery);
  const BatteryIcon = level ? BATTERY_ICONS[level] : null;

  const emoji =
    child.gender === "son" ? "👦" : child.gender === "daughter" ? "👧" : "🙂";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.card,
        selected ? styles.cardSelected : styles.cardUnselected,
      ]}
    >
      <View style={styles.avatarWrapper}>
        <View
          style={[
            styles.avatarCircle,
            { backgroundColor: child.color ?? "#FCA55D" },
          ]}
        >
          <Text style={styles.avatarEmoji}>{emoji}</Text>
        </View>
      </View>

      <View style={styles.infoCol}>
        <AppText size={12} weight="heavy" style={styles.name} numberOfLines={1}>
          {child.name}
        </AppText>

        <View style={styles.batteryPill}>
          <AppText
            size={10}
            weight="heavy"
            style={[styles.batteryText, { color: batteryColor }]}
          >
            {batteryLabel}
          </AppText>

          {child.battery != null && BatteryIcon && (
            <BatteryIcon width={14} height={14} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "auto",
    height: 90,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 21,
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFF",
  },
  cardUnselected: {
    borderWidth: 2,
    borderColor: "#F2E0C2",
  },
  cardSelected: {
    borderWidth: 3,
    borderColor: "#00B4FC",
  },
  avatarWrapper: {
    marginRight: 10,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: {
    fontSize: 20,
  },
  infoCol: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    color: colors.textDark ?? "#4B4B4B",
    marginBottom: 8,
  },
  batteryPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
    backgroundColor: "#F3F4F6",
    gap: 4,
  },
  batteryText: {
    marginRight: 2,
  },
});
