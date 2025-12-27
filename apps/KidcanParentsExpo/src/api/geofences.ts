// src/api/geofences.ts
import { UiActivityEvent } from "./activity";
import { fetchChildrenForCurrentParent } from "./children";
import { supabase } from "./supabaseClient";

/** --- Geofence tipas --- */
export type GeofenceType = "HOME" | "SCHOOL" | "OTHER";

export type ChildLastLocation = {
  child_id: number;
  lat: number;
  lng: number;
  recorded_at: string;
  address?: string | null;
};

/** --- Geofence events iš DB --- */
export type DbGeofenceEventRow = {
  child_id: number;
  geofence_id: number;
  event_type: "ENTER" | "EXIT";
  created_at: string;
  children: {
    name: string | null;
  } | null;
  geofences: {
    name: string | null;
  } | null;
};

/**
 * Sukuria IDENTIŠKĄ geofence visiems šio tėvo vaikams.
 */
export async function createGeofenceForAllChildren(params: {
  name: string;
  type: GeofenceType;
  centerLat: number;
  centerLng: number;
  radiusM: number;
}) {
  const parentId = await getCurrentParentId();

  // visi vaikai šitam tėvui
  const children = await fetchChildrenForCurrentParent(); // [{id, name}, ...]

  if (!children.length) {
    throw new Error("Parent has no children");
  }

  const rows = children.map((child) => ({
    parent_id: parentId,
    child_id: child.id,
    name: params.name,
    type: params.type,
    center_lat: params.centerLat,
    center_lng: params.centerLng,
    radius_m: params.radiusM,
  }));

  const { error } = await supabase.from("geofences").insert(rows);

  if (error) {
    console.log("createGeofenceForAllChildren error", error);
    throw error;
  }
}

/**
 * Grąžina pačią naujausią lokaciją iš child_locations
 * tarp nurodytų vaikų (naudosim pirmam demo).
 */
export async function fetchLastLocationForChildren(
  childIds: number[]
): Promise<ChildLastLocation | null> {
  if (!childIds.length) return null;

  const { data, error } = await supabase
    .from("child_locations")
    .select("child_id, lat, lng, recorded_at, address")
    .in("child_id", childIds)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.log("fetchLastLocationForChildren error", error);
    throw error;
  }

  return data ?? null;
}

/** --- Pagal auth user -> parent.id --- */
export async function getCurrentParentId(): Promise<number> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw error ?? new Error("User not logged in");
  }

  const { data: parent, error: parentErr } = await supabase
    .from("parents")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (parentErr || !parent) {
    throw parentErr ?? new Error("Parent not found");
  }

  return parent.id as number;
}

/** --- Geofence CRUD --- */
export async function createGeofence(params: {
  childId: number;
  name: string;
  type: GeofenceType;
  centerLat: number;
  centerLng: number;
  radiusM: number;
}) {
  const parentId = await getCurrentParentId();

  const { error } = await supabase.from("geofences").insert({
    parent_id: parentId,
    child_id: params.childId,
    name: params.name,
    type: params.type,
    center_lat: params.centerLat,
    center_lng: params.centerLng,
    radius_m: params.radiusM,
  });

  if (error) {
    console.log("createGeofence error", error);
    throw error;
  }
}

export async function listGeofencesForChild(childId: number) {
  const parentId = await getCurrentParentId();

  const { data, error } = await supabase
    .from("geofences")
    .select("*")
    .eq("parent_id", parentId)
    .eq("child_id", childId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("listGeofencesForChild error", error);
    throw error;
  }

  return data ?? [];
}

/** --- Geofence eventai tėvų dashboardui (activity feed) --- */
export async function fetchRecentGeofenceEventsForChildren(
  childIds: number[],
  limit = 10
): Promise<UiActivityEvent[]> {
  if (!childIds.length) return [];

  const { data, error } = await supabase
    .from("geofence_events")
    .select(
      `
      child_id,
      geofence_id,
      event_type,
      created_at,
      children ( name ),
      geofences ( name )
    `
    )
    .in("child_id", childIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.log("fetchRecentGeofenceEvents error", error);
    throw error;
  }

  const rows = (data ?? []) as unknown as DbGeofenceEventRow[];

  return rows.map((row) => {
    const childName = row.children?.name ?? "Child";
    const zoneName = row.geofences?.name ?? `zone #${row.geofence_id ?? "??"}`;
    const action = row.event_type === "ENTER" ? "atvyko į" : "išėjo iš";

    return {
      id: `geo-${row.child_id}-${row.geofence_id}-${row.created_at}`,
      text: `${childName} ${action} „${zoneName}“`,
      createdAt: row.created_at,
    };
  });
}
