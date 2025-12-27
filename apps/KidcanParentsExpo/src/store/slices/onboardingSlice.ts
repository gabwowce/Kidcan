import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ParentRole } from "../../config/parentRoles";

const KEY = "kidcan_parent_role";

type State = {
  parentRole: ParentRole | null;
};

const initialState: State = { parentRole: null };

const slice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setParentRole(state, action: PayloadAction<ParentRole | null>) {
      state.parentRole = action.payload;
      // persist
      AsyncStorage.setItem(KEY, action.payload ?? "").catch(() => {});
    },
    hydrateParentRole(state, action: PayloadAction<ParentRole | null>) {
      state.parentRole = action.payload;
    },
  },
});

export const { setParentRole, hydrateParentRole } = slice.actions;
export default slice.reducer;

// helper init (kviesi App start’e)
export async function loadParentRole(): Promise<ParentRole | null> {
  const v = await AsyncStorage.getItem(KEY);
  return (v as ParentRole) || null;
}
