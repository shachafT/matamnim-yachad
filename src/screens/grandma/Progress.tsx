import { useApp } from '../../context/AppContext';

const DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

export default function Progress() {
  const { state, navigate } = useApp();
  const { workoutHistory, grandmaProfile } = state;

  // Simple streak: consecutive days going back from today
  const streak = workoutHistory.length;

  // Week circles – show last 7 days
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const hasDone = workoutHistory.some((w) => w.date === dateStr);
    const isToday = i === 6;
    return { label: DAYS[d.getDay()], hasDone, isToday };
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="progress-screen screen">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('grandma-home')} aria-label="חזרה">›</button>
        <div>
          <h2 style={{ marginBottom: 0 }}>ההתקדמות שלך</h2>
          <p className="text-small">כל צעד קטן חשוב</p>
        </div>
      </div>

      {/* Streak */}
      <div className="streak-card">
        <span className="streak-number">{streak}</span>
        <div className="streak-label">אימונים עשיתי 🌟</div>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: 'var(--space-3)', fontSize: 'var(--text-base)' }}>
          {grandmaProfile.grandchildName} גאה בך מאוד! ❤️
        </p>
      </div>

      {/* Week circles */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>השבוע:</h3>
        <div className="week-circles">
          {weekDays.map((d, i) => (
            <div
              key={i}
              className={`day-circle ${d.hasDone ? 'done' : ''} ${d.isToday ? 'today' : ''}`}
              role="img"
              aria-label={`${d.label}: ${d.hasDone ? 'התאמנת' : 'לא התאמנת'}`}
            >
              {d.hasDone ? '✓' : d.label}
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>האימונים שלי:</h3>
        <div className="history-list">
          {workoutHistory.length === 0 && (
            <div className="card" style={{ textAlign: 'center' }}>
              <p>עוד לא היה אימון. התחילי את הראשון! 💪</p>
            </div>
          )}
          {workoutHistory.map((w, i) => (
            <div key={i} className="history-item">
              <span className="history-icon">✅</span>
              <div className="history-text">
                <div className="history-date">{formatDate(w.date)}</div>
                <div className="history-desc">
                  {w.exerciseCount} תרגילים • {w.type}
                </div>
              </div>
              <div className="history-duration">{w.duration} דק'</div>
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" onClick={() => navigate('grandma-home')}>
        🏃‍♀️ לאימון הבא!
      </button>
      <button
        className="btn btn-ghost"
        onClick={() => navigate('grandma-home')}
        style={{ marginTop: 'var(--space-3)' }}
      >
        חזרה לבית
      </button>
    </div>
  );
}
