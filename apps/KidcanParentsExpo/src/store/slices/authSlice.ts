import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Linking } from "react-native";

import { completeFamilyJoin } from "../../api/family";
import { supabase } from "../../api/supabaseClient";
import type { ParentRole } from "../../config/parentRoles";

const GOOGLE_REDIRECT = "kidcanparent://auth/callback";

type AuthState = {
  token: string | null;
  isLoading: boolean; // initial auth check
  error: string | null;
};

const initialState: AuthState = {
  token: null,
  isLoading: true,
  error: null,
};

// --- helper: edge ensure_primary_parent
async function ensurePrimaryParentEdge() {
  const { data, error } = await supabase.functions.invoke("family", {
    body: { action: "ensure_primary_parent" },
  });

  if (error) {
    console.log("ensure_primary_parent edge error", error, data);
  } else {
    console.log("ensure_primary_parent edge ok", data);
  }
}

// --- helper: attach stub parent + ensure parent row
async function attachStubAndEnsureParent() {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    if (userErr) console.log("attachStub userErr", userErr);
    return;
  }

  const stubParentIdStr = await AsyncStorage.getItem("kidcan_parent_id");

  if (stubParentIdStr) {
    const stubParentId = Number(stubParentIdStr);

    const { error: updateErr } = await supabase
      .from("parents")
      .update({
        auth_user_id: user.id,
        email: user.email ?? null,
        password_hash: "supabase_managed_oauth",
      })
      .eq("id", stubParentId)
      .is("auth_user_id", null);

    if (updateErr) {
      console.log("attachStub updateErr", updateErr);
    } else {
      await AsyncStorage.removeItem("kidcan_parent_id");
    }
  }

  await ensurePrimaryParentEdge();
}

// -------------------------
// THUNKS
// -------------------------

// initial load
export const initAuth = createAsyncThunk<string | null>(
  "auth/initAuth",
  async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }
);

export const registerThunk = createAsyncThunk<
  string | null,
  {
    email: string;
    password: string;
    familyCode?: string | null;
    parentRole?: ParentRole | null;
  }
>("auth/register", async ({ email, password, familyCode, parentRole }) => {
  const trimmedEmail = email.trim();

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
  });

  if (error) {
    console.log("supabase.auth.signUp error", error);
    throw error;
  }

  const user = data.user;
  let session = data.session;

  if (!user) {
    throw new Error("No user returned from signUp");
  }

  // attach stub if exists (pairing before register)
  const stubParentIdStr = await AsyncStorage.getItem("kidcan_parent_id");
  console.log("Registering user, stubParentIdStr:", stubParentIdStr);

  if (stubParentIdStr) {
    const stubParentId = Number(stubParentIdStr);

    const { error: updateErr } = await supabase
      .from("parents")
      .update({
        auth_user_id: user.id,
        email: trimmedEmail,
        password_hash: "supabase_managed",
      })
      .eq("id", stubParentId)
      .is("auth_user_id", null);

    if (updateErr) {
      console.log("update stub parent error", updateErr);
      throw updateErr;
    }

    await AsyncStorage.removeItem("kidcan_parent_id");
  }

  await ensurePrimaryParentEdge();

  if (familyCode) {
    await completeFamilyJoin(familyCode, parentRole);
  }

  if (!session) {
    const {
      data: { session: freshSession },
      error: sessionErr,
    } = await supabase.auth.getSession();

    if (sessionErr) console.log("getSession error after signUp", sessionErr);
    session = freshSession ?? null;
  }

  return session?.access_token ?? null;
});

export const loginThunk = createAsyncThunk<
  string | null,
  { email: string; password: string }
>("auth/login", async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;

  // po login – pririšam stub + ensure
  await attachStubAndEnsureParent();

  return data.session?.access_token ?? null;
});

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await supabase.auth.signOut();
  return true;
});

export const googleLoginThunk = createAsyncThunk<
  void,
  { familyCode?: string | null; parentRole?: ParentRole | null } | undefined
>("auth/googleLogin", async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: GOOGLE_REDIRECT,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    console.log("googleLogin error", error);
    throw error;
  }

  if (!data?.url) {
    console.log("No OAuth URL returned from Supabase");
    return;
  }

  console.log("Opening Google OAuth URL:", data.url);
  await Linking.openURL(data.url);
});

// optional: kai deep link setSession padarytas, galim “post-auth” setup paleist
export const postAuthEnsureThunk = createAsyncThunk(
  "auth/postAuthEnsure",
  async () => {
    await attachStubAndEnsureParent();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }
);

// -------------------------
// SLICE
// -------------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(initAuth.pending, (s) => {
      s.isLoading = true;
      s.error = null;
    });
    b.addCase(initAuth.fulfilled, (s, a) => {
      s.token = a.payload;
      s.isLoading = false;
    });
    b.addCase(initAuth.rejected, (s, a) => {
      s.isLoading = false;
      s.error = a.error.message ?? "initAuth failed";
    });

    b.addCase(registerThunk.pending, (s) => {
      s.error = null;
    });
    b.addCase(registerThunk.fulfilled, (s, a) => {
      s.token = a.payload ?? null;
    });
    b.addCase(registerThunk.rejected, (s, a) => {
      s.error = a.error.message ?? "register failed";
    });

    b.addCase(loginThunk.pending, (s) => {
      s.error = null;
    });
    b.addCase(loginThunk.fulfilled, (s, a) => {
      s.token = a.payload ?? null;
    });
    b.addCase(loginThunk.rejected, (s, a) => {
      s.error = a.error.message ?? "login failed";
    });

    b.addCase(logoutThunk.fulfilled, (s) => {
      s.token = null;
      s.error = null;
    });

    b.addCase(googleLoginThunk.rejected, (s, a) => {
      s.error = a.error.message ?? "google login failed";
    });

    b.addCase(postAuthEnsureThunk.fulfilled, (s, a) => {
      // jei deep link setSession padarė – atnaujinam token
      if (a.payload !== undefined) s.token = a.payload;
    });
  },
});

export const { setToken, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
