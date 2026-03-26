import { useApp } from '../context/AppContext';

export default function Onboarding() {
  const { setRole, navigate } = useApp();

  const choose = (role: 'grandma' | 'grandchild') => {
    setRole(role);
    navigate(role === 'grandma' ? 'grandma-home' : 'grandchild-home');
  };

  return (
    <div className="onboarding">
      <div className="onboarding-logo">
        <span className="logo-icon">🤝</span>
        <h1>מתאמנים יחד</h1>
        <p>תנועה, בריאות וקשר משפחתי</p>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
        <div className="card" style={{ padding: 'var(--space-5) var(--space-6)' }}>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--dark-mid)', lineHeight: 1.7 }}>
            אימונים עדינים ובטוחים לסבתא,<br />
            עם חיבור יומיומי לנכד/ה שאוהב/ת אותה
          </p>
        </div>
      </div>

      <div className="role-cards">
        <button
          className="role-card"
          onClick={() => choose('grandma')}
          aria-label="כניסה לסבתא"
        >
          <span className="role-card-icon">👵</span>
          <div className="role-card-text">
            <h3>אני סבתא</h3>
            <p>רוצה להתאמן ולהישאר בקשר עם הנכד/ה</p>
          </div>
          <span style={{ fontSize: 22, color: 'var(--mid)' }}>‹</span>
        </button>

        <button
          className="role-card"
          onClick={() => choose('grandchild')}
          aria-label="כניסה לנכד או נכדה"
        >
          <span className="role-card-icon">🧑</span>
          <div className="role-card-text">
            <h3>אני נכד/ה</h3>
            <p>רוצה לתת מתנה לסבתא שלי</p>
          </div>
          <span style={{ fontSize: 22, color: 'var(--mid)' }}>‹</span>
        </button>
      </div>

      <p className="text-small text-center" style={{ marginTop: 'auto' }}>
        האפליקציה אינה תחליף לייעוץ רפואי
      </p>
    </div>
  );
}
