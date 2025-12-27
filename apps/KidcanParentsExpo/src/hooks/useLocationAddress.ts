// src/hooks/useLocationAddress.ts
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import type { ChildLastLocation } from "../api/geofences";

export function useLocationAddress(lastLocation: ChildLastLocation | null) {
  const [addressLabel, setAddressLabel] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!lastLocation) {
      setAddressLabel(null);
      return;
    }

    const fetchAddress = async () => {
      try {
        setAddressLoading(true);

        // leidimai
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.status !== "granted") {
          const req = await Location.requestForegroundPermissionsAsync();
          if (req.status !== "granted") {
            if (!cancelled) {
              setAddressLabel(
                `${lastLocation.lat.toFixed(5)}, ${lastLocation.lng.toFixed(5)}`
              );
            }
            return;
          }
        }

        const results = await Location.reverseGeocodeAsync({
          latitude: lastLocation.lat,
          longitude: lastLocation.lng,
        });

        if (cancelled) return;

        if (results.length > 0) {
          const r = results[0];

          // trumpas formatas: "Vilnius, Šeškinės g. 17"
          const parts = [
            r.city || r.subregion,
            r.name, // dažniausiai "Šeškinės g. 17"
          ].filter(Boolean) as string[];

          const label =
            parts.join(", ") ||
            `${lastLocation.lat.toFixed(5)}, ${lastLocation.lng.toFixed(5)}`;

          setAddressLabel(label);
        } else {
          setAddressLabel(
            `${lastLocation.lat.toFixed(5)}, ${lastLocation.lng.toFixed(5)}`
          );
        }
      } catch (e) {
        console.log("reverse geocode error", e);
        if (!cancelled && lastLocation) {
          setAddressLabel(
            `${lastLocation.lat.toFixed(5)}, ${lastLocation.lng.toFixed(5)}`
          );
        }
      } finally {
        if (!cancelled) setAddressLoading(false);
      }
    };

    void fetchAddress();

    return () => {
      cancelled = true;
    };
  }, [lastLocation?.lat, lastLocation?.lng]);

  return { addressLabel, addressLoading };
}
