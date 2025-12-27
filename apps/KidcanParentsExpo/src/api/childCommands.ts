// src/api/childCommands.ts
import { supabase } from "./supabaseClient";

export type ChildCommandType =
  | "REMOTE_SIREN"
  | "START_BATTERY_SYNC"
  | "STOP_BATTERY_SYNC"
  | "START_LOCATION_SYNC"
  | "STOP_LOCATION_SYNC";

const COMMAND_ACTION_MAP: Record<ChildCommandType, string> = {
  REMOTE_SIREN: "remote_siren",
  START_BATTERY_SYNC: "start_battery_sync",
  STOP_BATTERY_SYNC: "stop_battery_sync",
  START_LOCATION_SYNC: "start_location_sync",
  STOP_LOCATION_SYNC: "stop_location_sync",
};

export async function sendChildCommand(params: {
  childId: number;
  commandType: ChildCommandType;
  payload?: any;
}) {
  const { childId, commandType, payload } = params;

  const action = COMMAND_ACTION_MAP[commandType];
  if (!action) {
    throw new Error(`Unsupported commandType: ${commandType}`);
  }

  const { error } = await supabase.functions.invoke("child_commands", {
    body: {
      action,
      childId,
      payload: payload ?? null,
    },
  });

  if (error) {
    console.log("[child_commands] error", error);
    throw new Error(error.message || "Failed to send command");
  }
}
