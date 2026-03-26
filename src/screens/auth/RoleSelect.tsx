import { useApp } from '../../context/AppContext';

export default function RoleSelect() {
  const { navigate } = useApp();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(170deg, #FFFCF7 0%, #FAF0E6 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      direction: 'rtl',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🏃‍♀️</div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          color: 'var(--dark)',
          marginBottom: 10,
          fontWeight: 900,
        }}>
          מתאמנים יחד
        </h1>
        <p style={{ color: 'var(--mid)', fontSize: 'var(--text-base)', lineHeight: 1.6 }}>
          תנועה, בריאות וקשר משפחתי
        </p>
      </div>

      {/* Description card */}
      <div style={{
        background: 'white', borderRadius: 20,
        border: '1.5px solid var(--light)',
        padding: '20px 24px',
        marginBottom: 40,
        maxWidth: 360, width: '100%',
        textAlign: 'center',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      }}>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--dark-mid)', lineHeight: 1.7, margin: 0 }}>
          אימונים עדינים ובטוחים לסבתא,<br />
          עם חיבור יומיומי לנכד/ה שאוהב/ת אותה
        </p>
      </div>

      {/* Action buttons */}
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <button
          onClick={() => navigate('auth-sign-up')}
          style={{
            background: 'var(--terracotta)', color: 'white',
            border: 'none', borderRadius: 16,
            padding: '18px 0', width: '100%',
            fontSize: 'var(--text-lg)', fontWeight: 800,
            fontFamily: 'var(--font-body)', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(196,116,74,0.35)',
            transition: 'transform 0.12s ease',
          }}
          onPointerDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onPointerUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          הרשמה — מתחילים! ←
        </button>

        <button
          onClick={() => navigate('auth-sign-in')}
          style={{
            background: 'white', color: 'var(--dark)',
            border: '2px solid var(--light)', borderRadius: 16,
            padding: '16px 0', width: '100%',
            fontSize: 'var(--text-base)', fontWeight: 700,
            fontFamily: 'var(--font-body)', cursor: 'pointer',
            transition: 'transform 0.12s ease',
          }}
          onPointerDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onPointerUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          כבר יש לי חשבון — כניסה
        </button>
      </div>

      <p style={{
        marginTop: 40, fontSize: 'var(--text-xs)',
        color: 'var(--mid)', textAlign: 'center',
      }}>
        האפליקציה אינה תחליף לייעוץ רפואי
      </p>
    </div>
  );
}
