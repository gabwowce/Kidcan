import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {BarChart2, Home, ListChecks, Target, User} from 'lucide-react-native';
import React from 'react';
import {colors} from '../constants/colors';
import FocusScreen from '../screens/tabs/FocusScreen';
import HomeScreen from '../screens/tabs/HomeScreen';
import MissionsScreen from '../screens/tabs/MissionsScreen';
import ProfileScreen from '../screens/tabs/ProfileScreen';
import StatsScreen from '../screens/tabs/StatsScreen';

export type TabsParamList = {
  Home: undefined;
  Focus: undefined;
  Missions: undefined;
  Stats: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabsParamList>();

const MainTabsNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          elevation: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({color, size}) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Focus"
        component={FocusScreen}
        options={{
          title: 'Focus',
          tabBarIcon: ({color, size}) => <Target color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Missions"
        component={MissionsScreen}
        options={{
          title: 'Missions',
          tabBarIcon: ({color, size}) => (
            <ListChecks color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          title: 'Stats',
          tabBarIcon: ({color, size}) => (
            <BarChart2 color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({color, size}) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabsNavigator;
