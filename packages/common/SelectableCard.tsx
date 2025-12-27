// src/components/common/SelectableCard.tsx
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { AppText } from "./AppText";

type Variant = "row" | "tile";

type Props = {
  label: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  variant?: Variant; // default: "row"
  style?: StyleProp<ViewStyle>;
};

const CARD_BORDER = "#E6E7EB"; // neselected stroke
const CARD_BG_SELECTED = "#D9F5FF";
const CARD_BORDER_SELECTED = "#00B4FC";

export const SelectableCard: React.FC<Props> = ({
  label,
  icon,
  selected = false,
  onPress,
  variant = "row",
  style,
}) => {
  const isTile = variant === "tile";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.cardBase,
        isTile ? styles.cardTile : styles.cardRow,
        selected && (isTile ? styles.cardTileSelected : styles.cardRowSelected),
        style,
      ]}
    >
      {isTile ? (
        <>
          {selected && (
            <View style={styles.checkWrapperTile}>
              <AppText size={13} weight="heavy" color="#FFFFFF">
                ✓
              </AppText>
            </View>
          )}

          <View style={styles.tileCenter}>
            {icon && <View style={styles.iconWrapperTile}>{icon}</View>}
            <AppText size={16} weight="bold" color="#4B4B4B">
              {label}
            </AppText>
          </View>
        </>
      ) : (
        <>
          <View style={styles.leftRow}>
            {icon && <View style={styles.iconWrapperRow}>{icon}</View>}
            <AppText size={16} weight="bold" color="#4B4B4B">
              {label}
            </AppText>
          </View>

          {selected && (
            <View style={styles.checkWrapperRow}>
              <AppText size={13} weight="heavy" color="#FFFFFF">
                ✓
              </AppText>
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },

  // --- ROW variant (languages) ---
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 18,

    // border kaip Figma: top/left/right = 2, bottom = 0
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 6,
    borderColor: CARD_BORDER,
  },
  cardRowSelected: {
    backgroundColor: CARD_BG_SELECTED,
    borderColor: CARD_BORDER_SELECTED,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapperRow: {
    marginRight: 10,
  },
  checkWrapperRow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CARD_BORDER_SELECTED,
  },

  // --- TILE variant (roles grid) ---
  cardTile: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",

    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 6,
    borderColor: CARD_BORDER,
  },
  cardTileSelected: {
    backgroundColor: CARD_BG_SELECTED,
    borderColor: CARD_BORDER_SELECTED,
  },
  tileCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperTile: {
    marginBottom: 6,
  },
  checkWrapperTile: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CARD_BORDER_SELECTED,
  },
});
