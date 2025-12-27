import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { GlassCard } from "../../theme/glassStyles";

export type LocationBottomInfoVariant = "map" | "dashboard";

type Props = {
  variant?: LocationBottomInfoVariant;
  style?: ViewStyle;
  address: string;
  subtitle?: string;
  loading?: boolean;

  showGpsIcon?: boolean;
  onPressGps?: () => void;

  showRefreshIcon?: boolean;
  onPressRefresh?: () => void;
};

export const LocationBottomInfo: React.FC<Props> = ({
  variant = "map",
  style,
  address,
  subtitle,
  loading = false,
  showGpsIcon = false,
  onPressGps,

  showRefreshIcon = true,
  onPressRefresh,
}) => {
  const isMap = variant === "map";

  return (
    <GlassCard
      style={[isMap ? styles.containerMap : styles.containerDashboard, style]}
    >
      {isMap ? (
        <>
          <View style={styles.topRow}>
            <Text style={styles.address} numberOfLines={1}>
              {address}
            </Text>

            {showRefreshIcon && (
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={onPressRefresh}
                disabled={loading || !onPressRefresh}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {loading ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Feather name="refresh-cw" size={16} color="#0065F4" />
                )}
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.statusRow}>
            <View style={styles.greenDot} />
            <Text style={styles.subtitle} numberOfLines={1}>
              {loading ? "Refreshing..." : subtitle ?? ""}
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.dashboardRow}>
          <View style={styles.greenDot} />

          <Text style={styles.dashboardAddress} numberOfLines={1}>
            {address}
          </Text>

          {showRefreshIcon && (
            <TouchableOpacity
              style={styles.dashboardIcon}
              onPress={onPressRefresh}
              disabled={loading || !onPressRefresh}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              {loading ? (
                <ActivityIndicator size="small" />
              ) : (
                <Feather name="refresh-cw" size={16} color="#0065F4" />
              )}
            </TouchableOpacity>
          )}

          {showGpsIcon && (
            <TouchableOpacity
              style={styles.dashboardIcon}
              onPress={onPressGps}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Feather name="navigation" size={16} color="#0065F4" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  containerMap: {
    borderRadius: 10,
    height: 68,
    paddingHorizontal: 14,
    width: "100%",
    justifyContent: "center",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },

  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  address: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#362F27",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00C853",
    marginRight: 6,
  },
  subtitle: {
    fontSize: 11,
    color: "#8B7A67",
  },

  containerDashboard: {
    borderRadius: 999,
    paddingHorizontal: 10,
    height: 28,
    justifyContent: "center",
  },
  dashboardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dashboardAddress: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#362F27",
  },
  dashboardIcon: {
    marginLeft: 6,
  },
});
