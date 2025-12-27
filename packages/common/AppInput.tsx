// src/components/common/AppInput.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { colors } from "../../theme";

type Props = TextInputProps & {
  style?: ViewStyle;
  inputStyle?: TextStyle;
};

const BORDER_DEFAULT = "#E6E7EB";
const BORDER_ACTIVE = "#00B4FC";

export const AppInput: React.FC<Props> = ({
  style,
  inputStyle,
  value,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);

  const handleFocus = (e: any) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setFocused(false);
    onBlur?.(e);
  };

  const borderColor = focused || !!value ? BORDER_ACTIVE : BORDER_DEFAULT;

  return (
    <TextInput
      {...rest}
      value={value}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={[
        styles.base,
        { borderColor },
        inputStyle, // tekstui (size, align, color)
        style, // išorinis wrap (margin ir t.t.)
      ]}
      placeholderTextColor="#B2B8C5"
    />
  );
};

const styles = StyleSheet.create({
  base: {
    width: "100%",
    height: 54, // 48px box
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 0, // kad 48 nepasiplėstų

    // toks pats „stroke“ kaip mygtukuose: 2/2/2/6
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 6,

    fontSize: 16,
    fontFamily: "Gilroy-Medium",
    color: "#00B4FC",
    textAlign: "left",
    textAlignVertical: "center", // ypač Android'ui
  },
});
