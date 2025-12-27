// src/api/children.ts
import { PAIRING_CODE_EXPIRES_MINUTES } from "../config/onboarding";
import { ParentRole } from "../config/parentRoles";
import { supabase } from "./supabaseClient";

export type DbChild = {
  id: number;
  name: string | null;
  gender: "son" | "daughter" | null; // pagal tavo lentelę
  is_active: boolean;
  paired_at: string | null;
};
export type FamilyInvite = {
  code: string;
  parent_id: number;
  expires_at: string;
};

/** Grąžina parentId pagal prisijungusį userį (kuria jei nėra) */
export async function ensurePrimaryParent(): Promise<number> {
  const { data, error } = await supabase.functions.invoke("family", {
    body: { action: "ensure_primary_parent" },
  });

  if (error || !data?.parentId) {
    console.log("ensurePrimaryParent error", error, data);
    throw new Error("Failed to ensure parent");
  }

  return data.parentId as number;
}

/** Sugeneruoja šeimos kvietimo kodą naudojant tavo create_family_invite() */

export async function createFamilyInvite(): Promise<FamilyInvite> {
  const parentId = await ensurePrimaryParent();

  // 👇 NEBEDUODAM generiko, paliekam tipą iš DB
  const { data, error } = await supabase.rpc("generate_family_invite", {
    _parent_id: parentId,
    _expires_in_minutes: PAIRING_CODE_EXPIRES_MINUTES,
  });

  console.log("generate_family_invite data >>>", data, error);

  if (error || !data) {
    console.log("createFamilyInvite error", error, data);
    throw new Error(error?.message ?? "Failed to create family invite");
  }

  // priklauso nuo tavo SQL funkcijos:
  // jei ji grąžina SETOF -> data yra masyvas
  if (Array.isArray(data)) {
    if (!data[0]) {
      throw new Error("generate_family_invite returned empty array");
    }
    return data[0] as FamilyInvite;
  }

  // jei grąžina single row (RETURNS family_invites):
  return data as FamilyInvite;
}

async function callFunction<T = any>(body: any): Promise<T> {
  // 🔐 ČIA užtikrinam, kad user yra prisijungęs
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not logged in");
  }

  const { data, error } = await supabase.functions.invoke<T>("children", {
    body,
  });

  if (error) {
    console.log("children function error:", error);
    throw new Error(error.message || "Children function failed");
  }

  return data as T;
}

export async function fetchChildrenForCurrentParent(): Promise<DbChild[]> {
  const data = await callFunction<DbChild[]>({ action: "list" });
  return data ?? [];
}

export async function updateChildName(childId: number, name: string) {
  const data = await callFunction<{ success: boolean }>({
    action: "update_name",
    childId,
    name,
  });

  if (!data?.success) {
    throw new Error("Failed to update child name");
  }
}

/** Tikrinam, ar kodas galioja – atspindi Edge function `action: "check_code"` */
export async function checkFamilyCode(
  code: string
): Promise<FamilyInvite | null> {
  const clean = code.replace(/\s/g, "");

  const { data, error } = await supabase.functions.invoke("family", {
    body: {
      action: "check_code",
      code: clean,
    },
  });

  console.log("checkFamilyCode result >>>", data, error);

  if (error) {
    throw new Error(error.message || "Failed to check family code");
  }

  // Edge funkcija grąžina `null`, jei kodas neteisingas / pasibaigęs / used
  if (!data) return null;

  return data as FamilyInvite;
}

/**
 * Užbaigia prisijungimą prie šeimos po registracijos/login
 * (edge action: "complete_join")
 */
export async function completeFamilyJoin(
  code: string,
  parentRole: ParentRole | null = "parent" as ParentRole
): Promise<{ success: boolean; childrenLinked: number }> {
  const { data, error } = await supabase.functions.invoke("family", {
    body: {
      action: "complete_join",
      code,
      parentRole: parentRole ?? "parent",
    },
  });

  if (error) throw new Error(error.message || "Failed to complete family join");

  return (data ?? { success: false, childrenLinked: 0 }) as {
    success: boolean;
    childrenLinked: number;
  };
}
