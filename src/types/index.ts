import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../lib/supabase';

export type { User, UserProfile };

export type UserRole = 'grandma' | 'grandchild' | null;

export type Screen =
  | 'auth-role-select'
  | 'auth-sign-up'
  | 'auth-sign-in'
  | 'onboarding'
  | 'grandchild-home'
  | 'grandchild-create-profile'
  | 'grandchild-select-difficulties'
  | 'grandchild-select-goals'
  | 'grandchild-send-message'
  | 'grandchild-dashboard'
  | 'grandchild-weekly-plan'
  | 'grandma-home'
  | 'grandma-messages'
  | 'grandma-active-workout'
  | 'grandma-workout-summary'
  | 'grandma-conversation'
  | 'grandma-progress'
  | 'auth-reset-password';

export type Difficulty =
  | 'vision'
  | 'hearing'
  | 'blood_pressure'
  | 'diabetes'
  | 'joint_pain'
  | 'balance'
  | 'cognitive'
  | 'tech'
  | 'language'
  | 'chronic'
  | 'fatigue'
  | 'loneliness'
  | 'fear_failure';

export type Goal =
  | 'strength'
  | 'mood'
  | 'conversation'
  | 'consistency'
  | 'quality_time';

export interface GrandmaProfile {
  name: string;
  grandchildName: string;
  difficulties: Difficulty[];
  goals: Goal[];
  fitnessLevel: 'easy' | 'medium';
  greetingMessage?: string;
}

export interface WorkoutSession {
  date: string;
  duration: number;
  exerciseCount: number;
  type: string;
}

export interface ScheduledWorkout {
  date: string;
  workoutId: string;
}

export interface SignUpParams {
  email:    string;
  password: string;
  fullName: string;
  phone?:   string;
  role:     'grandma' | 'grandchild';
  nickname?: string;
  gender?:   'male' | 'female';
}

export interface AppState {
  // ── Auth ──────────────────────────────────────────────────────────────────
  user:            User | null;
  profile:         UserProfile | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  pendingRole:     UserRole;     // role selected on RoleSelect, carried into SignUp

  // ── App ───────────────────────────────────────────────────────────────────
  role:                UserRole;
  screen:              Screen;
  grandmaProfile:      GrandmaProfile;
  workoutHistory:      WorkoutSession[];
  pendingMessage:      string;
  currentWorkoutIndex: number;
  selectedWorkoutId:   string;
  weeklySchedule:      ScheduledWorkout[];
}
