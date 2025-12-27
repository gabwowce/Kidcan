import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { useAppSelector } from "../store/hooks";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import JoinFamilyHelpScreen from "../screens/onboarding/join-family/JoinFamilyHelpScreen";
import JoinFamilyScreen from "../screens/onboarding/join-family/JoinFamilyScreen";
import JoinFamilySuccessScreen from "../screens/onboarding/join-family/JoinFamilySuccessScreen";
import ChildGenderScreen from "../screens/onboarding/parent-link/ChildGenderScreen";
import ChildNameScreen from "../screens/onboarding/parent-link/ChildNameScreen";
import ConnectChildScreen from "../screens/onboarding/parent-link/ConnectChildScreen";
import PairingSuccessScreen from "../screens/onboarding/parent-link/PairingSuccessScreen";
import ShowPairingCodeScreen from "../screens/onboarding/parent-link/ShowPairingCodeScreen";
import AddOrJoinScreen from "../screens/onboarding/steps/AddOrJoinScreen";
import ChooseLanguageScreen from "../screens/onboarding/steps/ChooseLanguageScreen";
import ChooseRoleScreen from "../screens/onboarding/steps/ChooseRoleScreen";
import WelcomeScreen from "../screens/onboarding/steps/WelcomeScreen";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function OnboardingNavigator() {
  const token = useAppSelector((s) => s.auth.token);
  const isLoggedIn = !!token;

  const initialRouteName: keyof RootStackParamList = isLoggedIn
    ? "ChooseLanguage"
    : "Welcome";

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="ChooseLanguage" component={ChooseLanguageScreen} />
      <Stack.Screen name="ChooseRole" component={ChooseRoleScreen} />
      <Stack.Screen name="AddOrJoin" component={AddOrJoinScreen} />
      <Stack.Screen name="ChildName" component={ChildNameScreen} />
      <Stack.Screen name="ChildGender" component={ChildGenderScreen} />
      <Stack.Screen
        name="ConnectChild"
        component={ConnectChildScreen}
        options={{ headerBackVisible: false, gestureEnabled: false }}
      />
      <Stack.Screen name="ShowPairingCode" component={ShowPairingCodeScreen} />
      <Stack.Screen name="PairingSuccess" component={PairingSuccessScreen} />

      <Stack.Screen name="JoinFamily" component={JoinFamilyScreen} />
      <Stack.Screen name="JoinFamilyHelp" component={JoinFamilyHelpScreen} />
      <Stack.Screen
        name="JoinFamilySuccess"
        component={JoinFamilySuccessScreen}
      />

      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
