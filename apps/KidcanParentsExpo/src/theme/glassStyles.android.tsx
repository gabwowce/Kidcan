import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

export const glassCardBase: ViewStyle = {
  // beveik pilnai balta plokštė
  backgroundColor: "rgba(255,255,255,0.92)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.95)",

  // Drop shadow: X:0, Y:1, Blur:4, Color: #000, 25 %
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 4,
  shadowOpacity: 0.25,
  elevation: 3,

  borderRadius: 10,
  overflow: "hidden",
};

type GlassCardProps = {
  style?: ViewStyle;
  children: React.ReactNode;
};

export const GlassCard: React.FC<GlassCardProps> = ({ style, children }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: glassCardBase,
});
