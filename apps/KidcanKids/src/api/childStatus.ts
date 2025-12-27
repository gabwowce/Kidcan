// src/api/childStatus.ts

import {updateTrackingConfig} from '../native/kidcan';
import {supabase} from './supabaseClient';

export async function updateChildBattery(
  childId: number,
  deviceId: string,
  batteryPercent: number,
): Promise<void> {
  const {error} = await supabase.rpc('upsert_child_device_status', {
    _child_id: childId,
    _device_id: deviceId,
    _battery_percent: batteryPercent,
  });

  if (error) {
    console.log('upsert_child_device_status error', error);
    throw error;
  }
}

export async function syncTrackingConfigFromServer(childId: number) {
  const {data, error} = await supabase.functions.invoke('tracking-config', {
    body: {childId},
  });

  if (error || !data) {
    console.log('tracking-config error', error);
    return;
  }

  await updateTrackingConfig(
    data.base_location_interval_ms,
    data.boost_location_interval_ms,
    data.base_battery_interval_ms,
    data.boost_battery_interval_ms,
  );
}
