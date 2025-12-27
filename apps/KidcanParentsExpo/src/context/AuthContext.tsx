// src/context/AuthContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { Linking } from "react-native";
import { completeFamilyJoin } from "../api/family";
import { supabase } from "../api/supabaseClient";
import type { ParentRole } from "../config/parentRoles";

const GOOGLE_REDIRECT = "kidcanparent://auth/callback";

type AuthContextType = {
  token: string | null;
  isLoading: boolean;
  register: (
    email: string,
    password: string,
    familyCode?: string | null,
    parentRole?: ParentRole | null
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: (
    familyCode?: string | null,
    parentRole?: ParentRole | null
  ) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // helperis – kviečia edge ensure_primary_parent
  const ensurePrimaryParentEdge = async () => {
    const { data, error } = await supabase.functions.invoke("family", {
      body: { action: "ensure_primary_parent" },
    });

    if (error) {
      console.log("ensure_primary_parent edge error", error, data);
    } else {
      console.log("ensure_primary_parent edge ok", data);
    }
  };

  // inicialinis sesijos užkrovimas
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setToken(session?.access_token ?? null);
      }
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Kai turim token – pririšam stub parent (jei yra) ir viską kitą paliekam edge
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const attachStubAndEnsureParent = async () => {
      try {
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();

        if (userErr || !user || cancelled) {
          if (userErr) console.log("ensureParent userErr", userErr);
          return;
        }

        // 1) pabandom pririšti stub parent iš AsyncStorage (jei buvo pairing iš vaiko pusės)
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
            .is("auth_user_id", null); // tik jei dar stub

          if (updateErr) {
            console.log("ensureParent stub updateErr", updateErr);
          } else {
            await AsyncStorage.removeItem("kidcan_parent_id");
          }
        }

        // 2) tikrą parents eilutę dabar tvarko edge (idempotentiškai)
        await ensurePrimaryParentEdge();
      } catch (e) {
        console.log("ensureParent exception", e);
      }
    };

    attachStubAndEnsureParent();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // --------------------
  // REGISTER (email/password)
  // --------------------
  const register = async (
    email: string,
    password: string,
    familyCode?: string | null,
    parentRole: ParentRole | null = null
  ) => {
    const trimmedEmail = email.trim();

    // 1) signUp į Supabase
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
    });

    if (error) {
      console.log("supabase.auth.signUp error", error);
      throw error;
    }

    const user = data.user;
    let session = data.session; // jei Confirm email OFF – bus čia

    if (!user) {
      throw new Error("No user returned from signUp");
    }

    // 2) pririšam stub parent (jei buvo pairing prieš registraciją)
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

    // 3) tikrą parent eilutę (jei jos dar nėra) sukuria edge
    await ensurePrimaryParentEdge();

    // 4) jei buvo familyCode – prijungiam prie šeimos (edge complete_join)
    if (familyCode) {
      await completeFamilyJoin(familyCode, parentRole);
    }

    // 5) Session tvarkymas – jei po signUp neturim session, pabandom pasiimti
    if (!session) {
      const {
        data: { session: freshSession },
        error: sessionErr,
      } = await supabase.auth.getSession();

      if (sessionErr) {
        console.log("getSession error after signUp", sessionErr);
      }
      session = freshSession ?? null;
    }

    if (session?.access_token) {
      setToken(session.access_token);
    } else {
      console.log(
        "No active session yet after signUp (probably email confirm ON)"
      );
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    setToken(data.session?.access_token ?? null);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setToken(null);
  };

  const googleLogin = async (
    _familyCode?: string | null,
    _parentRole?: ParentRole | null
  ) => {
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
  };

  return (
    <AuthContext.Provider
      value={{ token, isLoading, register, login, logout, googleLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
