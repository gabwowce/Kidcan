// src/context/OnboardingContext.tsx
import React, { createContext, useContext, useState } from 'react';
import type { ParentRole } from '../navigation/types';

type OnboardingContextValue = {
  parentRole: ParentRole | null;
  setParentRole: (role: ParentRole | null) => void;
};

const OnboardingContext = createContext<OnboardingContextValue>({
  parentRole: null,
  setParentRole: () => {},
});

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [parentRole, setParentRole] = useState<ParentRole | null>(null);

  return (
    <OnboardingContext.Provider value={{ parentRole, setParentRole }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
