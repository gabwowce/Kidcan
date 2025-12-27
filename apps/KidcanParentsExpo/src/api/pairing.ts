// src/api/pairing.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  PAIRING_CODE_EXPIRES_MINUTES,
  PAIRING_STATUS_POLL_MS,
} from '../config/onboarding';
import type { ParentRole } from '../config/parentRoles';
import { getChildStatus } from './children';
import { supabase } from './supabaseClient';

export type PairingCodeRow = {
  code: string;
  parent_id: number;
  child_id: number;
  expires_at: string;
  used?: boolean;
};

export type ParentStubStatus = {
  hasActiveChild: boolean;
  childId: number | null;
  childName: string | null;
};

const PARENT_KEY = 'kidcan_parent_id';
const PENDING_CHILD_KEY = 'kidcan_pending_child_id';

function normalizePairingRow(raw: any): PairingCodeRow {
  return {
    code: raw.code,
    parent_id: raw.parent_id ?? raw.parentId,
    child_id: raw.child_id ?? raw.childId,
    expires_at: raw.expires_at ?? raw.expiresAt,
    used: raw.used,
  };
}

async function callFunction(body: any) {
  console.log('pairing: sending body =>', body);

  const { data, error } = await supabase.functions.invoke('pairing', {
    body,
  });

  if (error) {
    console.log('pairing function error:', error, 'body was:', body);
    throw new Error(error.message || 'Function request failed');
  }

  return data;
}

/**
 * Stub parent status (naudojama AppNavigator bootstrapui)
 */
export type StubStatus = {
  hasAnyChild: boolean;
  hasActiveChild: boolean;
};

export async function getParentStubStatus(
  parentId: number,
): Promise<StubStatus> {
  const data = await callFunction({
    action: 'get_parent_stub_status',
    parentId,
  });

  return data as StubStatus;
}

/**
 * Sukuria arba atnaujina pairing kodą:
 * - jei turim NEBAIGTĄ vaiką -> regeneruojam kodą tam pačiam vaikui
 * - jei vaikas jau aktyvus/poruotas -> kuriam naują vaiką
 */
export async function createPairing(
  childName: string,
  childGender: string,
  role: ParentRole | null,
): Promise<PairingCodeRow> {
  // ⬇️ patikrinam ar esam prisijungę
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const isLoggedIn = !!session?.user;

  const existingStubParent = isLoggedIn
    ? null
    : await AsyncStorage.getItem(PARENT_KEY);

  const pendingChildIdStr = await AsyncStorage.getItem(PENDING_CHILD_KEY);

  console.log(
    'createPairing -> isLoggedIn:',
    isLoggedIn,
    'existingStubParent:',
    existingStubParent,
    'pendingChildIdStr:',
    pendingChildIdStr,
  );

  // 1) pending child reuse – čia paliekam kaip buvo
  if (pendingChildIdStr) {
    const pendingChildId = Number(pendingChildIdStr);
    const child = await getChildStatus(pendingChildId);

    if (child && !child.is_active && !child.paired_at) {
      const raw = await regeneratePairingForChild(pendingChildId);
      const data = normalizePairingRow(raw);

      await AsyncStorage.setItem(PENDING_CHILD_KEY, String(data.child_id));

      console.log('createPairing -> reused existing child', data.child_id);
      return data;
    }

    console.log(
      'createPairing -> pending child no longer pending, cleaning up key',
    );
    await AsyncStorage.removeItem(PENDING_CHILD_KEY);
  }

  // 2) naujas vaikas + pairing kodas
  const raw = await callFunction({
    action: 'create',
    childName,
    childGender,
    role: role ?? 'parent',
    // ⬇️ stubParentId perduodam tik guest flow
    stubParentId:
      !isLoggedIn && existingStubParent ? Number(existingStubParent) : null,
    expiresInMinutes: PAIRING_CODE_EXPIRES_MINUTES,
  });

  const data = normalizePairingRow(raw);

  // ⬇️ guest scenarijus – saugom stub parent tik jei NE prisijungę
  if (!isLoggedIn && !existingStubParent && data.parent_id != null) {
    await AsyncStorage.setItem(PARENT_KEY, String(data.parent_id));
  }

  if (data.child_id != null) {
    await AsyncStorage.setItem(PENDING_CHILD_KEY, String(data.child_id));
  }

  console.log('createPairing -> created NEW child', data.child_id);

  return data;
}

/**
 * 2) Naujas vaiko device (reikalingas auth)
 */
export async function createPairingForAnotherKidsDevice(
  childId: number,
): Promise<PairingCodeRow> {
  const raw = await callFunction({
    action: 'create_for_another_device',
    childId,
    expiresInMinutes: PAIRING_CODE_EXPIRES_MINUTES,
  });

  return normalizePairingRow(raw);
}

/**
 * 3) Patikrina pairing status
 */
export async function getPairingStatus(
  codeParam: string | number,
  childIdParam: string | number,
) {
  const data = await callFunction({
    action: 'status',
    code: String(codeParam),
    childId: Number(childIdParam),
  });

  return data; // { used, expiresAt, isExpired } arba null
}

/**
 * 4) Debug (dev only)
 */
export async function debugPairingTable() {
  const data = await callFunction({ action: 'debug' });
  console.log('debugPairingTable =>', data);
}

/**
 * 5) Regeneracija (stub scenarijus – tik pirmas tėvas prieš registraciją)
 */
export async function regeneratePairingForChild(
  childId: number,
): Promise<PairingCodeRow> {
  const stub = await AsyncStorage.getItem(PARENT_KEY);
  if (!stub) throw new Error('No stub parent stored');

  const raw = await callFunction({
    action: 'regenerate',
    childId,
    stubParentId: Number(stub),
    expiresInMinutes: PAIRING_CODE_EXPIRES_MINUTES,
  });

  return normalizePairingRow(raw);
}

export async function deleteUnusedPairingCodesForChild(
  childId: number,
  code: string,
) {
  const { error } = await supabase
    .from('pairing_codes')
    .delete()
    .eq('child_id', childId)
    .eq('code', code)
    .eq('used', false);

  if (error) {
    console.log('deleteUnusedPairingCodesForChild error', error);
    throw error;
  }
}

export { PAIRING_STATUS_POLL_MS };
