import { supabase } from "./supabaseClient";

export type DbChild = {
  id: number;
  name: string | null;
  gender: "son" | "daughter" | null; // pagal tavo lentelę
  is_active: boolean;
  paired_at: string | null;
};

export type DbChildStatus = {
  id: number;
  is_active: boolean;
  paired_at: string | null;
};
const FUNCTION_URL =
  "https://ysvokjlcxqvrjqqjvxmi.supabase.co/functions/v1/children";

async function callFunction(body: any) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token ?? null;
  if (!token) {
    throw new Error("Not logged in");
  }

  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid JSON response from children function");
  }

  if (!res.ok) {
    console.log("children function error:", data);
    throw new Error(data.error || "Children function failed");
  }

  return data;
}

/**
 * Grąžina visus prisijungusio tėvo vaikus iš DB
 */
export async function fetchChildrenForCurrentParent(): Promise<DbChild[]> {
  const data = await callFunction({ action: "list" });
  return (data ?? []) as DbChild[];
}

/**
 * Atnaujina vaiko vardą
 */
export async function updateChildName(childId: number, name: string) {
  const data = await callFunction({
    action: "update_name",
    childId,
    name,
  });

  if (!data?.success) {
    throw new Error("Failed to update child name");
  }
}

export async function getChildStatus(
  childId: number
): Promise<DbChildStatus | null> {
  const { data, error } = await supabase
    .from("children")
    .select("id, is_active, paired_at")
    .eq("id", childId)
    .maybeSingle();

  if (error) {
    console.log("getChildStatus error", error);
    throw error;
  }

  return data;
}
