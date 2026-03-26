import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AppState, Screen, UserRole, Difficulty, Goal, WorkoutSession, ScheduledWorkout, SignUpParams } from '../types';
import { supabase, supabaseConfigured, SUPABASE_STORAGE_KEY } from '../lib/supabase';
import type { UserProfile } from '../lib/supabase';

// ── helpers ──────────────────────────────────────────────────────────────────
function dateStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials'))   return 'כתובת אימייל או סיסמה שגויים';
  if (msg.includes('Email not confirmed'))         return 'יש לאשר את כתובת האימייל לפני ההתחברות';
  if (msg.includes('User already registered'))     return 'כתובת אימייל זו כבר רשומה במערכת';
  if (msg.includes('already been registered'))     return 'כתובת אימייל זו כבר רשומה במערכת';
  if (msg.includes('Password should be at least')) return 'הסיסמה חייבת להכיל לפחות 6 תווים';
  if (msg.includes('rate limit'))                  return 'יותר מדי ניסיונות — נסי שוב בעוד כמה דקות';
  if (msg.includes('Network'))                     return 'בעיית חיבור לרשת — בדקי את האינטרנט';
  return msg;
}

// ── default state ─────────────────────────────────────────────────────────────
const defaultState: AppState = {
  // Auth
  user:            null,
  profile:         null,
  isAuthenticated: false,
  isLoading:       true,   // true until session check resolves
  pendingRole:     null,

  // App
  role: null,
  screen: 'auth-role-select',
  grandmaProfile: {
    name: 'סבתא',
    grandchildName: '',
    difficulties: [],
    goals: ['conversation', 'mood'],
    fitnessLevel: 'easy',
    greetingMessage: '',
  },
  workoutHistory: [],
  pendingMessage: '',
  currentWorkoutIndex: 0,
  selectedWorkoutId: 'W01',
  weeklySchedule: [],
};

// ── context type ──────────────────────────────────────────────────────────────
interface AppContextType {
  state: AppState;
  // Navigation
  navigate:        (screen: Screen) => void;
  // Auth
  setPendingRole:  (role: UserRole) => void;
  signUp:          (params: SignUpParams) => Promise<{ error: string | null }>;
  signIn:          (email: string, password: string) => Promise<{ error: string | null }>;
  signOut:         () => Promise<void>;
  setProfile:      (profile: UserProfile | null) => void;
  // Profile & role
  setRole:         (role: UserRole) => void;
  updateProfile:   (updates: Partial<AppState['grandmaProfile']>) => void;
  // Workout
  toggleDifficulty:     (d: Difficulty) => void;
  toggleGoal:           (g: Goal) => void;
  addWorkout:           (session: WorkoutSession) => void;
  setPendingMessage:    (msg: string) => void;
  setCurrentWorkoutIndex: (i: number) => void;
  setSelectedWorkout:   (id: string) => void;
  scheduleWorkout:      (date: string, workoutId: string) => void;
  clearScheduledWorkout:(date: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

// ── provider ──────────────────────────────────────────────────────────────────
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(defaultState);

  // ── helpers ───────────────────────────────────────────────────────────────
  const set = (updates: Partial<AppState>) =>
    setState(s => ({ ...s, ...updates }));


  // ── Auth init — runs once on mount ────────────────────────────────────────
  useEffect(() => {
    // If Supabase isn't configured, release loading immediately
    if (!supabaseConfigured) {
      console.error('[Auth] Supabase not configured — check .env.local');
      setState(s => ({ ...s, isLoading: false }));
      return;
    }

    // Safety net: if getSession hangs (stale token-refresh holds the GoTrue lock),
    // clear the stored token so the lock eventually unblocks and show auth screen.
    const fallback = setTimeout(() => {
      console.warn('[Auth] init timed out — clearing stale auth token');
      try { localStorage.removeItem(SUPABASE_STORAGE_KEY); } catch {}
      setState(s => s.isLoading ? { ...s, isLoading: false } : s);
    }, 5000);

    // ── Step 1: check existing session (handles refresh) ──────────────────
    supabase.auth.getSession()
      .then(async ({ data: { session }, error }) => {
        clearTimeout(fallback);

        if (error) {
          console.warn('[Auth] getSession error:', error.message);
          setState(s => ({ ...s, isLoading: false }));
          return;
        }

        if (session?.user) {
          console.log('[Auth] restored session for', session.user.id);
          const profile = await fetchProfile(session.user.id);
          const role = (profile?.role ?? null) as UserRole;
          const screen = role === 'grandma'
            ? 'grandma-home'
            : role === 'grandchild'
            ? 'grandchild-home'
            : 'auth-role-select';   // unknown role → re-pick
          setState(s => ({
            ...s,
            user:            session.user,
            profile,
            isAuthenticated: true,
            isLoading:       false,
            role,
            screen,
          }));
        } else {
          console.log('[Auth] no session — showing auth screen');
          setState(s => ({ ...s, isLoading: false }));
        }
      })
      .catch(err => {
        console.error('[Auth] getSession threw:', err);
        clearTimeout(fallback);
        setState(s => ({ ...s, isLoading: false }));
      });

    // ── Step 2: listen for future auth events ─────────────────────────────
    // SIGNED_IN is intentionally ignored here — signIn() and _doSignUp() update
    // state directly after their own await, so we never need onAuthStateChange
    // to drive navigation. Handling it here too causes race conditions and
    // GoTrue lock conflicts when a second auth op starts before the handler finishes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[Auth]', event);

        if (event === 'TOKEN_REFRESHED' && session?.user) {
          setState(s => ({ ...s, user: session.user }));
          return;
        }

        if (event === 'SIGNED_OUT') {
          setState(s => ({
            ...s,
            user:            null,
            profile:         null,
            isAuthenticated: false,
            role:            null,
            screen:          'auth-role-select',
            isLoading:       false,
          }));
          return;
        }
      }
    );

    return () => {
      clearTimeout(fallback);
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch profile from Supabase ───────────────────────────────────────────
  // DB stores 'grandmother' — normalize to 'grandma' so all app comparisons work.
  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        console.warn('[Auth] fetchProfile error:', error.message);
        return null;
      }
      if (!data) return null;
      if (data.role === 'grandmother') data.role = 'grandma';
      return data;
    } catch (e) {
      console.error('[Auth] fetchProfile unexpected error:', e);
      return null;
    }
  }

  // ── Auth actions ──────────────────────────────────────────────────────────

  // Creates a profile row for the given user ID.
  // DB constraint: role IN ('grandmother', 'grandchild') — map 'grandma' → 'grandmother'.
  async function createProfile(userId: string, userEmail: string, fullName: string, role: 'grandma' | 'grandchild', phone?: string, nickname?: string, gender?: 'male' | 'female') {
    const dbRole = role === 'grandma' ? 'grandmother' : 'grandchild';
    const { error } = await supabase.from('profiles').insert({
      id:        userId,
      full_name: fullName,
      role:      dbRole,
      phone:     phone?.trim() || null,
      email:     userEmail.trim().toLowerCase(),
      nickname:  nickname?.trim() || null,
      gender:    gender || null,
    });
    return error;
  }

  // Helper: resolve role → screen name
  function roleScreen(r: UserRole): Screen {
    return r === 'grandma' ? 'grandma-home' : r === 'grandchild' ? 'grandchild-home' : 'auth-role-select';
  }

  async function signUp({ email, password, fullName, phone, role, nickname, gender }: SignUpParams): Promise<{ error: string | null }> {
    return _doSignUp({ email, password, fullName, phone, role, nickname, gender });
  }

  async function _doSignUp({ email, password, fullName, phone, role, nickname, gender }: SignUpParams): Promise<{ error: string | null }> {
    try {
      // ── Case A: already authenticated but has no profile ───────────────────
      // App.tsx shows <SignUp /> when isAuthenticated && !profile.
      // Use React state (not getUser) to avoid acquiring the GoTrue lock.
      console.log('[signUp] Case A check: isAuthenticated=', state.isAuthenticated, 'hasProfile=', !!state.profile, 'userId=', state.user?.id ?? 'none');
      if (state.isAuthenticated && state.user && !state.profile) {
        console.log('[signUp] Case A: creating profile for existing auth user');
        const profileErr = await createProfile(
          state.user.id,
          state.user.email ?? email,
          fullName, role, phone, nickname, gender,
        );
        if (profileErr) { console.error('[signUp] Case A createProfile error:', profileErr.message); return { error: translateError(profileErr.message) }; }
        const profile = await fetchProfile(state.user.id);
        const r = (profile?.role ?? null) as UserRole;
        set({ profile, role: r, isAuthenticated: true, screen: roleScreen(r) });
        console.log('[signUp] Case A done, navigating to', roleScreen(r));
        return { error: null };
      }

      // ── Case A2: logged in as a different user → sign out first ────────────
      if (state.isAuthenticated && state.user) {
        console.log('[signUp] Case A2: signing out existing session before new signup');
        await supabase.auth.signOut();
      }

      // ── Case B: brand-new user ──────────────────────────────────────────────
      console.log('[signUp] step 2: auth.signUp');
      const { data, error } = await supabase.auth.signUp({ email, password });
      console.log('[signUp] step 2 done, error:', error?.message ?? 'none', 'user:', data?.user?.id ?? 'none', 'session:', data?.session ? 'yes' : 'null');

      if (error) {
        // Auth user exists but profile may be gone → sign in + create profile
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          console.log('[signUp] Case B-retry: signInWithPassword');
          const { data: siData, error: siErr } = await supabase.auth.signInWithPassword({ email, password });
          console.log('[signUp] signIn done, error:', siErr?.message ?? 'none');
          if (siErr) return { error: translateError(siErr.message) };
          if (!siData.user) return { error: 'שגיאה בכניסה — נסי שוב' };

          console.log('[signUp] checking existing profile');
          const { data: existing } = await supabase
            .from('profiles').select('id').eq('id', siData.user.id).maybeSingle();
          console.log('[signUp] existing profile:', existing ? 'found' : 'not found');
          if (!existing) {
            const profileErr = await createProfile(siData.user.id, email, fullName, role, phone, nickname, gender);
            if (profileErr) { console.error('[signUp] createProfile error:', profileErr.message); return { error: translateError(profileErr.message) }; }
          }
          const profile = await fetchProfile(siData.user.id);
          const r = (profile?.role ?? null) as UserRole;
          set({ user: siData.user, profile, role: r, isAuthenticated: true, isLoading: false, screen: roleScreen(r) });
          console.log('[signUp] Case B-retry done');
          return { error: null };
        }
        return { error: translateError(error.message) };
      }

      if (!data.user) return { error: 'שגיאה ביצירת חשבון — נסי שוב' };

      // If email confirmation is required, session will be null — sign in explicitly
      if (!data.session) {
        console.log('[signUp] no session after signUp (email confirmation may be required) — trying signIn');
        const { data: siData, error: siErr } = await supabase.auth.signInWithPassword({ email, password });
        console.log('[signUp] post-signup signIn done, error:', siErr?.message ?? 'none');
        if (siErr) {
          // Email confirmation required — can't auto-login, create profile using admin path won't work
          // Return a friendly message
          return { error: 'נשלח אימייל אישור לכתובתך — אשרי ואז התחברי' };
        }
        if (siData.user) {
          console.log('[signUp] step 3: createProfile after signIn');
          const profileErr = await createProfile(siData.user.id, email, fullName, role, phone, nickname, gender);
          if (profileErr && !profileErr.message.includes('duplicate')) {
            console.error('[signUp] createProfile error:', profileErr.message);
            return { error: translateError(profileErr.message) };
          }
          const profile = await fetchProfile(siData.user.id);
          const r = (profile?.role ?? role) as UserRole;
          set({ user: siData.user, profile, role: r, isAuthenticated: true, isLoading: false, screen: roleScreen(r) });
          console.log('[signUp] done (email-confirm path)');
          return { error: null };
        }
      }

      console.log('[signUp] step 3: createProfile');
      const profileErr = await createProfile(data.user.id, email, fullName, role, phone, nickname, gender);
      console.log('[signUp] step 3 done, profileErr:', profileErr?.message ?? 'none');
      if (profileErr) return { error: translateError(profileErr.message) };

      console.log('[signUp] step 4: fetchProfile');
      const profile = await fetchProfile(data.user.id);
      console.log('[signUp] step 4 done, profile:', profile ? 'found' : 'null');
      const r = (profile?.role ?? role) as UserRole;
      set({ user: data.user, profile, role: r, isAuthenticated: true, isLoading: false, screen: roleScreen(r) });
      console.log('[signUp] done, navigating to', roleScreen(r));
      return { error: null };

    } catch (err: unknown) {
      console.error('[signUp] unexpected error:', err);
      const msg = err instanceof Error ? err.message : 'שגיאה לא צפויה';
      return { error: msg.includes('Network') ? 'בעיית חיבור לרשת' : 'שגיאה ביצירת חשבון — נסי שוב' };
    }
  }

  async function signIn(email: string, password: string): Promise<{ error: string | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: translateError(error.message) };
    if (!data.user) return { error: 'שגיאה בכניסה — נסי שוב' };
    const profile = await fetchProfile(data.user.id);
    const role = (profile?.role ?? null) as UserRole;
    set({ user: data.user, profile, isAuthenticated: true, isLoading: false, role, screen: roleScreen(role) });
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const setProfile = (profile: UserProfile | null) => set({ profile });

  // ── Navigation ────────────────────────────────────────────────────────────
  const navigate = (screen: Screen) => set({ screen });

  // ── App actions ───────────────────────────────────────────────────────────
  const setRole         = (role: UserRole) => set({ role });
  const setPendingRole  = (pendingRole: UserRole) => set({ pendingRole });
  const setPendingMessage    = (pendingMessage: string) => set({ pendingMessage });
  const setCurrentWorkoutIndex = (currentWorkoutIndex: number) => set({ currentWorkoutIndex });
  const setSelectedWorkout   = (selectedWorkoutId: string) => set({ selectedWorkoutId });

  const updateProfile = (updates: Partial<AppState['grandmaProfile']>) =>
    setState(s => ({ ...s, grandmaProfile: { ...s.grandmaProfile, ...updates } }));

  const toggleDifficulty = (d: Difficulty) =>
    setState(s => ({
      ...s,
      grandmaProfile: {
        ...s.grandmaProfile,
        difficulties: s.grandmaProfile.difficulties.includes(d)
          ? s.grandmaProfile.difficulties.filter(x => x !== d)
          : [...s.grandmaProfile.difficulties, d],
      },
    }));

  const toggleGoal = (g: Goal) =>
    setState(s => ({
      ...s,
      grandmaProfile: {
        ...s.grandmaProfile,
        goals: s.grandmaProfile.goals.includes(g)
          ? s.grandmaProfile.goals.filter(x => x !== g)
          : [...s.grandmaProfile.goals, g],
      },
    }));

  const addWorkout = (session: WorkoutSession) =>
    setState(s => ({ ...s, workoutHistory: [session, ...s.workoutHistory] }));

  const scheduleWorkout = (date: string, workoutId: string) =>
    setState(s => ({
      ...s,
      weeklySchedule: [
        ...s.weeklySchedule.filter(w => w.date !== date),
        { date, workoutId },
      ],
    }));

  const clearScheduledWorkout = (date: string) =>
    setState(s => ({
      ...s,
      weeklySchedule: s.weeklySchedule.filter(w => w.date !== date),
    }));

  return (
    <AppContext.Provider value={{
      state,
      navigate, setPendingRole, signUp, signIn, signOut, setProfile,
      setRole, updateProfile,
      toggleDifficulty, toggleGoal, addWorkout,
      setPendingMessage, setCurrentWorkoutIndex, setSelectedWorkout,
      scheduleWorkout, clearScheduledWorkout,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
