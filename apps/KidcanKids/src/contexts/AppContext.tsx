// src/contexts/AppContext.tsx
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  AppState,
  FocusSession,
  Mission,
  PetState,
  UserProfile,
} from '../types';

import {api} from '../api/client';
import {blockForMinutes, cancelBlock} from '../native/kidcan';
import type {BlockState} from '../types/block';

const STORAGE_KEY = 'pet_app_state';

// NEW: atskiri raktai vaikui ir onboardingui
const CHILD_ID_KEY = 'kidcan_child_id';
const CHILD_NAME_KEY = 'kidcan_child_name';
const ONBOARDING_KEY = 'kidcan_onboarding_done';

const defaultMissions: Mission[] = [
  {
    id: '1',
    title: 'Morning Focus',
    description: 'Complete a 30-minute focus session before noon',
    points: 50,
    status: 'active',
    type: 'daily',
    targetMinutes: 30,
  },
  {
    id: '2',
    title: 'Social Media Detox',
    description: 'Avoid social media for 2 hours',
    points: 30,
    status: 'active',
    type: 'daily',
    targetMinutes: 120,
  },
  {
    id: '3',
    title: 'Evening Wind Down',
    description: 'No phone after 10 PM',
    points: 40,
    status: 'active',
    type: 'daily',
  },
  {
    id: '4',
    title: 'Weekly Champion',
    description: 'Complete 5 focus sessions this week',
    points: 200,
    status: 'active',
    type: 'weekly',
  },
];

const defaultProfile: UserProfile = {
  hasCompletedOnboarding: false,
  averageScreenTimeHours: 0,
  strugglingHabits: [],
  mainGoal: '',
  strugglingTimes: [],
  motivationLevel: 3,
  startDate: Date.now(),
};

const defaultState: AppState = {
  profile: defaultProfile,
  points: 0,
  petState: 'neutral',
  missions: defaultMissions,
  focusSessions: [],
  dailyStats: [],
  currentStreak: 0,
  childId: null,
  childName: null,
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [state, setState] = useState<AppState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  // ar šiuo metu lokaliai užblokuota
  const isLocallyBlockedRef = useRef(false);

  const saveState = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }, [state]);

  useEffect(() => {
    const loadState = async () => {
      try {
        const [stored, childIdStr, childName, onboardingStr] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_KEY),
            AsyncStorage.getItem(CHILD_ID_KEY),
            AsyncStorage.getItem(CHILD_NAME_KEY),
            AsyncStorage.getItem(ONBOARDING_KEY),
          ]);

        let parsed: AppState | null = null;

        if (stored) {
          try {
            parsed = JSON.parse(stored) as AppState;
          } catch (e) {
            console.log('Failed to parse stored AppState, using defaults', e);
          }
        }

        const base = parsed
          ? {
              ...parsed,
              missions:
                parsed.missions.length > 0 ? parsed.missions : defaultMissions,
            }
          : defaultState;

        setState({
          ...base,
          childId: childIdStr ? Number(childIdStr) : base.childId,
          childName: childName ?? base.childName,
          profile: {
            ...base.profile,
            hasCompletedOnboarding:
              onboardingStr === 'true' || base.profile.hasCompletedOnboarding,
          },
        });
      } catch (error) {
        console.error('Failed to load state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveState();
    }
  }, [state, isLoading, saveState]);

  // ---------- CHILD ID SETTER (po pairing'o) ----------
  const setChildId = useCallback((id: number | null) => {
    setState(prev => ({
      ...prev,
      childId: id,
    }));
    if (id === null) {
      AsyncStorage.removeItem(CHILD_ID_KEY).catch(() => {});
    } else {
      AsyncStorage.setItem(CHILD_ID_KEY, String(id)).catch(() => {});
    }
  }, []);

  const setChildPairing = useCallback((id: number, name: string) => {
    setState(prev => ({
      ...prev,
      childId: id,
      childName: name,
    }));

    // svarbu: saugom atskirai, kad net jei sugriūtų STORAGE_KEY – vaikas išliktų
    AsyncStorage.setItem(CHILD_ID_KEY, String(id)).catch(() => {});
    AsyncStorage.setItem(CHILD_NAME_KEY, name).catch(() => {});
  }, []);

  // ---------- BLOKAVIMO SYNC’AS SU BACKEND’U (gali palikti arba vėliau išmesti) ----------
  useEffect(() => {
    if (!state.childId) {
      // jei nėra susietas vaikas – nieko nedarom
      return;
    }

    let intervalId: any;

    const syncBlockState = async () => {
      try {
        const res = await api.get<BlockState>(
          `children/children/${state.childId}/block-state`,
        );
        const data = res.data;

        if (!data.is_blocked) {
          if (isLocallyBlockedRef.current) {
            await cancelBlock();
            isLocallyBlockedRef.current = false;
          }
          return;
        }

        if (data.block_until) {
          const now = new Date();
          const until = new Date(data.block_until);
          const diffMs = until.getTime() - now.getTime();

          if (diffMs <= 0) {
            if (isLocallyBlockedRef.current) {
              await cancelBlock();
              isLocallyBlockedRef.current = false;
            }
            return;
          }

          const minutes = Math.ceil(diffMs / 60000);

          await blockForMinutes(
            minutes,
            data.message ?? 'Screen time blocked by parent',
          );
          isLocallyBlockedRef.current = true;
        }
      } catch (e: any) {
        console.log('syncBlockState error', e.response?.data || e.message);
      }
    };

    syncBlockState();
    intervalId = setInterval(syncBlockState, 15000);

    return () => clearInterval(intervalId);
  }, [state.childId]);

  // ---------- ONBOARDING ----------
  const completeOnboarding = useCallback(
    (profile: Omit<UserProfile, 'hasCompletedOnboarding' | 'startDate'>) => {
      setState(prev => ({
        ...prev,
        profile: {
          ...profile,
          hasCompletedOnboarding: true,
          startDate: Date.now(),
        },
      }));
      AsyncStorage.setItem(ONBOARDING_KEY, 'true').catch(() => {});
    },
    [],
  );

  // ---------- KITI SENI DALYKAI (palieku, kad ekranai nesulūžtų) ----------
  const addPoints = useCallback((points: number) => {
    setState(prev => ({
      ...prev,
      points: prev.points + points,
    }));
  }, []);

  const spendPoints = useCallback((points: number) => {
    setState(prev => ({
      ...prev,
      points: Math.max(0, prev.points - points),
    }));
  }, []);

  const completeMission = useCallback((missionId: string) => {
    setState(prev => {
      const mission = prev.missions.find(m => m.id === missionId);
      if (!mission || mission.status === 'completed') {
        return prev;
      }

      const updatedMissions = prev.missions.map(m =>
        m.id === missionId
          ? {...m, status: 'completed' as const, completedAt: Date.now()}
          : m,
      );

      return {
        ...prev,
        missions: updatedMissions,
        points: prev.points + mission.points,
      };
    });
  }, []);

  const startFocusSession = useCallback(
    (durationMinutes: number, blockedApps: string[]) => {
      const session: FocusSession = {
        id: Date.now().toString(),
        startTime: Date.now(),
        durationMinutes,
        blockedApps,
        completed: false,
        pointsEarned: 0,
      };

      setState(prev => ({
        ...prev,
        focusSessions: [...prev.focusSessions, session],
      }));

      return session.id;
    },
    [],
  );

  const completeFocusSession = useCallback((sessionId: string) => {
    setState(prev => {
      const session = prev.focusSessions.find(s => s.id === sessionId);
      if (!session || session.completed) {
        return prev;
      }

      const pointsEarned = Math.floor(session.durationMinutes / 5) * 10;

      const updatedSessions = prev.focusSessions.map(s =>
        s.id === sessionId
          ? {...s, completed: true, endTime: Date.now(), pointsEarned}
          : s,
      );

      const today = new Date().toDateString();
      const todayStats = prev.dailyStats.find(s => s.date === today);

      const updatedStats = todayStats
        ? prev.dailyStats.map(s =>
            s.date === today
              ? {
                  ...s,
                  focusMinutes: s.focusMinutes + session.durationMinutes,
                  pointsEarned: s.pointsEarned + pointsEarned,
                }
              : s,
          )
        : [
            ...prev.dailyStats,
            {
              date: today,
              screenTimeMinutes: 0,
              focusMinutes: session.durationMinutes,
              unlockCount: 0,
              pointsEarned,
            },
          ];

      return {
        ...prev,
        focusSessions: updatedSessions,
        points: prev.points + pointsEarned,
        dailyStats: updatedStats,
      };
    });
  }, []);

  const updatePetState = useCallback((newState: PetState) => {
    setState(prev => ({
      ...prev,
      petState: newState,
    }));
  }, []);

  const calculatePetState = useCallback((): PetState => {
    const today = new Date().toDateString();
    const todayStats = state.dailyStats.find(s => s.date === today);
    const todayFocusMinutes = todayStats?.focusMinutes || 0;
    const completedTodayMissions = state.missions.filter(
      m =>
        m.status === 'completed' &&
        m.completedAt &&
        new Date(m.completedAt).toDateString() === today,
    ).length;

    if (todayFocusMinutes >= 60 || completedTodayMissions >= 2) {
      return 'happy';
    } else if (todayFocusMinutes >= 30 || completedTodayMissions >= 1) {
      return 'neutral';
    } else {
      return 'sad';
    }
  }, [state.dailyStats, state.missions]);

  const resetDailyMissions = useCallback(() => {
    setState(prev => ({
      ...prev,
      missions: prev.missions.map(m =>
        m.type === 'daily'
          ? {...m, status: 'active' as const, completedAt: undefined}
          : m,
      ),
    }));
  }, []);

  return {
    state,
    isLoading,
    completeOnboarding,
    addPoints,
    spendPoints,
    completeMission,
    startFocusSession,
    completeFocusSession,
    updatePetState,
    calculatePetState,
    resetDailyMissions,
    setChildId,
    setChildPairing,
  };
});
