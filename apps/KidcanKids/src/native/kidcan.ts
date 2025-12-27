import {NativeModules} from 'react-native';

type TKidcanModule = {
  openUsageAccessSettings: () => Promise<void>;
  openOverlaySettings: () => Promise<void>;
  openAccessibilitySettings: () => Promise<void>;
  openLocationSettings: () => Promise<void>;

  hideShield: () => Promise<void>;

  isUsageAccessGranted: () => Promise<boolean>;
  isOverlayPermissionGranted: () => Promise<boolean>;
  isAccessibilityEnabled: () => Promise<boolean>;
  isLocationPermissionGranted: () => Promise<boolean>;

  setBlockingEnabled: (enabled: boolean) => Promise<void>;
  isBlockingEnabled: () => Promise<boolean>;

  setShieldMessage: (message: string) => Promise<void>;
  blockForMinutes: (minutes: number, message: string) => Promise<void>;
  cancelBlock: () => Promise<void>;

  setChildContext: (childId: number, deviceId: string) => Promise<void>;

  requestLocationPermission: () => Promise<boolean>;

  // 👇 nauja
  isBatteryOptimizationIgnored: () => Promise<boolean>;
  openBatteryOptimizationSettings: () => Promise<void>;

  startBaseTracking: () => Promise<void>;
  startBoostTracking: () => Promise<void>;
  stopTracking: () => Promise<void>;
  updateTrackingConfig: (
    baseLocationMs: number,
    boostLocationMs: number,
    baseBatteryMs: number,
    boostBatteryMs: number,
  ) => Promise<void>;
};

const {KidcanModule} = NativeModules as {
  KidcanModule?: TKidcanModule;
};

if (!KidcanModule) {
  console.warn(
    'KidcanModule nerastas NativeModules. Patikrink MainApplication.getPackages ir KidcanPackage.',
  );
}

// settings
export const openUsageAccessSettings = () =>
  KidcanModule?.openUsageAccessSettings?.();

export const openAccessibilitySettings = () =>
  KidcanModule?.openAccessibilitySettings?.();

export const openOverlaySettings = () => KidcanModule?.openOverlaySettings?.();

export const openLocationSettings = () =>
  KidcanModule?.openLocationSettings?.();

// blocking / shield
export const setBlockingEnabled = (enabled: boolean) =>
  KidcanModule?.setBlockingEnabled?.(enabled);

export const isBlockingEnabled = async () =>
  (await KidcanModule?.isBlockingEnabled?.()) ?? false;

export const setShieldMessage = (message: string) =>
  KidcanModule?.setShieldMessage?.(message);

export const hideShield = () => KidcanModule?.hideShield?.();

export const blockForMinutes = (minutes: number, message: string) =>
  KidcanModule?.blockForMinutes?.(minutes, message);

export const cancelBlock = () => KidcanModule?.cancelBlock?.();

// permissions checks
export const isUsageAccessGranted = async () =>
  (await KidcanModule?.isUsageAccessGranted?.()) ?? false;

export const isOverlayPermissionGranted = async () =>
  (await KidcanModule?.isOverlayPermissionGranted?.()) ?? false;

export const isAccessibilityEnabled = async () =>
  (await KidcanModule?.isAccessibilityEnabled?.()) ?? false;

export const isLocationPermissionGranted = async () =>
  (await KidcanModule?.isLocationPermissionGranted?.()) ?? false;

export const requestLocationPermission = async () =>
  (await KidcanModule?.requestLocationPermission?.()) ?? false;

// child context
export const setNativeChildContext = async (
  childId: number,
  deviceId: string,
) => {
  await KidcanModule?.setChildContext?.(childId, deviceId);
};

// 🔹 tracking helpers

export const startBaseTracking = async () => {
  await KidcanModule?.startBaseTracking?.();
};

export const startBoostTracking = async () => {
  await KidcanModule?.startBoostTracking?.();
};

export const stopTracking = async () => {
  await KidcanModule?.stopTracking?.();
};

export const isBatteryOptimizationIgnored = async () =>
  (await KidcanModule?.isBatteryOptimizationIgnored?.()) ?? false;

export const openBatteryOptimizationSettings = () =>
  KidcanModule?.openBatteryOptimizationSettings?.();

export const updateTrackingConfig = (
  baseLocationMs: number,
  boostLocationMs: number,
  baseBatteryMs: number,
  boostBatteryMs: number,
) =>
  KidcanModule?.updateTrackingConfig?.(
    baseLocationMs,
    boostLocationMs,
    baseBatteryMs,
    boostBatteryMs,
  );
