import { UiActivityEvent } from "./activity";
import { supabase } from "./supabaseClient";

// pseudo: src/api/battery.ts
export async function fetchRecentBatteryEventsForChildren(
  childIds: number[],
  limit = 10
): Promise<UiActivityEvent[]> {
  if (!childIds.length) return [];

  const { data, error } = await supabase
    .from("battery_events")
    .select(
      `
      child_id,
      battery_percent,
      created_at,
      children ( name )
    `
    )
    .in("child_id", childIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  const rows = (data ?? []) as any[];

  return rows.map((row) => {
    const childName = row.children?.name ?? "Child";
    const percent = row.battery_percent ?? 0;

    return {
      id: `battery-${row.child_id}-${row.created_at}`,
      text: `${childName} baterija nukrito iki ${percent}%`,
      createdAt: row.created_at,
    };
  });
}
