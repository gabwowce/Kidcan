import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChildDetailScreen from "../screens/ChildDetailScreen";
import { DashboardTabsNavigator } from "./DashboardTabsNavigator";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* vietoj ParentDashboardScreen dabar naudojam tab navigatorių */}
      <Stack.Screen name="Dashboard" component={DashboardTabsNavigator} />
      <Stack.Screen name="ChildDetails" component={ChildDetailScreen} />
    </Stack.Navigator>
  );
}
