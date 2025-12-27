import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

import { fetchChildrenForCurrentParent } from "../api/children";
import { getParentStubStatus } from "../api/pairing";
import { useOnboardingFlag } from "../context/OnboardingFlagContext";
import { useAppSelector } from "../store/hooks";

const PARENT_KEY = "kidcan_parent_id";

export type RootFlow = "AUTH" | "ONBOARDING" | "MAIN";

type UseAppBootstrapResult = {
  isBootstrapping: boolean;
  rootFlow: RootFlow;
};

export function useAppBootstrap(): UseAppBootstrapResult {
  const token = useAppSelector((s) => s.auth.token);
  const authLoading = useAppSelector((s) => s.auth.isLoading);
  const isLoggedIn = !!token;

  const { hasCompletedOnboarding, isChecking, completeOnboarding } =
    useOnboardingFlag();

  const [needsFinishAccount, setNeedsFinishAccount] = useState<boolean | null>(
    null
  );

  const [hasAnyChildren, setHasAnyChildren] = useState<boolean | null>(null);
  const [isSyncingOnboarding, setIsSyncingOnboarding] = useState(false);

  // jei prisijungęs ir serveryje YRA vaikų,
  // bet lokaliai flagas dar false → pažymim, kad onboarding baigtas
  useEffect(() => {
    if (isLoggedIn && hasAnyChildren && !hasCompletedOnboarding) {
      console.log(
        "BOOTSTRAP: marking onboarding completed (hasAnyChildren = true)"
      );
      completeOnboarding().catch((e) =>
        console.log("BOOTSTRAP: completeOnboarding error", e)
      );
    }
  }, [isLoggedIn, hasAnyChildren, hasCompletedOnboarding, completeOnboarding]);

  // DEBUG: baziniai flagai
  useEffect(() => {
    console.log("BOOTSTRAP flags =>", {
      token,
      isLoggedIn,
      authLoading,
      isChecking,
      hasCompletedOnboarding,
    });
  }, [token, isLoggedIn, authLoading, isChecking, hasCompletedOnboarding]);

  // 1) tikrinam stub parent, kai user NEprisijungęs
  useEffect(() => {
    if (isLoggedIn) {
      setNeedsFinishAccount(false);
      return;
    }
    if (authLoading || isChecking) return;

    let cancelled = false;

    const checkStub = async () => {
      try {
        const parentIdStr = await AsyncStorage.getItem(PARENT_KEY);
        console.log("BOOTSTRAP: loaded stub parentId =>", parentIdStr);

        if (!parentIdStr) {
          if (!cancelled) setNeedsFinishAccount(false);
          return;
        }

        const status = await getParentStubStatus(Number(parentIdStr));
        console.log("BOOTSTRAP: getParentStubStatus =>", status);

        if (!cancelled) {
          const needsFinish = !!status?.hasActiveChild;
          setNeedsFinishAccount(needsFinish);
        }
      } catch (e) {
        console.log("BOOTSTRAP: getParentStubStatus error", e);
        if (!cancelled) setNeedsFinishAccount(false);
      }
    };

    checkStub();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, authLoading, isChecking]);

  // 2) jei prisijungėm → pasižiūrim, ar tėvas turi vaikų serveryje
  useEffect(() => {
    if (!isLoggedIn) {
      setHasAnyChildren(null);
      return;
    }

    let cancelled = false;

    const syncFromServer = async () => {
      try {
        setIsSyncingOnboarding(true);
        console.log("BOOTSTRAP: syncing children from server...");

        const children = await fetchChildrenForCurrentParent();

        if (!cancelled) {
          console.log("BOOTSTRAP: children count =", children.length);
          setHasAnyChildren(children.length > 0);
        }
      } catch (e) {
        console.log("BOOTSTRAP: sync onboarding from server error", e);
        if (!cancelled) setHasAnyChildren(false);
      } finally {
        if (!cancelled) setIsSyncingOnboarding(false);
      }
    };

    syncFromServer();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  const isBootstrapping =
    authLoading ||
    isChecking ||
    (!isLoggedIn && needsFinishAccount === null) ||
    (isLoggedIn && (hasAnyChildren === null || isSyncingOnboarding));

  let rootFlow: RootFlow;

  if (!isLoggedIn) {
    if (needsFinishAccount || hasCompletedOnboarding) {
      rootFlow = "AUTH";
    } else {
      rootFlow = "ONBOARDING";
    }
  } else {
    if (hasAnyChildren === false && !hasCompletedOnboarding) {
      rootFlow = "ONBOARDING";
    } else {
      rootFlow = "MAIN";
    }
  }

  useEffect(() => {
    console.log("BOOTSTRAP state snapshot =>", {
      isLoggedIn,
      authLoading,
      isChecking,
      needsFinishAccount,
      hasAnyChildren,
      isSyncingOnboarding,
      isBootstrapping,
      rootFlow,
    });
  }, [
    isLoggedIn,
    authLoading,
    isChecking,
    needsFinishAccount,
    hasAnyChildren,
    isSyncingOnboarding,
    isBootstrapping,
    rootFlow,
  ]);

  return { isBootstrapping, rootFlow };
}
