import { useApp } from '../../context/AppContext';

export default function CreateProfile() {
  const { state, updateProfile, navigate } = useApp();
  const { grandmaProfile } = state;

  return (
    <div className="screen" style={{ background: 'var(--cream)' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('grandchild-home')} aria-label="חזרה">›</button>
        <div>
          <h2 style={{ marginBottom: 0 }}>פרופיל לסבתא</h2>
          <p className="text-small">קצת פרטים כדי להתאים אישית</p>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="grandma-name">שם הסבתא</label>
        <input
          id="grandma-name"
          type="text"
          value={grandmaProfile.name}
          onChange={(e) => updateProfile({ name: e.target.value })}
          placeholder="למשל: סבתא רחל"
          aria-label="שם הסבתא"
        />
      </div>

      <div className="form-group">
        <label htmlFor="grandchild-name">השם שלך</label>
        <input
          id="grandchild-name"
          type="text"
          value={grandmaProfile.grandchildName}
          onChange={(e) => updateProfile({ grandchildName: e.target.value })}
          placeholder="השם שלך"
          aria-label="שם הנכד או הנכדה"
        />
      </div>

      <div className="form-group">
        <label>רמת התחלה</label>
        <p className="text-small" style={{ marginBottom: 'var(--space-3)' }}>
          אם לסבתא יש מגבלות תנועה – בחר/י "עדין מאוד"
        </p>
        <div className="level-selector">
          <button
            className={`level-btn ${grandmaProfile.fitnessLevel === 'easy' ? 'active' : ''}`}
            onClick={() => updateProfile({ fitnessLevel: 'easy' })}
            aria-pressed={grandmaProfile.fitnessLevel === 'easy'}
          >
            🌸 עדין מאוד
          </button>
          <button
            className={`level-btn ${grandmaProfile.fitnessLevel === 'medium' ? 'active' : ''}`}
            onClick={() => updateProfile({ fitnessLevel: 'medium' })}
            aria-pressed={grandmaProfile.fitnessLevel === 'medium'}
          >
            🌿 נוח ובטוח
          </button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="greeting">הודעת ברכה לסבתא</label>
        <textarea
          id="greeting"
          rows={3}
          value={grandmaProfile.greetingMessage ?? ''}
          onChange={(e) => updateProfile({ greetingMessage: e.target.value })}
          placeholder="כתוב/י מילים מהלב לסבתא..."
          style={{ resize: 'none', minHeight: 96, padding: 'var(--space-4)' }}
          aria-label="הודעת ברכה לסבתא"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
        <button
          className="btn btn-primary"
          onClick={() => navigate('grandchild-select-difficulties')}
        >
          הבא: מגבלות ומטרות ›
        </button>
        <button className="btn btn-ghost" onClick={() => navigate('grandchild-home')}>
          ביטול
        </button>
      </div>
    </div>
  );
}
