// src/navigation/types.ts
import type { ParentRole } from "../config/parentRoles";
export type RootStackParamList = {
  // Onboarding
  Welcome: undefined;
  ChooseLanguage: undefined;
  ChooseRole: undefined;
  AddOrJoin: { role: ParentRole };

  // 👇 nauji step'ai
  ChildName: { role: ParentRole };
  ChildGender: { role: ParentRole; childName: string };

  ConnectChild: {
    role: ParentRole;
    childName: string;
    childGender: string;
  };

  JoinFamily: { role: ParentRole };
  ShowPairingCode: {
    pairingCode: string;
    rawCode: string;
    childId: number;
    childName: string;
    childGender: string;
    role: ParentRole;
  };
  JoinFamilySuccess: { familyCode: string };
  JoinFamilyHelp: undefined;
  PairingSuccess: {
    childId: number;
    childName: string;
    role: ParentRole;
  };

  // Auth
  Login: undefined;
  Register:
    | {
        familyCode?: string;
        variant?: "returning" | "afterPairing";
      }
    | undefined;

  // Main
  Dashboard: undefined;
  ChildDetails: { childId: number; childName: string };
};

export type DashboardTabParamList = {
  DashboardHome: undefined;
  Locations: undefined;
  Activity: undefined;
  Settings: undefined;
};

// SETTINGS stack (viduje Settings tab'o)
export type SettingsStackParamList = {
  SettingsHome: undefined;
  Profile: undefined;
  ChildrenList: undefined;
  LanguageSettings: undefined;
  InviteParent: undefined;
  InviteParentSuccess: { code: string } | undefined;
  TrackingSettings: undefined;

  AddChildName: undefined;
  AddChildGender: { childName: string };
  AddChildShowPairingCode: {
    pairingCode: string;
    rawCode: string;
    childId: number;
    childName: string;
  };
};
