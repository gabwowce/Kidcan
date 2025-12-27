// src/config/onboarding.ts
import type { RootStackParamList } from "../navigation/types";

// Onboarding step'ų tvarka (naudojama progress bar'ui ir pan.)
export const ONBOARDING_FLOW = [
  "ChooseLanguage",
  "ChooseRole",
  "AddOrJoin",
  "ChildName",
  "ChildGender",
  "ConnectChild",
  "ShowPairingCode",
  "JoinFamily",
  "JoinFamilySuccess",
  "PairingSuccess",
] as const satisfies (keyof RootStackParamList)[];

export type OnboardingRouteName = (typeof ONBOARDING_FLOW)[number];

// pairing / family invite timeout'ai
export const PAIRING_CODE_EXPIRES_MINUTES = 10;
export const PAIRING_STATUS_POLL_MS = 7000;

export const FAMILY_INVITE_EXPIRES_MINUTES = 10;
