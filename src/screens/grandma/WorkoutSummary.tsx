import { useApp } from '../../context/AppContext';
import { WORKOUTS, getStepsForWorkout } from '../../data/workoutsData';

const CONVERSATION_STARTERS: Record<string, string[]> = {
  'W01': ['איזה תרגיל הכי נהנית ממנו הבוקר?', 'איך הרגשת לאחר הנשימות העמוקות?'],
  'W02': ['כמה צעדים הלכת בסה״כ היום?', 'לאן הכי בא לך ללכת לטייל?'],
  'W03': ['האם הרגלות שלך מרגישות יותר חזקות?', 'איזה תרגיל היה הכי קשה?'],
  'W04': ['האם שיווי המשקל שלך מרגיש יותר טוב?', 'איפה הכי נוח לך להתאמן?'],
  'W05': ['מה הכי חיזקת היום – כתפיים או זרועות?', 'האם יש משהו שקל לך יותר לעשות בחיים יומיום?'],
  'W06': ['איך הרגשת אחרי האימון הערב?', 'האם ההירדמות הייתה קלה יותר?'],
};

export default function WorkoutSummary() {
  const { state, navigate } = useApp();
  const workout = WORKOUTS.find(w => w.id === state.selectedWorkoutId) ?? WORKOUTS[0];
  const steps = getStepsForWorkout(workout.id);
  const latest = state.workoutHistory[0];
  const { accent, bg, light, text } = workout.colors;
  const starters = CONVERSATION_STARTERS[workout.id] ?? [];
  const question = starters[Math.floor(Math.random() * starters.length)];

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, ${bg} 0%, #FFFCF7 60%, ${bg} 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '48px 24px 40px', direction: 'rtl', textAlign: 'center',
    }}>

      {/* Celebration */}
      <div style={{ fontSize: 88, marginBottom: 8, animation: 'celebrate 0.7s ease-out both' }}>
        🎉
      </div>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-3xl)',
        color: accent,
        marginBottom: 8,
      }}>
        כל הכבוד!
      </h1>
      <p style={{ fontSize: 'var(--text-xl)', color: 'var(--dark-mid)', marginBottom: 32, lineHeight: 1.5 }}>
        סיימת את <strong>{workout.title}</strong>
      </p>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, width: '100%' }}>
        {[
          { num: latest?.duration ?? workout.durationMinutes, label: 'דקות תנועה' },
          { num: steps.length, label: 'תרגילים' },
          { num: state.workoutHistory.length, label: 'אימונים השבוע' },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, background: 'rgba(255,255,255,0.8)',
            borderRadius: 20, padding: '18px 8px',
            border: `1.5px solid ${light}`,
            backdropFilter: 'blur(4px)',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 900, color: accent, display: 'block', lineHeight: 1 }}>
              {s.num}
            </span>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--mid)', display: 'block', marginTop: 4 }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Grandchild message */}
      {state.pendingMessage && (
        <div style={{
          width: '100%', background: `linear-gradient(135deg, #FFF5F0, #FAEDE4)`,
          border: '1.5px solid var(--terracotta-light)',
          borderRadius: 20, padding: '20px 22px', marginBottom: 20, textAlign: 'right',
        }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--terracotta)', fontWeight: 700, marginBottom: 8 }}>
            💌 הודעה מ{state.grandmaProfile.grandchildName}:
          </div>
          <div style={{ fontSize: 'var(--text-xl)', color: 'var(--dark)', lineHeight: 1.5 }}>
            {state.pendingMessage}
          </div>
        </div>
      )}

      {/* Conversation starter */}
      {question && (
        <div style={{
          width: '100%', background: 'rgba(255,255,255,0.8)',
          border: `1.5px solid ${light}`,
          borderRadius: 20, padding: '20px 22px', marginBottom: 24, textAlign: 'right',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{ fontSize: 'var(--text-sm)', color: accent, fontWeight: 700, marginBottom: 8 }}>
            💬 שאלה לשיחה עם הנכד/ה:
          </div>
          <div style={{ fontSize: 'var(--text-xl)', color: text, lineHeight: 1.5 }}>
            {question}
          </div>
        </div>
      )}

      {/* Emotional line */}
      <p style={{
        fontSize: 'var(--text-lg)', color: 'var(--sage)', fontWeight: 700,
        marginBottom: 28, lineHeight: 1.5,
      }}>
        💚 {state.grandmaProfile.grandchildName} גאה בך מאוד!
      </p>

      {/* CTAs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        <button
          className="btn btn-primary"
          onClick={() => navigate('grandma-conversation')}
          style={{ background: accent, boxShadow: `0 4px 20px ${accent}40` }}
        >
          💬 נושאי שיחה עם הנכד/ה
        </button>
        <button
          className="btn btn-sage"
          onClick={() => navigate('grandma-progress')}
        >
          ⭐ ראי את ההתקדמות
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('grandma-home')}
        >
          🏋️ אימון נוסף
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => navigate('grandma-home')}
        >
          חזרה הביתה
        </button>
      </div>
    </div>
  );
}
