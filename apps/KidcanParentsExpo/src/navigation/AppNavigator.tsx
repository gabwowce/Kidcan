// src/navigation/AppNavigator.tsx
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import React, { useRef } from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { useAppBootstrap } from './useAppBootstrap';

export function AppNavigator() {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef<string | undefined>(undefined);

  const { isBootstrapping, rootFlow } = useAppBootstrap();

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          const currentRouteName = navigationRef.getCurrentRoute()?.name;
          routeNameRef.current = currentRouteName;
          if (currentRouteName) {
            console.log('Current route:', currentRouteName);
          }
        }}
        onStateChange={() => {
          const currentRouteName = navigationRef.getCurrentRoute()?.name;
          if (currentRouteName && routeNameRef.current !== currentRouteName) {
            console.log('Current route:', currentRouteName);
            routeNameRef.current = currentRouteName;
          }
        }}
      >
        {rootFlow === 'AUTH' && <AuthNavigator />}
        {rootFlow === 'ONBOARDING' && <OnboardingNavigator />}
        {rootFlow === 'MAIN' && <MainNavigator />}
      </NavigationContainer>
    </>
  );
}
