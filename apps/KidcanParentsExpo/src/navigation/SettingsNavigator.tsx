// src/navigation/SettingsNavigator.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import AddChildGenderScreen from "../screens/settings/add-child/AddChildGenderScreen";
import AddChildNameScreen from "../screens/settings/add-child/AddChildNameScreen";
import AddChildShowPairingCodeScreen from "../screens/settings/add-child/AddChildShowPairingCodeScreen";
import ChildrenListScreen from "../screens/settings/ChildrenListScreen";
import { InviteParentScreen } from "../screens/settings/InviteParentScreen";
import { InviteParentSuccessScreen } from "../screens/settings/InviteParentSuccessScreen";
import LanguageSettingsScreen from "../screens/settings/LanguageSettingsScreen";
import ProfileScreen from "../screens/settings/ProfileScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import { TrackingSettingsScreen } from "../screens/settings/TrackingSettingsScreen";
import type { SettingsStackParamList } from "./types";

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <Stack.Screen
        name="ChildrenList"
        component={ChildrenListScreen}
        options={{ title: "Children" }}
      />

      <Stack.Screen
        name="AddChildName"
        component={AddChildNameScreen}
        options={{ title: "Add child" }}
      />
      <Stack.Screen
        name="AddChildGender"
        component={AddChildGenderScreen}
        options={{ title: "Gender" }}
      />
      <Stack.Screen
        name="AddChildShowPairingCode"
        component={AddChildShowPairingCodeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LanguageSettings"
        component={LanguageSettingsScreen}
        options={{ title: "Language" }}
      />
      <Stack.Screen
        name="InviteParent"
        component={InviteParentScreen}
        options={{ title: "Invite parent" }}
      />
      <Stack.Screen
        name="TrackingSettings"
        component={TrackingSettingsScreen}
        options={{ title: "Sekimo nustatymai" }}
      />
      <Stack.Screen
        name="InviteParentSuccess"
        component={InviteParentSuccessScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
