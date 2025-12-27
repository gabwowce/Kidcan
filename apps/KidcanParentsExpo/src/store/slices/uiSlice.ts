// src/store/slices/uiSlice.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ParentRole } from "../../config/parentRoles";
import type { LocationMode } from "../../screens/location/LocationsScreen";
import type { AppDispatch, RootState } from "../../store";

const KEY_CURRENT_CHILD_ID = "kidcan_current_child_id";
const KEY_LOCATION_MODE = "kidcan_location_mode";
const KEY_LOCATION_FILTER_ID = "kidcan_location_child_filter_id";
const KEY_PARENT_ROLE = "kidcan_parent_role";

type State = {
  currentChildId: number | null;

  // LocationModeToggle (map/safezones)
  locationMode: LocationMode;

  // null = All kids, number = konkretus vaikas
  locationChildFilterId: number | null;

  // onboarding pasirinkimas (parent/guardian/...)
  parentRole: ParentRole | null;
};

const initialState: State = {
  currentChildId: null,
  locationMode: "map",
  locationChildFilterId: null,
  parentRole: null,
};

const slice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // --- setters ---
    setCurrentChildId(state, action: PayloadAction<number | null>) {
      state.currentChildId = action.payload;
    },
    setLocationMode(state, action: PayloadAction<LocationMode>) {
      state.locationMode = action.payload;
    },
    setLocationChildFilterId(state, action: PayloadAction<number | null>) {
      state.locationChildFilterId = action.payload;
    },
    setParentRole(state, action: PayloadAction<ParentRole | null>) {
      state.parentRole = action.payload;
    },

    // --- hydrate (užkrovimas iš storage) ---
    hydrateUI(state, action: PayloadAction<Partial<State>>) {
      Object.assign(state, action.payload);
    },
    resetUI() {
      return initialState;
    },
  },
});

export const {
  setCurrentChildId,
  setLocationMode,
  setLocationChildFilterId,
  setParentRole,
  hydrateUI,
  resetUI,
} = slice.actions;

export default slice.reducer;

// ----------------------------
// Storage helpers
// ----------------------------
function parseNumberOrNull(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseLocationMode(v: string | null): LocationMode | null {
  if (v === "map" || v === "safezones") return v as LocationMode;
  return null;
}

function parseParentRole(v: string | null): ParentRole | null {
  // pritaikyk pagal tavo realų ParentRole union’ą
  if (v === "parent" || v === "guardian") return v as ParentRole;
  return null;
}

export async function loadUiFromStorage(): Promise<Partial<State>> {
  const [childId, locMode, filterId, role] = await AsyncStorage.multiGet([
    KEY_CURRENT_CHILD_ID,
    KEY_LOCATION_MODE,
    KEY_LOCATION_FILTER_ID,
    KEY_PARENT_ROLE,
  ]).then((pairs) => pairs.map((p) => p[1]));

  const loaded: Partial<State> = {};

  const parsedChildId = parseNumberOrNull(childId);
  if (parsedChildId !== null) loaded.currentChildId = parsedChildId;

  const parsedMode = parseLocationMode(locMode);
  if (parsedMode) loaded.locationMode = parsedMode;

  // leidžiam būti null (All)
  loaded.locationChildFilterId = parseNumberOrNull(filterId);

  const parsedRole = parseParentRole(role);
  if (parsedRole) loaded.parentRole = parsedRole;

  return loaded;
}

// Kvieti app start'e: dispatch(hydrateUI(await loadUiFromStorage()))
export function hydrateUiThunk() {
  return async (dispatch: AppDispatch) => {
    const loaded = await loadUiFromStorage();
    dispatch(hydrateUI(loaded));
  };
}

// Persistinam po bet kokių set’ų (pvz. vieną kartą po kelių dispatch)
export function persistUiThunk() {
  return async (_dispatch: AppDispatch, getState: () => RootState) => {
    const ui = getState().ui;

    await AsyncStorage.multiSet([
      [
        KEY_CURRENT_CHILD_ID,
        ui.currentChildId == null ? "" : String(ui.currentChildId),
      ],
      [KEY_LOCATION_MODE, ui.locationMode],
      [
        KEY_LOCATION_FILTER_ID,
        ui.locationChildFilterId == null
          ? ""
          : String(ui.locationChildFilterId),
      ],
      [KEY_PARENT_ROLE, ui.parentRole ?? ""],
    ]).catch(() => {});
  };
}
