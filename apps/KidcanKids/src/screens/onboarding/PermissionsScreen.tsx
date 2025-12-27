import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  AppState,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {colors} from '../../constants/colors';
import {useApp} from '../../contexts/AppContext';
import {
  isAccessibilityEnabled,
  isBatteryOptimizationIgnored,
  isLocationPermissionGranted,
  isOverlayPermissionGranted,
  isUsageAccessGranted,
  openAccessibilitySettings,
  openBatteryOptimizationSettings,
  openLocationSettings,
  openOverlaySettings,
  openUsageAccessSettings,
} from '../../native/kidcan';

import type {RootStackParamList} from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'OnboardingPermissions'
>;

type Perms = {
  usage: boolean;
  overlay: boolean;
  accessibility: boolean;
  location: boolean;
  battery: boolean; // 👈 nauja
};

export default function PermissionsScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const {state} = useApp();
  const isPaired = !!state.childId;

  const [perms, setPerms] = useState<Perms | null>(null);
  const [loadingPerms, setLoadingPerms] = useState(true);
  const [finishing, setFinishing] = useState(false);

  const loadPerms = async () => {
    setLoadingPerms(true);
    try {
      const [u, o, a, loc, batt] = await Promise.all([
        isUsageAccessGranted(),
        isOverlayPermissionGranted(),
        isAccessibilityEnabled(),
        isLocationPermissionGranted(),
        isBatteryOptimizationIgnored(), // 👈
      ]);
      setPerms({
        usage: u,
        overlay: o,
        accessibility: a,
        location: loc,
        battery: batt,
      });
    } finally {
      setLoadingPerms(false);
    }
  };

  useEffect(() => {
    loadPerms();

    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        loadPerms();
      }
    });

    return () => {
      sub.remove();
    };
  }, []);

  const allGranted = !!(
    perms?.usage &&
    perms?.overlay &&
    perms?.accessibility &&
    perms?.location &&
    perms?.battery
  );

  useEffect(() => {
    if (allGranted && !finishing) {
      setFinishing(true);

      navigation.reset({
        index: 0,
        routes: [{name: isPaired ? 'MainTabs' : 'OnboardingPairing'}],
      });
    }
  }, [allGranted, finishing, isPaired, navigation]);

  if (loadingPerms || finishing) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {paddingTop: insets.top, paddingBottom: insets.bottom},
        ]}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Preparing your experience...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        {paddingTop: insets.top, paddingBottom: insets.bottom},
      ]}>
      <View style={styles.content}>
        <Text style={styles.title}>One last gentle step</Text>
        <Text style={styles.subtitle}>
          To softly block distracting apps and show your kid&apos;s location, we
          need these permissions:
        </Text>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>1. Usage Access</Text>
          <Text style={styles.blockText}>
            Allows Kidcan to see which app is currently open.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={openUsageAccessSettings}>
            <Text style={styles.buttonText}>
              {perms?.usage
                ? '✅ Already granted'
                : 'Open Usage Access settings'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>2. Overlay</Text>
          <Text style={styles.blockText}>
            Lets us show a gentle reminder over distracting apps.
          </Text>
          <TouchableOpacity style={styles.button} onPress={openOverlaySettings}>
            <Text style={styles.buttonText}>
              {perms?.overlay
                ? '✅ Already granted'
                : 'Allow "Draw over other apps"'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>3. Accessibility</Text>
          <Text style={styles.blockText}>
            Allows Kidcan to detect when apps change and apply focus rules.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={openAccessibilitySettings}>
            <Text style={styles.buttonText}>
              {perms?.accessibility
                ? '✅ Already granted'
                : 'Enable Kidcan accessibility service'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>4. Location</Text>
          <Text style={styles.blockText}>
            Lets Kidcan see the device location to show it on your parent’s map
            and detect safe zones.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={openLocationSettings}>
            <Text style={styles.buttonText}>
              {perms?.location
                ? '✅ Location allowed (tap to change)'
                : 'Open location settings'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>5. Keep Kidcan running</Text>
          <Text style={styles.blockText}>
            Ask Android not to put Kidcan to sleep in the background, so
            location and battery stay up to date.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={openBatteryOptimizationSettings}>
            <Text style={styles.buttonText}>
              {perms?.battery
                ? '✅ Battery optimization already disabled'
                : 'Allow Kidcan to run in background'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          As soon as all permissions are enabled, we&apos;ll move on to pairing
          with your parent’s app.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: colors.textSoft,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSoft,
    textAlign: 'center',
  },
  block: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  blockText: {
    fontSize: 14,
    color: colors.textSoft,
  },
  button: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
  },
  secondaryButton: {
    marginTop: 6,
    backgroundColor: '#f3ede9',
  },
  buttonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    color: colors.textSoft,
    textAlign: 'center',
  },
  locationHint: {
    fontSize: 12,
    color: colors.textSoft,
    marginTop: 6,
  },
});
