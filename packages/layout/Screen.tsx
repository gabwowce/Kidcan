// src/components/layout/Screen.tsx
import React from "react";
import {
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  padding?: number;
  noTopInset?: boolean; // 👈 naujas flag'as
} & ScrollViewProps;

export const Screen: React.FC<Props> = ({
  children,
  scroll = false,
  style,
  padding,
  contentContainerStyle,
  noTopInset = false,
  ...scrollProps
}) => {
  const insets = useSafeAreaInsets();
  const p = padding ?? 16;

  const containerStyle: ViewStyle = {
    flex: 1,
    paddingTop: noTopInset ? 0 : insets.top,
    paddingBottom: insets.bottom,
    paddingHorizontal: p,
  };

  if (scroll) {
    return (
      <ScrollView
        style={[styles.base, containerStyle, style]}
        contentContainerStyle={[
          { flexGrow: 1, paddingBottom: 24 },
          contentContainerStyle,
        ]}
        {...scrollProps}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={[styles.base, containerStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
