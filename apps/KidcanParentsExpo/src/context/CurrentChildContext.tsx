import React, { createContext, useContext, useState } from "react";

type CurrentChildContextValue = {
  currentChildId: number | null;
  setCurrentChildId: (id: number | null) => void;
};

const CurrentChildContext = createContext<CurrentChildContextValue | undefined>(
  undefined
);

export const CurrentChildProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentChildId, setCurrentChildId] = useState<number | null>(null);

  return (
    <CurrentChildContext.Provider value={{ currentChildId, setCurrentChildId }}>
      {children}
    </CurrentChildContext.Provider>
  );
};

export const useCurrentChild = () => {
  const ctx = useContext(CurrentChildContext);
  if (!ctx) {
    throw new Error("useCurrentChild must be used within CurrentChildProvider");
  }
  return ctx;
};
