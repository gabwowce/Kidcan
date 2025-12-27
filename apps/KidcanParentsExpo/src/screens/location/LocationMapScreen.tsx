// src/screens/location/LocationMapScreen.tsx
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import MapView from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "../../components/layout/Screen";
import { ChildMapMarker } from "../../components/location/ChildMapMarker";

import { LocationBottomInfo } from "../../components/location/LocationBottomInfo";
import { LocationModeToggle } from "../../components/location/LocationModeToggle";
import { useGpsCenter } from "../../hooks/useGpsCenter";
import { useLocationAddress } from "../../hooks/useLocationAddress";
import { useParentDashboard } from "../../hooks/useParentDashboard";
import { ChildSelectorBar } from "./ChildSelectorBar";
import type { LocationMode } from "./LocationsScreen";

const DEFAULT_LAT = 54.6872;
const DEFAULT_LNG = 25.2797;

type Props = {
  mode: LocationMode;
  onChangeMode: (mode: LocationMode) => void;
};

export const LocationMapScreen: React.FC<Props> = ({ mode, onChangeMode }) => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView | null>(null);

  const {
    children,
    selectedChildId, // null arba number
    setSelectedChildId, // <-- turi grįžti iš hook'o
    lastLocation,
    loadingLocation,
    reloadLastLocation,
  } = useParentDashboard();

  const centerLat = lastLocation?.lat ?? DEFAULT_LAT;
  const centerLng = lastLocation?.lng ?? DEFAULT_LNG;

  // markeriai: demo offsetai kai yra keli vaikai (kol kas pagal 1 lastLocation)
  const demoMarkers = useMemo(() => {
    if (!lastLocation) return [];

    if (children.length <= 1) {
      const child = children[0];
      if (!child) return [];
      return [
        {
          id: child.id,
          name: child.name ?? "Child",
          gender: child.gender,
          lat: lastLocation.lat,
          lng: lastLocation.lng,
          color: child.color,
        },
      ];
    }

    return children.map((child, index) => {
      const offsetBase = 0.0006;
      const offsetLat = (index - (children.length - 1) / 2) * offsetBase;
      const offsetLng = (index % 2 === 0 ? 1 : -1) * offsetBase * 0.6;

      return {
        id: child.id,
        name: child.name ?? "Child",
        gender: child.gender,
        lat: lastLocation.lat + offsetLat,
        lng: lastLocation.lng + offsetLng,
        color: child.color,
      };
    });
  }, [children, lastLocation]);

  // filtravimas pagal pasirinktą vaiką (null = All)
  const visibleMarkers = useMemo(() => {
    if (selectedChildId == null) return demoMarkers;
    return demoMarkers.filter((m) => m.id === selectedChildId);
  }, [demoMarkers, selectedChildId]);

  // adresas (kol kas iš bendro lastLocation)
  const { addressLabel, addressLoading } = useLocationAddress(lastLocation);

  const addressText =
    loadingLocation || addressLoading
      ? "Getting location..."
      : addressLabel ??
        (lastLocation
          ? `${lastLocation.lat.toFixed(5)}, ${lastLocation.lng.toFixed(5)}`
          : "No location yet");

  // kad “Last updated” tekstas keistųsi kas 10s
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(id);
  }, []);

  const lastUpdatedText = useMemo(() => {
    if (!lastLocation?.recorded_at) return "No recent location";

    const ts = new Date(lastLocation.recorded_at).getTime();
    if (Number.isNaN(ts)) return "Last updated: recently";

    const diffSec = Math.max(0, Math.floor((now - ts) / 1000));

    if (diffSec < 30) return "Last updated: just now";
    if (diffSec < 90) return "Last updated: 1 minute ago";

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `Last updated: ${diffMin} minutes ago`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Last updated: ${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `Last updated: ${diffDays} days ago`;
  }, [lastLocation?.recorded_at, now]);

  const { handleGpsPress } = useGpsCenter(
    mapRef,
    visibleMarkers.map((m) => ({ lat: m.lat, lng: m.lng })),
    {
      reload: reloadLastLocation,
      singleDelta: 0.03,
      multiPaddingMultiplier: 1.3,
    }
  );

  return (
    <Screen style={styles.screen} scroll={false}>
      <View style={styles.full}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          userInterfaceStyle="light"
          initialRegion={{
            latitude: centerLat,
            longitude: centerLng,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
          region={{
            latitude: centerLat,
            longitude: centerLng,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
        >
          {lastLocation &&
            visibleMarkers.map((m) => (
              <ChildMapMarker
                key={m.id}
                lat={m.lat}
                lng={m.lng}
                name={m.name}
                gender={m.gender}
                color={m.color}
              />
            ))}
        </MapView>

        {loadingLocation && !lastLocation && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator />
          </View>
        )}

        <LinearGradient
          colors={[
            "rgba(252, 241, 223, 1)",
            "rgba(252, 241, 223, 0.5)",
            "rgba(252, 241, 223, 0)",
          ]}
          style={[styles.statusOverlay, { height: insets.top + 60 }]}
        />

        <View style={[styles.topOverlay, { top: insets.top + 16 }]}>
          <LocationModeToggle mode={mode} onChangeMode={onChangeMode} />

          <ChildSelectorBar
            childrenData={children.map((c) => ({
              id: c.id,
              name: c.name,
              emoji: (c as any).emoji, // jei turi tipuose - išimk any
              color: c.color,
            }))}
            selectedChildId={selectedChildId ?? null}
            onSelect={(id) => setSelectedChildId(id)}
          />
        </View>

        <View style={styles.bottomRow}>
          <LocationBottomInfo
            variant="map"
            style={styles.bottomCard}
            address={addressText}
            subtitle={lastUpdatedText}
            loading={loadingLocation || addressLoading}
            onPressRefresh={() => reloadLastLocation("manual")}
            onPressGps={handleGpsPress} // jeigu tavo LocationBottomInfo turi GPS ikoną map variante
          />
          {/* jei naudoji atskirą GPS mygtuką – grąžink */}
          {/* <LocationGpsButton variant="map" onPress={handleGpsPress} /> */}
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FEF7EC",
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  full: {
    flex: 1,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  statusOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  topOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  bottomRow: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 110,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  bottomCard: {
    flex: 1,
  },
});

export default LocationMapScreen;
