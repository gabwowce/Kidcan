import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import type MapViewType from "react-native-maps";
import MapView from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "../../components/common/AppText";
import {
  ChildCard,
  type ChildCardData,
} from "../../components/dashboard/ChildCard";
import { DashboardQuickActionsSection } from "../../components/dashboard/DashboardQuickActionsSection";
import { RecentActivityFeed } from "../../components/dashboard/RecentActivityFeed";
import { Screen } from "../../components/layout/Screen";
import { ChildMapMarker } from "../../components/location/ChildMapMarker";
import { LocationBottomInfo } from "../../components/location/LocationBottomInfo";
import { useGpsCenter } from "../../hooks/useGpsCenter";
import { useLocationAddress } from "../../hooks/useLocationAddress";
import { useParentDashboard } from "../../hooks/useParentDashboard";
import type { RootStackParamList } from "../../navigation/types";

import { useAppDispatch } from "../../store/hooks";
import { logoutThunk } from "../../store/slices/authSlice";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

const ParentDashboardScreen: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const {
    children,
    isLoading,
    errorMessage,
    selectedChildId,
    handleSelectChild,
    lastLocation,
    loadingLocation,
    reloadLastLocation,
  } = useParentDashboard();

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
    } catch (e) {
      console.log("logout error", e);
      Alert.alert("Klaida", "Nepavyko atsijungti. Bandyk dar kartą.");
    }
  };

  const { addressLabel, addressLoading } = useLocationAddress(lastLocation);
  const mapRef = React.useRef<MapViewType | null>(null);

  const selectedChild = React.useMemo(
    () => children.find((c) => c.id === selectedChildId) ?? null,
    [children, selectedChildId]
  );

  React.useEffect(() => {
    if (!lastLocation || !mapRef.current) return;

    mapRef.current.animateCamera({
      center: {
        latitude: lastLocation.lat,
        longitude: lastLocation.lng,
      },
      zoom: 15,
    });
  }, [lastLocation?.lat, lastLocation?.lng]);

  const selectedIds = React.useMemo(
    () => (selectedChildId ? [selectedChildId] : []),
    [selectedChildId]
  );

  const addressText =
    addressLabel ??
    (lastLocation
      ? `${lastLocation.lat.toFixed(5)}, ${lastLocation.lng.toFixed(5)}`
      : "No location yet");

  const markers = React.useMemo(
    () =>
      lastLocation ? [{ lat: lastLocation.lat, lng: lastLocation.lng }] : [],
    [lastLocation]
  );

  const { handleGpsPress } = useGpsCenter(mapRef, markers, {
    reload: reloadLastLocation,
    singleDelta: 0.01,
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#FCF1DF" }}>
      <View style={{ height: insets.top, backgroundColor: "#FCF1DF" }} />

      <Screen
        scroll
        noTopInset
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
        padding={0}
      >
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <AppText size={24} weight="heavy" style={styles.logo}>
              KidCan
            </AppText>

            {/* jei turi logout mygtuką UI – kviesk handleLogout */}
            {/* <TouchableOpacity onPress={handleLogout}><AppText>Logout</AppText></TouchableOpacity> */}
          </View>

          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator />
            </View>
          ) : children.length === 0 ? (
            <View style={styles.emptyBox}>
              <AppText size={16} weight="heavy" style={styles.emptyTitle}>
                No kids yet
              </AppText>
              <AppText
                size={13}
                weight="medium"
                color="#8B7A67"
                style={styles.emptySubtitle}
              >
                Connect your child’s device to see them here.
              </AppText>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.childrenRow}
            >
              {children.map((child) => (
                <ChildCard
                  key={child.id}
                  child={child as ChildCardData}
                  selected={child.id === selectedChildId}
                  onPress={() => handleSelectChild(child as ChildCardData)}
                />
              ))}
            </ScrollView>
          )}

          {errorMessage && (
            <AppText
              size={12}
              weight="medium"
              color="#FF5555"
              style={styles.errorText}
            >
              {errorMessage}
            </AppText>
          )}
        </View>

        <View style={styles.mainContent}>
          <View style={styles.sectionHeaderRow}>
            <AppText size={16} weight="heavy" style={styles.sectionTitle}>
              Device Location
            </AppText>
          </View>

          <View style={styles.mapBox}>
            {loadingLocation && !lastLocation ? (
              <ActivityIndicator />
            ) : !lastLocation ? (
              <AppText
                size={12}
                weight="medium"
                color="#8B7A67"
                style={styles.mapEmptyText}
              >
                No location yet.
              </AppText>
            ) : (
              <>
                <MapView
                  ref={mapRef}
                  userInterfaceStyle="light"
                  style={StyleSheet.absoluteFillObject}
                  initialRegion={{
                    latitude: lastLocation.lat,
                    longitude: lastLocation.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <ChildMapMarker
                    lat={lastLocation.lat}
                    lng={lastLocation.lng}
                    name={selectedChild?.name ?? "Child"}
                    gender={selectedChild?.gender}
                    color={selectedChild?.color}
                  />
                </MapView>

                <View style={styles.mapBottomRow}>
                  <LocationBottomInfo
                    variant="dashboard"
                    style={styles.mapBottomInfo}
                    address={addressText}
                    loading={loadingLocation || addressLoading}
                    showGpsIcon
                    onPressGps={handleGpsPress}
                  />
                </View>
              </>
            )}
          </View>

          <RecentActivityFeed childIds={selectedIds} />

          <DashboardQuickActionsSection
            childrenList={children}
            selectedChildId={selectedChildId}
          />
        </View>
      </Screen>
    </View>
  );
};

export default ParentDashboardScreen;

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#FDF7EC",
  },
  screenContent: {
    flexGrow: 1,
  },

  headerSection: {
    backgroundColor: "#FCF1DF",
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  logo: {
    color: "#362F27",
  },

  loadingBox: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyBox: {
    height: 150,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5D8C6",
    backgroundColor: "#FFF6E9",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  emptyTitle: {
    marginBottom: 4,
    color: "#362F27",
  },
  emptySubtitle: {
    textAlign: "center",
  },
  errorText: {
    marginTop: 8,
  },
  childrenRow: {
    marginBottom: 12,
  },

  mainContent: {
    flexGrow: 1,
    backgroundColor: "#FDF7EC",
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    marginTop: 8,
  },
  sectionTitle: {},

  mapBox: {
    height: 220,
    borderRadius: 10,
    backgroundColor: "#FFF5E6",
    borderColor: "#E6E7EB",
    borderWidth: 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 12,
  },
  mapEmptyText: {},
  mapBottomRow: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
  },
  mapBottomInfo: {
    flex: 1,
  },
});
