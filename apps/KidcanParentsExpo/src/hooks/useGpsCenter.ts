// src/hooks/useGpsCenter.ts
import { useCallback } from "react";
import type MapView from "react-native-maps";

type MarkerLike = {
  lat: number;
  lng: number;
};

type Options = {
  reload?: () => void;
  singleDelta?: number;
  multiPaddingMultiplier?: number;
};

export function useGpsCenter(
  mapRef: React.RefObject<MapView | null>,
  markers: MarkerLike[],
  options: Options = {}
) {
  const { reload, singleDelta = 0.03, multiPaddingMultiplier = 1.3 } = options;

  const handleGpsPress = useCallback(() => {
    // jei reikia – pasitraukti naują lokaciją
    if (reload) {
      reload();
    }

    if (!mapRef.current || markers.length === 0) return;

    // 1 markeris – paprastas zoom’as
    if (markers.length === 1) {
      const m = markers[0];
      mapRef.current.animateToRegion(
        {
          latitude: m.lat,
          longitude: m.lng,
          latitudeDelta: singleDelta,
          longitudeDelta: singleDelta,
        },
        600
      );
      return;
    }

    // keli markeriai – apskaičiuojam bounding box
    let minLat = markers[0].lat;
    let maxLat = markers[0].lat;
    let minLng = markers[0].lng;
    let maxLng = markers[0].lng;

    markers.forEach((m) => {
      if (m.lat < minLat) minLat = m.lat;
      if (m.lat > maxLat) maxLat = m.lat;
      if (m.lng < minLng) minLng = m.lng;
      if (m.lng > maxLng) maxLng = m.lng;
    });

    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;

    const rawLatDelta = maxLat - minLat || 0.01;
    const rawLngDelta = maxLng - minLng || 0.01;

    const latitudeDelta = rawLatDelta * multiPaddingMultiplier;
    const longitudeDelta = rawLngDelta * multiPaddingMultiplier;

    mapRef.current.animateToRegion(
      {
        latitude: midLat,
        longitude: midLng,
        latitudeDelta,
        longitudeDelta,
      },
      600
    );
  }, [mapRef, markers, reload, singleDelta, multiPaddingMultiplier]);

  return { handleGpsPress };
}
