import { useApp } from '../../context/AppContext';
import { DIFFICULTIES } from '../../data/difficulties';

export default function GrandchildDashboard() {
  const { state, navigate } = useApp();
  const { grandmaProfile, workoutHistory } = state;
  const thisWeek = workoutHistory.filter((w) => {
    const d = new Date(w.date);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });
  const totalMinutes = thisWeek.reduce((a, b) => a + b.duration, 0);

  const selectedDifficulties = DIFFICULTIES.filter((d) =>
    grandmaProfile.difficulties.includes(d.id)
  );

  return (
    <div className="screen" style={{ background: 'var(--cream)' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('grandchild-home')} aria-label="חזרה">›</button>
        <div>
          <h2 style={{ marginBottom: 0 }}>פעילות של {grandmaProfile.name}</h2>
          <p className="text-small">עדכון כללי השבוע</p>
        </div>
      </div>

      {/* Proud banner */}
      {thisWeek.length > 0 && (
        <div className="proud-banner">
          <p>🌟 {grandmaProfile.name} התאמנה {thisWeek.length} פעמים השבוע!</p>
          <p style={{ fontSize: 'var(--text-base)', opacity: 0.9, marginTop: 4 }}>
            סיבה טובה לחגוג יחד
          </p>
        </div>
      )}

      {thisWeek.length === 0 && (
        <div className="card" style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <p style={{ fontSize: 'var(--text-lg)' }}>
            עוד לא היה אימון השבוע.<br />
            אולי כדאי לשלוח הודעת עידוד? 💌
          </p>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div className="dashboard-stat">
          <span className="ds-icon">🏋️‍♀️</span>
          <div className="ds-content">
            <div className="ds-label">אימונים השבוע</div>
            <div className="ds-value">{thisWeek.length} פעמים</div>
          </div>
        </div>
        <div className="dashboard-stat">
          <span className="ds-icon">⏱️</span>
          <div className="ds-content">
            <div className="ds-label">סה"כ זמן תנועה</div>
            <div className="ds-value">{totalMinutes} דקות</div>
          </div>
        </div>
        <div className="dashboard-stat">
          <span className="ds-icon">📊</span>
          <div className="ds-content">
            <div className="ds-label">סה"כ אימונים</div>
            <div className="ds-value">{workoutHistory.length} אימונים</div>
          </div>
        </div>
      </div>

      {/* Active adaptations */}
      {selectedDifficulties.length > 0 && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-3)' }}>התאמות פעילות:</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {selectedDifficulties.map((d) => (
              <span key={d.id} className="tag tag-accent">
                {d.emoji} {d.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <button className="btn btn-primary" onClick={() => navigate('grandchild-send-message')}>
          💌 שלח/י הודעה לסבתא
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('grandchild-select-difficulties')}>
          ✏️ ערוך/י הגדרות
        </button>
        <button className="btn btn-ghost" onClick={() => navigate('grandchild-home')}>
          חזרה
        </button>
      </div>
    </div>
  );
}
