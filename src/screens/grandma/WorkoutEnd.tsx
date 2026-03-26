import { useApp } from '../../context/AppContext';
import { getWorkoutForProfile } from '../../data/exercises';

const questions = [
  { label: 'שאלה לשיתוף', text: 'איזה תרגיל הכי אהבת היום?' },
  { label: 'שאלה לשיתוף', text: 'מה היה לך קל יותר – ידיים או רגליים?' },
  { label: 'שאלה לשיתוף', text: 'זה הזכיר לך משהו מפעם?' },
  { label: 'שאלה לשיתוף', text: 'איך הגוף שלך מרגיש עכשיו?' },
];

const praises = [
  'כל הכבוד! את מדהימה! 🌟',
  'עשית משהו נפלא לגוף ולנשמה שלך 💛',
  'אני גאה בך מאוד! ❤️',
  'את חזקה ממה שאת חושבת! 💪',
];

export default function WorkoutEnd() {
  const { state, navigate } = useApp();
  const { grandmaProfile, workoutHistory, pendingMessage } = state;
  const latest = workoutHistory[0];
  const exercises = getWorkoutForProfile(grandmaProfile.difficulties, grandmaProfile.fitnessLevel);
  const praise = praises[Math.floor(Math.random() * praises.length)];
  const question = questions[Math.floor(Math.random() * questions.length)];
  const lastExercise = exercises[exercises.length - 1];

  return (
    <div className="workout-end">
      {/* Celebration */}
      <div className="celebration" role="img" aria-label="ברכות">🎉</div>
      <h1 style={{ color: 'var(--sage)', textAlign: 'center' }}>{praise}</h1>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-number">{latest?.duration ?? exercises.length * 2}</span>
          <span className="stat-label">דקות תנועה</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{latest?.exerciseCount ?? exercises.length}</span>
          <span className="stat-label">תרגילים</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{workoutHistory.length}</span>
          <span className="stat-label">אימונים השבוע</span>
        </div>
      </div>

      {/* Conversation starter */}
      <div className="conversation-question" style={{ width: '100%' }}>
        <div className="q-label">💬 {question.label}</div>
        <div className="q-text">{lastExercise?.conversationStarter || question.text}</div>
      </div>

      {/* Message from grandchild */}
      {pendingMessage && (
        <div className="grandchild-message-preview">
          <span style={{ fontSize: 36 }}>💌</span>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--terracotta)', fontWeight: 700, marginBottom: 4 }}>
              הודעה מ{grandmaProfile.grandchildName}:
            </div>
            <div style={{ fontSize: 'var(--text-lg)', color: 'var(--dark)', lineHeight: 1.5 }}>
              {pendingMessage}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', width: '100%', marginTop: 'var(--space-4)' }}>
        <button className="btn btn-primary" onClick={() => navigate('grandma-conversation')}>
          💬 נושאי שיחה עם הנכד/ה
        </button>
        <button className="btn btn-sage" onClick={() => navigate('grandma-progress')}>
          ⭐ ראי את ההתקדמות שלך
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('grandma-home')}>
          חזרה הביתה
        </button>
      </div>
    </div>
  );
}
