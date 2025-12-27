// src/navigation/RootNavigator.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect, useRef} from 'react';
import {ActivityIndicator, View} from 'react-native';

import {supabase} from '../api/supabaseClient';
import {useApp} from '../contexts/AppContext';
import {getFcmTokenSafely} from '../firebase/messaging';
import {setNativeChildContext} from '../native/kidcan';
import PairingScreen from '../screens/onboarding/PairingScreen';
import PermissionsScreen from '../screens/onboarding/PermissionsScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import MainTabsNavigator from './MainTabsNavigator';

export type RootStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingPermissions: undefined;
  OnboardingPairing: undefined;
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const DEVICE_ID_KEY = 'kidcan_device_id';
const LEGACY_DEVICE_ID = 'ANDROID-1764831461355-47526'; // tavo senas ID

const RootNavigator = () => {
  const {state, isLoading, setChildPairing} = useApp();

  const nativeContextSetRef = useRef(false);
  const didRunMigrationRef = useRef(false);

  // ⚠️ DEV: kol kas pririšam šitą telefoną prie vaiko id=1
  // Po to, kai viskas veiks ir bus tikras pairing’as – šitą bloką ištrink.
  useEffect(() => {
    if (!state.childId) {
      setChildPairing(1, 'Gabriele');
    }
  }, [state.childId, setChildPairing]);

  // 🔁 1) vienkartinis migracijos kodas jau supairintam vaikui
  useEffect(() => {
    const runMigrationOnce = async () => {
      if (didRunMigrationRef.current) {
        return;
      }
      if (!state.childId) {
        return;
      } // dar nežinom vaiko

      didRunMigrationRef.current = true;

      try {
        // įrašom seną deviceId į AsyncStorage, jei dar nėra
        const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
        if (!existing) {
          await AsyncStorage.setItem(DEVICE_ID_KEY, LEGACY_DEVICE_ID);
          console.log('[Kidcan MIGRATION] saved legacy deviceId');
        }

        // 🔹 nauja – atnaujinam FCM tokeną devices lentelėje
        const fcmToken = await getFcmTokenSafely();
        if (fcmToken) {
          await supabase.functions.invoke('pairing', {
            body: {
              action: 'update_device_fcm_token',
              childId: state.childId,
              deviceId: LEGACY_DEVICE_ID,
              fcmToken,
            },
          });
          console.log('[Kidcan MIGRATION] FCM token updated');
        } else {
          console.log('[Kidcan MIGRATION] No FCM token, skipping update');
        }

        // iškart pasakom native
        await setNativeChildContext?.(state.childId, LEGACY_DEVICE_ID);
        nativeContextSetRef.current = true;
        console.log(
          '[Kidcan MIGRATION] native child context set',
          state.childId,
          LEGACY_DEVICE_ID,
        );
      } catch (e) {
        console.log('[Kidcan MIGRATION] error', e);
      }
    };

    void runMigrationOnce();
  }, [state.childId]);

  // 🔁 2) normalus future behavior – jei kada kitą kartą childId + deviceId keisis
  useEffect(() => {
    const syncChildContextToNative = async () => {
      if (!state.childId) {
        return;
      }
      if (nativeContextSetRef.current) {
        return;
      }

      const deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (!deviceId) {
        console.log(
          '[Kidcan] No deviceId in AsyncStorage, skipping native sync',
        );
        return;
      }

      try {
        await setNativeChildContext?.(state.childId, deviceId);
        nativeContextSetRef.current = true;
        console.log(
          '[Kidcan] Native child context set',
          state.childId,
          deviceId,
        );
      } catch (e) {
        console.log('setNativeChildContext error', e);
      }
    };

    void syncChildContextToNative();
  }, [state.childId]);

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator />
      </View>
    );
  }

  const hasOnboarded = state.profile.hasCompletedOnboarding;
  const isPaired = !!state.childId;

  const initialRoute: keyof RootStackParamList = !hasOnboarded
    ? 'OnboardingWelcome'
    : isPaired
    ? 'MainTabs'
    : 'OnboardingPairing';

  return (
    <Stack.Navigator
      key={initialRoute}
      initialRouteName={initialRoute}
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="OnboardingWelcome" component={WelcomeScreen} />
      <Stack.Screen
        name="OnboardingPermissions"
        component={PermissionsScreen}
      />
      <Stack.Screen name="OnboardingPairing" component={PairingScreen} />
      <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
