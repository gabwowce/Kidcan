// src/components/common/AppText.tsx
import React from "react";
import { Text, type TextProps, type TextStyle } from "react-native";

type AppFontWeight = "medium" | "bold" | "heavy";

type Props = TextProps & {
  size?: number; // fontSize
  weight?: AppFontWeight; // Gilroy family
  color?: string; // tekstas
  style?: TextStyle | TextStyle[];
};

const FONT_FAMILY_MAP: Record<AppFontWeight, string> = {
  heavy: "Gilroy-Heavy",
  bold: "Gilroy-Bold",
  medium: "Gilroy-Medium",
};

const DEFAULT_COLOR = "#4B4B4B";
const DEFAULT_SIZE = 20;

export const AppText: React.FC<Props> = ({
  size = DEFAULT_SIZE,
  weight = "heavy",
  color = DEFAULT_COLOR,
  style,
  children,
  ...rest
}) => {
  const lineHeight = Math.round(size * 1.35); // ~Figma „Auto“

  const base: TextStyle = {
    fontFamily: FONT_FAMILY_MAP[weight],
    fontSize: size,
    lineHeight,
    color,
  };

  return (
    <Text style={[base, style]} {...rest}>
      {children}
    </Text>
  );
};
