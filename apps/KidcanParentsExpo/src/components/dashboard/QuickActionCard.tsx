// src/components/dashboard/QuickActionCard.tsx
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "../../theme";
import { AppText } from "../common/AppText";

type Props = {
  title: string;
  subtitle: string;
  buttonLabel: string;
  loading?: boolean;
  onPress: () => void;
  style?: ViewStyle;
};

export const QuickActionCard: React.FC<Props> = ({
  title,
  subtitle,
  buttonLabel,
  loading = false,
  onPress,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      {/* Kairė – ikona + tekstas */}
      <View style={styles.leftRow}>
        <View style={styles.iconCircle}>
          <Feather name="volume-2" size={18} color="#4B5563" />
        </View>

        <View>
          <AppText
            size={12}
            weight="heavy"
            color={colors.textDark ?? "#4B4B4B"}
            style={styles.title}
            numberOfLines={1}
          >
            {title}
          </AppText>

          <AppText
            size={11}
            weight="medium"
            color="#9CA3AF"
            style={styles.subtitle}
            numberOfLines={2}
          >
            {subtitle}
          </AppText>
        </View>
      </View>

      {/* Dešinė – mygtukas */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={onPress}
        activeOpacity={0.9}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <AppText
            size={12}
            weight="bold"
            color="#FFFFFF"
            style={styles.buttonLabel}
            numberOfLines={1}
          >
            {buttonLabel}
          </AppText>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECEFF5",
  },

  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },

  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F4F5FB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  title: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  subtitle: {},

  button: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#7C1110",
    minWidth: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonLabel: {},
});
