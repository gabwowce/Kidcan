// src/components/location/ChildMapMarker.android.tsx
import React from "react";
import { StyleSheet } from "react-native";
import { Marker } from "react-native-maps";

type ChildGender = "son" | "daughter" | null | undefined;

type Props = {
  lat: number;
  lng: number;
  name: string;
  gender?: ChildGender;
};

const LABEL_LAT_OFFSET = 0.00035; // kiek žemiau vardo burbulas

export const ChildMapMarker: React.FC<Props> = ({ lat, lng, name }) => {
  return (
    <>
      {/* 1) Smeigtukas iš PNG */}
      <Marker
        coordinate={{ latitude: lat, longitude: lng }}
        anchor={{ x: 0.5, y: 1 }}
        image={require("../../assets/map/child-marker.png")}
        style={{ width: 78, height: 78 }}
        tracksViewChanges={false}
      ></Marker>
    </>
  );
};

const styles = StyleSheet.create({
  namePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    elevation: 4,
    width: 30,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00C853",
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4A4A4A",
    maxWidth: 120,
  },
});

export default ChildMapMarker;
