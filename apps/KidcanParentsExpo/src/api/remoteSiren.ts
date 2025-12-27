// src/api/remoteSiren.ts
import { supabase } from "./supabaseClient";

export async function requestRemoteSiren(childId: number) {
  const { error } = await supabase.from("siren_requests").insert({
    child_id: childId,
    device_id: null, // arba kažkada konkretaus device id, jei turėsim
  });

  if (error) {
    console.log("requestRemoteSiren error", error);
    throw error;
  }
}
