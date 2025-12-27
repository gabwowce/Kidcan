import type { ChildCommandType } from "../api/childCommands";

export type QuickActionId = "remote_siren"; // plėsi, kai atsiras daugiau

export type QuickActionConfig = {
  id: QuickActionId;
  commandType: ChildCommandType;

  // i18n raktai
  titleKey: string;
  subtitleKey: string;
  buttonLabelKey: string;
};

export const QUICK_ACTIONS: QuickActionConfig[] = [
  {
    id: "remote_siren",
    commandType: "REMOTE_SIREN",
    titleKey: "dashboard.quickActions.remoteSiren.title",
    subtitleKey: "dashboard.quickActions.remoteSiren.subtitle",
    buttonLabelKey: "dashboard.quickActions.remoteSiren.button",
  },
];
