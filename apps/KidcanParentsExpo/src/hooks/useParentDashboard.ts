// src/hooks/useParentDashboard.ts
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { AppState, AppStateStatus } from "react-native";

import { sendChildCommand } from "../api/childCommands";
import { fetchChildrenForCurrentParent, type DbChild } from "../api/children";
import { fetchBatteryForChildren } from "../api/deviceStatus";
import {
  fetchLastLocationForChildren,
  type ChildLastLocation,
} from "../api/geofences";
import { type ChildCardData } from "../components/dashboard/ChildCard";
import { BATTERY_REFRESH_MS } from "../config/battery";
import { useCurrentChild } from "../context/CurrentChildContext";

const CHILD_COLORS = [
  "#FF6B6B", // raudona
  "#FF8A23", // oranžinė
  "#4CAF50", // žalia
  "#2196F3", // mėlyna
  "#9C27B0", // violetinė
  "#FFC107", // geltona
];

export function useParentDashboard() {
  const { currentChildId, setCurrentChildId } = useCurrentChild();

  const [children, setChildren] = React.useState<ChildCardData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [selectedChildId, setSelectedChildId] = React.useState<number | null>(
    currentChildId
  );
  // viršuje state'ai
  const [lastLocationUpdatedAt, setLastLocationUpdatedAt] = React.useState<
    number | null
  >(null);
  const [lastLocationRefreshSource, setLastLocationRefreshSource] =
    React.useState<"auto" | "manual" | null>(null);

  const [lastLocation, setLastLocation] =
    React.useState<ChildLastLocation | null>(null);
  const [loadingLocation, setLoadingLocation] = React.useState(false);

  // --- CHILDREN + BATTERY ---
  const getChildColor = (id: number) =>
    CHILD_COLORS[Math.abs(id) % CHILD_COLORS.length];
  const loadChildren = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const dbChildren: DbChild[] = await fetchChildrenForCurrentParent();
      const ids = dbChildren.map((c) => c.id);

      let batteryMap: Record<number, number> = {};
      try {
        batteryMap = await fetchBatteryForChildren(ids);
      } catch (e) {
        console.log("battery fetch error", e);
      }

      const normalized: ChildCardData[] = dbChildren.map((ch, index) => ({
        id: ch.id,
        name: ch.name ?? "Child",
        battery: batteryMap[ch.id] ?? null,
        gender: ch.gender ?? null,
        isActive: ch.is_active ?? undefined,
        pairedAt: ch.paired_at ?? null,
        color: getChildColor(ch.id),
        // jei nori spalvų pagal indeksą
        // color: CHILD_COLORS[index % CHILD_COLORS.length],
      }));

      setChildren(normalized);

      if (!selectedChildId && normalized.length > 0) {
        const firstId = normalized[0].id;
        setSelectedChildId(firstId);
        setCurrentChildId(firstId);
      }
    } catch (e: any) {
      console.log("loadChildren error", e);
      setErrorMessage(e.message ?? "Failed to load children");
      setChildren([]);
      setSelectedChildId(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedChildId, setCurrentChildId]);

  React.useEffect(() => {
    void loadChildren();
  }, [loadChildren]);

  const childIds = React.useMemo(() => children.map((c) => c.id), [children]);

  const reloadBattery = React.useCallback(async () => {
    if (!childIds.length) return;

    try {
      const batteryMap = await fetchBatteryForChildren(childIds);
      setChildren((prev) =>
        prev.map((ch) => ({
          ...ch,
          battery: batteryMap[ch.id] ?? ch.battery,
        }))
      );
    } catch (e) {
      console.log("battery refresh error", e);
    }
  }, [childIds]);

  React.useEffect(() => {
    if (!childIds.length) return;

    const id = setInterval(() => {
      void reloadBattery();
    }, BATTERY_REFRESH_MS);

    return () => clearInterval(id);
  }, [childIds.length, reloadBattery]);

  // --- START/STOP SYNC, kai Dashboard matomas ---

  useFocusEffect(
    React.useCallback(() => {
      if (!selectedChildId) return;

      const startBoost = async () => {
        try {
          await sendChildCommand({
            childId: selectedChildId,
            commandType: "START_BATTERY_SYNC",
          });
          await sendChildCommand({
            childId: selectedChildId,
            commandType: "START_LOCATION_SYNC",
          });
        } catch (e) {
          console.log("START sync error", e);
        }
      };

      const stopBoost = async () => {
        try {
          await sendChildCommand({
            childId: selectedChildId,
            commandType: "STOP_BATTERY_SYNC",
          });
          await sendChildCommand({
            childId: selectedChildId,
            commandType: "STOP_LOCATION_SYNC",
          });
        } catch (e) {
          console.log("STOP sync error", e);
        }
      };

      // Kai ekrano fokusas atsiranda (Dashboard / Locations) – įjungiam boost
      void startBoost();

      const sub = AppState.addEventListener(
        "change",
        (state: AppStateStatus) => {
          if (state === "background" || state === "inactive") {
            // tik kai visa app išeina į bg – išjungiam boost
            void stopBoost();
          } else if (state === "active") {
            // grįžom į foreground – vėl įjungiam
            void startBoost();
          }
        }
      );

      // ⬇️ NEBESIUNČIAM stopBoost čia, kad neišjungtume
      // kai pereinam iš Dashboard į Maps
      return () => {
        sub.remove();
      };
    }, [selectedChildId])
  );

  // --- LOCATION ---

  const reloadLastLocation = React.useCallback(
    async (source: "auto" | "manual" = "manual") => {
      if (!selectedChildId) {
        setLastLocation(null);
        setLastLocationUpdatedAt(null);
        return;
      }

      try {
        setLastLocationRefreshSource(source);
        setLoadingLocation(true);

        const loc = await fetchLastLocationForChildren([selectedChildId]);
        setLastLocation(loc);
        setLastLocationUpdatedAt(Date.now());
      } catch (e) {
        console.log("load last location error", e);
        setLastLocation(null);
      } finally {
        setLoadingLocation(false);
        setLastLocationRefreshSource(null);
      }
    },
    [selectedChildId]
  );

  useFocusEffect(
    React.useCallback(() => {
      if (!selectedChildId) return;

      let isActive = true;

      const tick = async () => {
        if (!isActive) return;
        try {
          await reloadLastLocation("auto");
        } catch (e) {
          console.log("auto location refresh error", e);
        }
      };

      void tick();

      const intervalId = setInterval(() => {
        void tick();
      }, 60_000);

      return () => {
        isActive = false;
        clearInterval(intervalId);
      };
    }, [reloadLastLocation, selectedChildId])
  );

  // --- API ekrano UI’ui ---

  const handleSelectChild = React.useCallback(
    (child: ChildCardData) => {
      setSelectedChildId(child.id);
      setCurrentChildId(child.id);
    },
    [setCurrentChildId]
  );

  return {
    children,
    isLoading,
    errorMessage,
    selectedChildId,
    handleSelectChild,
    lastLocation,
    loadingLocation,
    lastLocationUpdatedAt,
    lastLocationRefreshSource,
    reloadLastLocation,
  };
}
