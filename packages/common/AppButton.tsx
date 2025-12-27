import React, { type ReactNode } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { spacing } from "../../theme";
import { AppText } from "./AppText";

type ButtonVariant = "primary" | "light" | "dark";

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  iconLeft?: ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;

  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
};

const PRIMARY_BG = "#0065F4";
const PRIMARY_BORDER = "#004FE0";
const SECONDARY_BORDER = "#E6E7EB";

export const AppButton: React.FC<Props> = ({
  label,
  onPress,
  variant = "primary",
  iconLeft,
  disabled = false,
  style,
  textStyle,
  backgroundColor,
  textColor,
  borderColor,
}) => {
  const palette = getVariantStyles(variant);

  const bg = backgroundColor ?? palette.backgroundColor;
  const txt = textColor ?? palette.textColor;
  const border = borderColor ?? palette.borderColor;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        palette.extraWrapperStyle,
        {
          backgroundColor: bg,
          borderColor: border,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.contentRow}>
        {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}
        <AppText
          size={16}
          weight="bold"
          color={txt}
          style={[styles.label, textStyle]}
        >
          {label}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};

function getVariantStyles(variant: ButtonVariant) {
  switch (variant) {
    case "light":
      return {
        backgroundColor: "#FFFFFF",
        textColor: PRIMARY_BG,
        borderColor: SECONDARY_BORDER,
        extraWrapperStyle: {
          borderTopWidth: 2,
          borderLeftWidth: 2,
          borderRightWidth: 2,
          borderBottomWidth: 6,
        } as ViewStyle,
      };
    case "dark":
      return {
        backgroundColor: "#000000",
        textColor: "#FFFFFF",
        borderColor: "#495564",
        extraWrapperStyle: {
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderBottomWidth: 6,
        } as ViewStyle,
      };
    case "primary":
    default:
      return {
        backgroundColor: PRIMARY_BG,
        textColor: "#FFFFFF",
        borderColor: PRIMARY_BORDER,
        extraWrapperStyle: {
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderBottomWidth: 6,
        } as ViewStyle,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
    height: 54, // ✅ fiksuotas aukštis
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: 0, // kad aukštį valdytų 'height'
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY_BG,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  label: {
    textAlign: "center",
  },
});
