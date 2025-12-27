// src/navigation/DashboardTabsNavigator.tsx
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Platform, UIManager } from "react-native";

import DashboardTabBar from "../components/dashboard/DashboardTabBar";
import ActivityScreen from "../screens/activity/ActivityScreen";
import ParentDashboardScreen from "../screens/home/ParentDashboardScreen";
import LocationsScreen from "../screens/location/LocationsScreen";
import { SettingsNavigator } from "./SettingsNavigator";
import type { DashboardTabParamList } from "./types";
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const Tab = createBottomTabNavigator<DashboardTabParamList>();

export function DashboardTabsNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <DashboardTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="DashboardHome"
        component={ParentDashboardScreen as React.ComponentType<any>}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="Locations"
        component={LocationsScreen as React.ComponentType<any>}
        options={{ title: "Location" }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen as React.ComponentType<any>}
        options={{ title: "Activity" }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator as React.ComponentType<any>}
        options={{ title: "My Profile" }}
      />
    </Tab.Navigator>
  );
}
