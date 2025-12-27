// src/api/deviceStatus.ts
import { supabase } from "./supabaseClient";

export type ChildBatteryRow = {
  child_id: number;
  battery_percent: number;
};

/**
 * Grąžina map'ą: childId -> batteryPercent
 */
export async function fetchBatteryForChildren(
  childIds: number[]
): Promise<Record<number, number>> {
  if (!childIds.length) return {};

  const { data, error } = await supabase
    .from("child_device_status")
    .select("child_id, battery_percent")
    .in("child_id", childIds);

  if (error) {
    console.log("fetchBatteryForChildren error", error);
    throw error;
  }

  const rows = (data ?? []) as ChildBatteryRow[];
  const map: Record<number, number> = {};

  for (const row of rows) {
    map[row.child_id] = row.battery_percent;
  }

  return map;
}
