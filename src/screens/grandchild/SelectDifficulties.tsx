import { useApp } from '../../context/AppContext';
import { DIFFICULTIES } from '../../data/difficulties';
import { Difficulty, Goal } from '../../types';

const GOALS: { id: Goal; label: string; emoji: string; sub: string }[] = [
  { id: 'strength', label: 'חיזוק הגוף', emoji: '💪', sub: 'תרגילים לחיזוק שרירים' },
  { id: 'mood', label: 'שיפור מצב רוח', emoji: '😊', sub: 'נשימות ותנועה משחררת' },
  { id: 'conversation', label: 'נושאי שיחה', emoji: '💬', sub: 'לדבר ביחד אחרי האימון' },
  { id: 'consistency', label: 'התמדה יומית', emoji: '📅', sub: 'לקבוע הרגל יומי' },
  { id: 'quality_time', label: 'זמן איכות', emoji: '🤝', sub: 'להרגיש קרובים יותר' },
];

export default function SelectDifficulties() {
  const { state, toggleDifficulty, toggleGoal, navigate } = useApp();
  const { grandmaProfile } = state;

  return (
    <div className="screen" style={{ background: 'var(--cream)' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('grandchild-create-profile')} aria-label="חזרה">›</button>
        <div>
          <h2 style={{ marginBottom: 0 }}>התאמה אישית</h2>
          <p className="text-small">מה כדאי שנדע על סבתא?</p>
        </div>
      </div>

      {/* Difficulties */}
      <section aria-labelledby="difficulties-heading">
        <h3 id="difficulties-heading" style={{ marginBottom: 'var(--space-2)' }}>
          מגבלות ואתגרים
        </h3>
        <p className="text-small" style={{ marginBottom: 'var(--space-4)' }}>
          סמן/י את מה שרלוונטי – האפליקציה תתאים את עצמה
        </p>
        <div className="checkbox-grid" style={{ marginBottom: 'var(--space-8)' }}>
          {DIFFICULTIES.map((d) => {
            const selected = grandmaProfile.difficulties.includes(d.id);
            return (
              <button
                key={d.id}
                className={`checkbox-item ${selected ? 'selected' : ''}`}
                onClick={() => toggleDifficulty(d.id as Difficulty)}
                aria-pressed={selected}
                aria-label={`${d.label}: ${d.description}`}
              >
                <span className="checkbox-emoji">{d.emoji}</span>
                <div className="checkbox-text">
                  <div className="title">{d.label}</div>
                  <div className="subtitle">{d.description}</div>
                </div>
                <div className="checkbox-check">{selected ? '✓' : ''}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Goals */}
      <section aria-labelledby="goals-heading">
        <h3 id="goals-heading" style={{ marginBottom: 'var(--space-2)' }}>
          מטרות
        </h3>
        <p className="text-small" style={{ marginBottom: 'var(--space-4)' }}>
          מה הכי חשוב לך?
        </p>
        <div className="checkbox-grid" style={{ marginBottom: 'var(--space-8)' }}>
          {GOALS.map((g) => {
            const selected = grandmaProfile.goals.includes(g.id);
            return (
              <button
                key={g.id}
                className={`checkbox-item ${selected ? 'selected' : ''}`}
                onClick={() => toggleGoal(g.id as Goal)}
                aria-pressed={selected}
                aria-label={`${g.label}: ${g.sub}`}
              >
                <span className="checkbox-emoji">{g.emoji}</span>
                <div className="checkbox-text">
                  <div className="title">{g.label}</div>
                  <div className="subtitle">{g.sub}</div>
                </div>
                <div className="checkbox-check">{selected ? '✓' : ''}</div>
              </button>
            );
          })}
        </div>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <button className="btn btn-primary" onClick={() => navigate('grandchild-dashboard')}>
          ✅ שמור וסיים הגדרה
        </button>
        <button className="btn btn-ghost" onClick={() => navigate('grandchild-home')}>
          ביטול
        </button>
      </div>
    </div>
  );
}
