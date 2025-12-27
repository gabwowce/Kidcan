export type PetState = 'happy' | 'neutral' | 'sad';

export type MissionStatus = 'active' | 'completed';

export interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  status: MissionStatus;
  type: 'daily' | 'weekly';
  targetMinutes?: number;
  completedAt?: number;
}

export interface FocusSession {
  id: string;
  startTime: number;
  endTime?: number;
  durationMinutes: number;
  blockedApps: string[];
  completed: boolean;
  pointsEarned: number;
}

export interface DailyStats {
  date: string;
  screenTimeMinutes: number;
  focusMinutes: number;
  unlockCount: number;
  pointsEarned: number;
}

export interface UserProfile {
  hasCompletedOnboarding: boolean;
  averageScreenTimeHours: number;
  strugglingHabits: string[];
  mainGoal: string;
  strugglingTimes: string[];
  motivationLevel: number;
  startDate: number;
}

export type AppState = {
  profile: UserProfile;
  points: number;
  petState: PetState;
  missions: Mission[];
  focusSessions: FocusSession[];
  dailyStats: any[]; // kaip pas tave buvo
  currentStreak: number;

  // 👇 nauja
  childId: number | null;
  childName: string | null;
};
