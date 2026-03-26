import { useApp } from './context/AppContext';

// Auth screens
import RoleSelect from './screens/auth/RoleSelect';
import SignUp     from './screens/auth/SignUp';
import SignIn     from './screens/auth/SignIn';

// Grandma screens
import GrandmaHome        from './screens/grandma/GrandmaHome';
import GrandmaMessages    from './screens/grandma/GrandmaMessages';
import ActiveWorkout      from './screens/grandma/ActiveWorkout';
import WorkoutSummary     from './screens/grandma/WorkoutSummary';
import ConversationTopics from './screens/grandma/ConversationTopics';
import Progress           from './screens/grandma/Progress';

// Grandchild screens
import GrandchildHome      from './screens/grandchild/GrandchildHome';
import CreateProfile       from './screens/grandchild/CreateProfile';
import SelectDifficulties  from './screens/grandchild/SelectDifficulties';
import SendMessage         from './screens/grandchild/SendMessage';
import GrandchildDashboard from './screens/grandchild/GrandchildDashboard';
import WeeklyPlanner       from './screens/grandchild/WeeklyPlanner';

// ── Splash ────────────────────────────────────────────────────────────────────
function Splash() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(170deg, #FFFCF7 0%, #FAF0E6 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{ fontSize: 52 }}>🏃‍♀️</div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--mid)' }}>
        מתאמנים יחד...
      </p>
    </div>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────
function Router() {
  const { state } = useApp();
  const { isLoading, isAuthenticated, screen } = state;

  // 1. Resolving session
  if (isLoading) return <Splash />;

  // 2. Not logged in → auth flow
  if (!isAuthenticated) {
    switch (screen) {
      case 'auth-sign-up': return <SignUp />;
      case 'auth-sign-in': return <SignIn />;
      default:             return <RoleSelect />;
    }
  }

  // 3. Logged in but no profile (e.g. profiles row deleted, auth.users still exists)
  //    Show SignUp so the user can fill in name/role and we create the profile row.
  if (!state.profile) return <SignUp />;

  // 4. Logged in → app screens
  switch (screen) {
    case 'grandma-home':               return <GrandmaHome />;
    case 'grandma-messages':           return <GrandmaMessages />;
    case 'grandma-active-workout':     return <ActiveWorkout />;
    case 'grandma-workout-summary':    return <WorkoutSummary />;
    case 'grandma-conversation':       return <ConversationTopics />;
    case 'grandma-progress':           return <Progress />;
    case 'grandchild-home':            return <GrandchildHome />;
    case 'grandchild-create-profile':  return <CreateProfile />;
    case 'grandchild-select-difficulties': return <SelectDifficulties />;
    case 'grandchild-send-message':    return <SendMessage />;
    case 'grandchild-dashboard':       return <GrandchildDashboard />;
    case 'grandchild-weekly-plan':     return <WeeklyPlanner />;
    default:
      return state.role === 'grandma' ? <GrandmaHome /> : <GrandchildHome />;
  }
}

export default function App() {
  return (
    <div className="app-shell" dir="rtl" lang="he">
      <Router />
    </div>
  );
}
