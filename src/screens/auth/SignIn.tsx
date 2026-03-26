import { useState, FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

type View = 'signin' | 'forgot' | 'magic';

function translateErr(msg: string): string {
  if (msg.includes('rate limit'))  return 'יותר מדי ניסיונות — נסי שוב בעוד כמה דקות';
  if (msg.includes('Network'))     return 'בעיית חיבור לרשת — בדקי את האינטרנט';
  if (msg.includes('not found') || msg.includes('No user')) return 'כתובת האימייל לא קיימת במערכת';
  return msg;
}

export default function SignIn() {
  const { navigate, signIn } = useApp();

  const [view,         setView]         = useState<View>('signin');

  // sign-in fields
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // shared across views
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [successMsg,   setSuccessMsg]   = useState<string | null>(null);

  // forgot / magic link email
  const [altEmail,     setAltEmail]     = useState('');

  function switchView(v: View) {
    setView(v);
    setError(null);
    setSuccessMsg(null);
    setAltEmail('');
  }

  // ── Sign in with password ─────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim())    { setError('נא להכניס כתובת אימייל'); return; }
    if (!password.trim()) { setError('נא להכניס סיסמה'); return; }

    setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) { setError(err); return; }
    // Success — onAuthStateChange fires → AppContext updates screen automatically
  }

  // ── Forgot password ───────────────────────────────────────────────────────
  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!altEmail.trim()) { setError('נא להכניס כתובת אימייל'); return; }

    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(
      altEmail.trim(),
      { redirectTo: window.location.origin }
    );
    setLoading(false);

    if (err) { setError(translateErr(err.message)); return; }
    setSuccessMsg('✓ קישור לאיפוס סיסמה נשלח לאימייל שלך');
  }

  // ── Magic link (sign in without password) ────────────────────────────────
  async function handleMagicLink(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!altEmail.trim()) { setError('נא להכניס כתובת אימייל'); return; }

    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: altEmail.trim(),
      options: { shouldCreateUser: false },
    });
    setLoading(false);

    if (err) { setError(translateErr(err.message)); return; }
    setSuccessMsg('✓ קישור כניסה נשלח! בדקי את תיבת הדואר שלך');
  }

  return (
    <div style={centeredStyle}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* ── SIGN IN ── */}
        {view === 'signin' && (
          <>
            <button onClick={() => navigate('auth-role-select')} style={backBtnStyle}>‹ חזרה</button>

            <div style={{ textAlign: 'center', margin: '16px 0 32px' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>👋</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 6 }}>שמחים שחזרת!</h1>
              <p style={{ color: 'var(--mid)', fontSize: 'var(--text-sm)' }}>הכניסי את פרטי הכניסה שלך</p>
            </div>

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>כתובת אימייל</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="sarah@example.com" style={inputStyle} autoComplete="email" required dir="ltr" />
              </div>

              <div>
                <label style={labelStyle}>סיסמה</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingLeft: 48 }}
                    autoComplete="current-password"
                    required
                    dir="ltr"
                  />
                  {password.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      style={{
                        position: 'absolute', left: 12,
                        top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none',
                        cursor: 'pointer', fontSize: 18,
                        color: 'var(--mid)', padding: 4, lineHeight: 1,
                      }}
                      aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  )}
                </div>
              </div>

              {/* Forgot password link */}
              <button
                type="button"
                onClick={() => switchView('forgot')}
                style={{ ...linkBtnStyle, textAlign: 'left', fontSize: 'var(--text-xs)' }}
              >
                שכחת סיסמה?
              </button>

              {error && <ErrorBox text={error} />}

              <button type="submit" disabled={loading} style={{
                background: loading ? 'var(--light)' : 'var(--terracotta)',
                color: loading ? 'var(--mid)' : 'white',
                border: 'none', borderRadius: 14, padding: '16px 0', width: '100%',
                fontSize: 'var(--text-base)', fontWeight: 700, fontFamily: 'var(--font-body)',
                cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, minHeight: 52,
              }}>
                {loading ? 'נכנסת...' : 'כניסה ←'}
              </button>
            </form>

            {/* Magic link option */}
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button onClick={() => switchView('magic')} style={linkBtnStyle}>
                כניסה מהירה ללא סיסמה (קישור לאימייל)
              </button>
            </div>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 'var(--text-sm)', color: 'var(--mid)' }}>
              אין לך חשבון עדיין?{' '}
              <button onClick={() => navigate('auth-role-select')} style={linkBtnStyle}>הירשמי כאן</button>
            </p>
          </>
        )}

        {/* ── FORGOT PASSWORD ── */}
        {view === 'forgot' && (
          <>
            <button onClick={() => switchView('signin')} style={backBtnStyle}>‹ חזרה</button>

            <div style={{ textAlign: 'center', margin: '16px 0 32px' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🔑</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 6 }}>שכחת סיסמה?</h1>
              <p style={{ color: 'var(--mid)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                הכניסי את האימייל שלך ונשלח לך קישור לאיפוס הסיסמה
              </p>
            </div>

            {successMsg ? (
              <div style={{
                background: '#F0FFF4', border: '1.5px solid #A8E6C8',
                borderRadius: 12, padding: '20px 16px',
                textAlign: 'center', color: '#2D7D50', fontWeight: 600,
                fontSize: 'var(--text-base)', lineHeight: 1.6,
              }}>
                {successMsg}
                <br />
                <button
                  onClick={() => switchView('signin')}
                  style={{ ...linkBtnStyle, color: '#2D7D50', marginTop: 12, display: 'block' }}
                >
                  חזרה להתחברות
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>כתובת אימייל</label>
                  <input
                    type="email"
                    value={altEmail}
                    onChange={e => setAltEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    style={inputStyle}
                    autoComplete="email"
                    dir="ltr"
                  />
                </div>

                {error && <ErrorBox text={error} />}

                <button type="submit" disabled={loading} style={{
                  background: loading ? 'var(--light)' : 'var(--terracotta)',
                  color: loading ? 'var(--mid)' : 'white',
                  border: 'none', borderRadius: 14, padding: '16px 0', width: '100%',
                  fontSize: 'var(--text-base)', fontWeight: 700, fontFamily: 'var(--font-body)',
                  cursor: loading ? 'not-allowed' : 'pointer', minHeight: 52,
                }}>
                  {loading ? 'שולחת...' : 'שלחי לי קישור לאיפוס ←'}
                </button>
              </form>
            )}
          </>
        )}

        {/* ── MAGIC LINK ── */}
        {view === 'magic' && (
          <>
            <button onClick={() => switchView('signin')} style={backBtnStyle}>‹ חזרה</button>

            <div style={{ textAlign: 'center', margin: '16px 0 32px' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>✉️</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 6 }}>כניסה ללא סיסמה</h1>
              <p style={{ color: 'var(--mid)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                נשלח לך קישור כניסה מהיר לכתובת האימייל שלך
              </p>
            </div>

            {successMsg ? (
              <div style={{
                background: '#F0FFF4', border: '1.5px solid #A8E6C8',
                borderRadius: 12, padding: '20px 16px',
                textAlign: 'center', color: '#2D7D50', fontWeight: 600,
                fontSize: 'var(--text-base)', lineHeight: 1.6,
              }}>
                {successMsg}
                <br />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--mid)', fontWeight: 400 }}>
                  פתחי את הקישור במכשיר הזה להתחברות אוטומטית
                </span>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>כתובת אימייל</label>
                  <input
                    type="email"
                    value={altEmail}
                    onChange={e => setAltEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    style={inputStyle}
                    autoComplete="email"
                    dir="ltr"
                  />
                </div>

                {error && <ErrorBox text={error} />}

                <button type="submit" disabled={loading} style={{
                  background: loading ? 'var(--light)' : 'var(--terracotta)',
                  color: loading ? 'var(--mid)' : 'white',
                  border: 'none', borderRadius: 14, padding: '16px 0', width: '100%',
                  fontSize: 'var(--text-base)', fontWeight: 700, fontFamily: 'var(--font-body)',
                  cursor: loading ? 'not-allowed' : 'pointer', minHeight: 52,
                }}>
                  {loading ? 'שולחת...' : 'שלחי לי קישור כניסה ←'}
                </button>
              </form>
            )}
          </>
        )}

      </div>
    </div>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <div style={{
      background: '#FFF0F0', border: '1.5px solid #F5C0C0',
      borderRadius: 10, padding: '12px 14px',
      color: '#C0392B', fontSize: 'var(--text-sm)', fontWeight: 600,
    }}>
      ⚠️ {text}
    </div>
  );
}

const centeredStyle: React.CSSProperties = {
  minHeight: '100vh', background: 'var(--cream)',
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  padding: '40px 24px 60px', direction: 'rtl',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 'var(--text-sm)', fontWeight: 700,
  color: 'var(--dark)', marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 14px', fontSize: 'var(--text-base)',
  border: '1.5px solid var(--light)', borderRadius: 12,
  background: 'white', fontFamily: 'var(--font-body)',
  color: 'var(--dark)', boxSizing: 'border-box',
};
const backBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--mid)',
  fontSize: 'var(--text-sm)', fontWeight: 700, cursor: 'pointer',
  fontFamily: 'var(--font-body)', padding: '0 0 4px',
};
const linkBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--terracotta)',
  fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer',
  fontFamily: 'var(--font-body)', padding: 0, textDecoration: 'underline',
};
