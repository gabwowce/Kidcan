import React, { useState } from "react";
import { LocationMapScreen } from "./LocationMapScreen";
import { LocationSafeZonesScreen } from "./LocationSafeZonesScreen";

export type LocationMode = "map" | "safeZones";

const LocationsScreen: React.FC = () => {
  const [mode, setMode] = useState<LocationMode>("map");

  if (mode === "map") {
    return <LocationMapScreen mode={mode} onChangeMode={setMode} />;
  }

  return <LocationSafeZonesScreen mode={mode} onChangeMode={setMode} />;
};

export default LocationsScreen;
