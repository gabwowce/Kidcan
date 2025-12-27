import {supabase} from './supabaseClient';

export type GeofenceEventType = 'ENTER' | 'EXIT';

export type GeofenceEvent = {
  geofence_id: number;
  event_type: GeofenceEventType;
  created_at: string;
};

export async function sendChildLocation(
  childId: number,
  lat: number,
  lng: number,
  accuracy_m?: number,
): Promise<GeofenceEvent[]> {
  const {data, error} = await supabase.rpc('process_child_location', {
    _child_id: childId,
    _lat: lat,
    _lng: lng,
    _accuracy_m: accuracy_m ?? null,
  });

  if (error) {
    console.log('process_child_location error', error);
    throw error;
  }

  // 👇 normalizuojam laukus iš DB į gražų tipą
  const normalized: GeofenceEvent[] = (data ?? []).map((row: any) => ({
    geofence_id: row.geofence_id ?? row.out_geofence_id,
    event_type: row.event_type ?? row.out_event_type,
    created_at: row.created_at ?? row.out_created_at,
  }));

  return normalized;
}
