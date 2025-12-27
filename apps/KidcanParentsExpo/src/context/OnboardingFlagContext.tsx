import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type OnboardingContextType = {
  hasCompletedOnboarding: boolean;
  isChecking: boolean;
  completeOnboarding: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined,
);

export const OnboardingFlagProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [hasCompletedOnboarding, setHasCompleted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem('hasCompletedOnboarding');
        setHasCompleted(value === 'true');
      } finally {
        setIsChecking(false);
      }
    })();
  }, []);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
    setHasCompleted(true);
  };

  return (
    <OnboardingContext.Provider
      value={{ hasCompletedOnboarding, isChecking, completeOnboarding }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboardingFlag = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboardingFlag must be used in provider');
  return ctx;
};
