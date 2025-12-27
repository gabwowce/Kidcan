// src/theme/glassStyles.ios.tsx
import { BlurView } from "expo-blur";
import React from "react";
import {
  StyleSheet as RNStyleSheet,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";

export const glassCardBase: ViewStyle = {
  backgroundColor: "rgba(255,255,255,0.8)",
};

type GlassCardProps = {
  style?: ViewStyle;
  children: React.ReactNode;
};

// Bendra helper funkcija – su šešėliu ir negriauna layout'o
function GlassWithShadow({ style, children }: GlassCardProps) {
  const flat = RNStyleSheet.flatten(style) || {};
  const radius = flat.borderRadius ?? 10;

  // Layout dalis, kuri turi galioti wrapper'iui (šešėliui)
  const wrapperLayout: ViewStyle = {};
  if (flat.width != null) wrapperLayout.width = flat.width;
  if (flat.height != null) wrapperLayout.height = flat.height;
  if (flat.flex != null) wrapperLayout.flex = flat.flex;
  if (flat.flexGrow != null) wrapperLayout.flexGrow = flat.flexGrow;
  if (flat.flexShrink != null) wrapperLayout.flexShrink = flat.flexShrink;
  if (flat.alignSelf != null) wrapperLayout.alignSelf = flat.alignSelf;
  if (flat.margin != null) wrapperLayout.margin = flat.margin;
  if (flat.marginHorizontal != null)
    wrapperLayout.marginHorizontal = flat.marginHorizontal;
  if (flat.marginVertical != null)
    wrapperLayout.marginVertical = flat.marginVertical;
  if (flat.marginTop != null) wrapperLayout.marginTop = flat.marginTop;
  if (flat.marginBottom != null) wrapperLayout.marginBottom = flat.marginBottom;
  if (flat.marginLeft != null) wrapperLayout.marginLeft = flat.marginLeft;
  if (flat.marginRight != null) wrapperLayout.marginRight = flat.marginRight;

  return (
    <View
      style={[styles.shadowWrapper, wrapperLayout, { borderRadius: radius }]}
    >
      <BlurView
        intensity={20}
        tint="light"
        // visi padding/flexDirection ir t.t. lieka čia
        style={[styles.blurBase, { borderRadius: radius }, style]}
      >
        {children}
      </BlurView>
    </View>
  );
}

// 🟦 SU ŠEŠĖLIU – LocationModeToggle (ir gali likti kur jau naudota)
export const GlassCard: React.FC<GlassCardProps> = (props) => {
  return <GlassWithShadow {...props} />;
};

// 🟩 TAIP PAT SU ŠEŠĖLIU – bet skirtas LocationBottomInfo ir LocationGpsButton
export const FlatGlassCard: React.FC<GlassCardProps> = (props) => {
  return <GlassWithShadow {...props} />;
};

const styles = StyleSheet.create({
  // šešėlis
  shadowWrapper: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    shadowOpacity: 0.25,
  },
  // stiklas
  blurBase: {
    ...glassCardBase,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
});

export default GlassCard;
