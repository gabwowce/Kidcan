import Slider from "@react-native-community/slider";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Circle, MapPressEvent, Marker } from "react-native-maps";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  createGeofenceForAllChildren,
  listGeofencesForChild,
} from "../../api/geofences";
import { Screen } from "../../components/layout/Screen";
import { LocationModeToggle } from "../../components/location/LocationModeToggle";
import { useParentDashboard } from "../../hooks/useParentDashboard";
import type { LocationMode } from "./LocationsScreen";

const DEFAULT_RADIUS = 100;
const MIN_RADIUS = 50;
const MAX_RADIUS = 500;

const DEFAULT_LAT = 54.6872;
const DEFAULT_LNG = 25.2797;

type Props = {
  mode: LocationMode;
  onChangeMode: (mode: LocationMode) => void;
};

export const LocationSafeZonesScreen: React.FC<Props> = ({
  mode,
  onChangeMode,
}) => {
  const { children, selectedChildId } = useParentDashboard();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [type, setType] = useState<"HOME" | "SCHOOL" | "OTHER">("OTHER");
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [radius, setRadius] = useState<number>(DEFAULT_RADIUS);

  const [isSaving, setIsSaving] = useState(false);
  const [geofences, setGeofences] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const selectedChild = children.find((c) => c.id === selectedChildId) ?? null;

  const loadGeofences = async (childId: number) => {
    try {
      const rows = await listGeofencesForChild(childId);
      setGeofences(rows);
    } catch (e) {
      console.log("loadGeofences error", e);
    }
  };

  useEffect(() => {
    if (!selectedChildId) return;
    void loadGeofences(selectedChildId);
  }, [selectedChildId]);

  const handleMapPress = (e: MapPressEvent) => {
    if (!isCreating) return;
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLat(latitude.toString());
    setLng(longitude.toString());
  };

  const resetForm = () => {
    setName("");
    setType("OTHER");
    setLat("");
    setLng("");
    setRadius(DEFAULT_RADIUS);
  };

  const handleSave = async () => {
    if (!selectedChildId) {
      Alert.alert("Pasirink vaiką", "Pirmiausia pasirink vaiką");
      return;
    }
    if (!name.trim()) {
      Alert.alert("Zonos pavadinimas", "Įvesk zonos pavadinimą");
      return;
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);

    if (!lat || isNaN(latNum) || !lng || isNaN(lngNum)) {
      Alert.alert("Koordinatės", "Bakstelėk ant žemėlapio, kad parinktum zoną");
      return;
    }

    setIsSaving(true);
    try {
      await createGeofenceForAllChildren({
        name: name.trim(),
        type,
        centerLat: latNum,
        centerLng: lngNum,
        radiusM: radius,
      });

      if (selectedChildId) {
        await loadGeofences(selectedChildId);
      }

      resetForm();
      setIsCreating(false);
      Alert.alert("Išsaugota", "Zona išsaugota");
    } catch (e) {
      console.log("handleSave error", e);
      Alert.alert("Klaida", "Nepavyko išsaugoti zonos");
    } finally {
      setIsSaving(false);
    }
  };

  const latNum = lat ? Number(lat) : DEFAULT_LAT;
  const lngNum = lng ? Number(lng) : DEFAULT_LNG;

  return (
    <Screen scroll style={styles.screen}>
      {/* VIRŠUS: tas pats offset kaip LocationMapScreen */}
      <View
        style={[
          styles.topHeader,
          { paddingTop: insets.top + 16 }, // identiškas „aukštis“ kaip map'e
        ]}
      >
        <LocationModeToggle mode={mode} onChangeMode={onChangeMode} />
      </View>

      {/* Child pill */}
      {children.length > 0 ? (
        <View style={styles.childCard}>
          <View style={styles.childAvatar}>
            <Text style={styles.childAvatarText}>
              {selectedChild?.name?.[0] ?? "K"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.childLabel}>Child</Text>
            <Text style={styles.childName}>
              {selectedChild?.name ?? "Child"}
            </Text>
          </View>
        </View>
      ) : (
        <Text style={styles.emptyText}>
          Dar nėra vaikų. Pirmiausia susikurk vaiką.
        </Text>
      )}

      {/* Map card – kuriame safe zone */}
      <View style={styles.mapCard}>
        <Text style={styles.cardTitle}>Safe zones</Text>
        <Text style={styles.cardSubtitle}>
          Tap on the map to set a safe area for your child.
        </Text>

        <View style={styles.mapWrapper}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: DEFAULT_LAT,
              longitude: DEFAULT_LNG,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            region={{
              latitude: latNum,
              longitude: lngNum,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onPress={handleMapPress}
          >
            {lat && lng && (
              <>
                <Marker coordinate={{ latitude: latNum, longitude: lngNum }} />
                <Circle
                  center={{ latitude: latNum, longitude: lngNum }}
                  radius={radius}
                  strokeColor="rgba(255,107,61,0.9)"
                  fillColor="rgba(255,107,61,0.18)"
                />
              </>
            )}
          </MapView>

          {!isCreating && (
            <TouchableOpacity
              style={styles.fab}
              onPress={() => {
                setIsCreating(true);
                resetForm();
              }}
            >
              <Text style={styles.fabText}>＋ New zone</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.mapHint}>
          Bakstelėk ant žemėlapio – parink zonos centrą
        </Text>

        {isCreating && (
          <View style={styles.zoneCard}>
            <Text style={styles.zoneTitle}>New zone</Text>

            <Text style={styles.label}>Zone name</Text>
            <TextInput
              style={styles.input}
              placeholder="Home, School, Grandma..."
              placeholderTextColor="#C4B7A3"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Type</Text>
            <View style={styles.row}>
              {(["HOME", "SCHOOL", "OTHER"] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, type === t && styles.chipActive]}
                  onPress={() => setType(t)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      type === t && styles.chipTextActive,
                    ]}
                  >
                    {t === "HOME"
                      ? "Home"
                      : t === "SCHOOL"
                      ? "School"
                      : "Other"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sliderRow}>
              <Text style={styles.label}>Radius</Text>
              <Text style={styles.radiusValue}>{radius} m</Text>
            </View>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={MIN_RADIUS}
              maximumValue={MAX_RADIUS}
              step={10}
              minimumTrackTintColor="#FF6B3D"
              maximumTrackTintColor="#E0D3C1"
              thumbTintColor="#FF6B3D"
              value={radius}
              onValueChange={(v) => setRadius(Math.round(v))}
            />

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setIsCreating(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={isSaving}
              >
                <Text style={styles.saveText}>
                  {isSaving ? "Saving..." : "Save zone"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Existing zones */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Existing zones</Text>
        </View>
        <FlatList
          data={geofences}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.zoneItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.zoneName}>{item.name}</Text>
                <Text style={styles.zoneMeta}>
                  {item.radius_m} m • {item.type}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Dar nėra zonų.</Text>
          }
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FEF7EC",
    paddingHorizontal: 0,
    paddingTop: 0, // 👈 kad Screen nedėtų savo extra padding'o
  },
  topHeader: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  headerTitle: {
    color: "#362F27",
    fontSize: 24,
    fontWeight: "700",
  },
  headerBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFE3BF",
  },

  modeSwitch: {
    marginHorizontal: 12,
    marginTop: 16,
    marginBottom: 12,
  },

  childCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    marginHorizontal: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFE3BF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  childAvatarText: {
    color: "#362F27",
    fontWeight: "700",
    fontSize: 16,
  },
  childLabel: {
    color: "#8B7A67",
    fontSize: 12,
  },
  childName: {
    color: "#362F27",
    fontSize: 16,
    fontWeight: "600",
  },

  mapCard: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 14,
    marginBottom: 20,
    marginHorizontal: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardTitle: {
    color: "#362F27",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardSubtitle: {
    color: "#8B7A67",
    fontSize: 13,
    marginBottom: 10,
  },

  mapWrapper: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F1E3D1",
  },
  map: {
    height: 230,
  },

  fab: {
    position: "absolute",
    left: 12,
    top: 12,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFE3BF",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  fabText: {
    color: "#362F27",
    fontSize: 13,
    fontWeight: "600",
  },

  mapHint: {
    color: "#8B7A67",
    fontSize: 12,
    marginTop: 8,
  },

  zoneCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#FFF5E6",
  },
  zoneTitle: {
    color: "#362F27",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },

  section: {
    marginBottom: 24,
    marginHorizontal: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#362F27",
    fontSize: 16,
    fontWeight: "600",
  },

  label: {
    marginTop: 8,
    color: "#8B7A67",
    fontSize: 13,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5D8C6",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 4,
    color: "#362F27",
    backgroundColor: "#FFFDF9",
  },

  row: {
    flexDirection: "row",
    marginTop: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5D8C6",
    marginRight: 8,
    backgroundColor: "#FFFDF9",
  },
  chipActive: {
    backgroundColor: "#FF6B3D",
    borderColor: "#FF6B3D",
  },
  chipText: {
    color: "#8B7A67",
    fontSize: 12,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },

  sliderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  radiusValue: {
    color: "#362F27",
    fontWeight: "600",
  },

  actionsRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5D8C6",
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  cancelText: {
    color: "#8B7A67",
    fontWeight: "500",
  },
  saveBtn: {
    flex: 2,
    borderRadius: 999,
    backgroundColor: "#FF6B3D",
    paddingVertical: 10,
    alignItems: "center",
  },
  saveText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  zoneItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  zoneName: {
    color: "#362F27",
    fontWeight: "600",
    marginBottom: 2,
  },
  zoneMeta: {
    color: "#8B7A67",
    fontSize: 12,
  },

  emptyText: {
    color: "#8B7A67",
    fontSize: 13,
    marginTop: 6,
    marginHorizontal: 24,
  },
});
