// src/components/location/ChildMapMarker.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Marker } from "react-native-maps";

// src/components/location/ChildMapMarker.tsx
type ChildGender = "son" | "daughter" | null | undefined;

type Props = {
  lat: number;
  lng: number;
  name: string;
  gender?: ChildGender;
  color?: string; // 👈 nauja
};

const getEmoji = (gender: ChildGender) => {
  if (gender === "daughter") return "👧";
  if (gender === "son") return "👦";
  return "🧒";
};

export const ChildMapMarker: React.FC<Props> = ({
  lat,
  lng,
  name,
  gender,
  color = "#FF8A23", // default – oranžinė
}) => {
  const emoji = getEmoji(gender);

  return (
    <Marker
      coordinate={{ latitude: lat, longitude: lng }}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.pinWrapper}>
          <View style={[styles.pinTail, { backgroundColor: color }]} />
          <View style={[styles.pinCircle, { backgroundColor: color }]}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
        </View>

        <View style={styles.namePill}>
          <View style={styles.dot} />
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
        </View>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  pinWrapper: {
    width: 34,
    height: 44,
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 4,
  },
  pinCircle: {
    position: "absolute",
    top: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  pinTail: {
    position: "absolute",
    bottom: 6,
    width: 14,
    height: 14,
    transform: [{ rotate: "45deg" }],
  },
  emoji: {
    fontSize: 18,
  },
  namePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00C853",
    marginRight: 6,
  },
  name: {
    maxWidth: 90,
    fontSize: 12,
    fontWeight: "600",
    color: "#362F27",
  },
});
