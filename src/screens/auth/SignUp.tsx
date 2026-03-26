import { useState, FormEvent } from 'react';
import { useApp } from '../../context/AppContext';

export default function SignUp() {
  const { navigate, signUp } = useApp();

  const [fullName,  setFullName]  = useState('');
  const [nickname,  setNickname]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [role,      setRole]      = useState<'grandma' | 'grandchild'>('grandma');
  const [gender,    setGender]    = useState<'male' | 'female' | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) { setError('נא להכניס שם מלא'); return; }
    if (!email.trim())    { setError('נא להכניס כתובת אימייל'); return; }
    if (password.length < 6) { setError('הסיסמה חייבת להכיל לפחות 6 תווים'); return; }
    if (role === 'grandchild' && !gender) { setError('נא לבחור לשון פנייה'); return; }

    setLoading(true);
    try {
      const { error: err } = await signUp({
        email: email.trim(), password,
        fullName: fullName.trim(),
        phone,
        role,
        nickname: nickname.trim() || undefined,
        gender: gender ?? undefined,
      });
      if (err) { setError(err); return; }
      setSuccess(true);
    } catch {
      setError('שגיאה לא צפויה — נסה שוב');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={centeredStyle}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 8 }}>
            {role === 'grandma' ? 'ברוכה הבאה!' : gender === 'female' ? 'ברוכה הבאה!' : 'ברוך הבא!'}
          </h2>
          <p style={{ color: 'var(--mid)', fontSize: 'var(--text-base)' }}>החשבון נוצר בהצלחה. נכנסים לאפליקציה...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={centeredStyle}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <button onClick={() => navigate('auth-role-select')} style={backBtnStyle}>‹ חזרה</button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 4, marginTop: 8 }}>יצירת חשבון</h1>
        <p style={{ color: 'var(--mid)', fontSize: 'var(--text-sm)', marginBottom: 28 }}>כמה פרטים ומתחילים!</p>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Role toggle */}
          <div>
            <label style={labelStyle}>אני</label>
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              {(['grandma', 'grandchild'] as const).map(r => (
                <button key={r} type="button" onClick={() => { setRole(r); if (r === 'grandma') setGender(null); }} style={{
                  flex: 1, padding: '10px 0', borderRadius: 12,
                  border: role === r ? '2px solid var(--terracotta)' : '1.5px solid var(--light)',
                  background: role === r ? '#FAF0E6' : 'white',
                  color: role === r ? 'var(--terracotta)' : 'var(--mid)',
                  fontWeight: 700, fontSize: 'var(--text-sm)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}>
                  {r === 'grandma' ? '👵 סבתא' : '🧑 נכד/ה'}
                </button>
              ))}
            </div>
          </div>

          {/* Gender selector — only for grandchild */}
          {role === 'grandchild' && (
            <div>
              <label style={labelStyle}>לשון פנייה</label>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                {([['male', '👦 זכר'], ['female', '👧 נקבה']] as const).map(([g, label]) => (
                  <button key={g} type="button" onClick={() => setGender(g)} style={{
                    flex: 1, padding: '10px 0', borderRadius: 12,
                    border: gender === g ? '2px solid var(--sage)' : '1.5px solid var(--light)',
                    background: gender === g ? '#EFF5EE' : 'white',
                    color: gender === g ? 'var(--sage)' : 'var(--mid)',
                    fontWeight: 700, fontSize: 'var(--text-sm)',
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                  }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Full name */}
          <div>
            <label style={labelStyle}>שם מלא</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="שרה לוי" style={inputStyle} autoComplete="name" required />
          </div>

          {/* Nickname */}
          <div>
            <label style={labelStyle}>
              כינוי{' '}
              <span style={{ fontWeight: 400, color: 'var(--mid)' }}>(אופציונלי — איך האפליקציה תפנה אלייך)</span>
            </label>
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}
              placeholder={role === 'grandma' ? 'למשל: שרי' : 'למשל: נועה'}
              style={inputStyle} autoComplete="nickname" />
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>כתובת אימייל</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="sarah@example.com" style={inputStyle} autoComplete="email" required dir="ltr" />
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>סיסמה (לפחות 6 תווים)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" style={inputStyle} autoComplete="new-password" required dir="ltr" />
          </div>

          {/* Phone */}
          <div>
            <label style={labelStyle}>טלפון <span style={{ fontWeight: 400, color: 'var(--mid)' }}>(אופציונלי)</span></label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="050-0000000" style={inputStyle} dir="ltr" />
          </div>

          {error && (
            <div style={{ background: '#FFF0F0', border: '1.5px solid #F5C0C0', borderRadius: 10, padding: '12px 14px', color: '#C0392B', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            background: loading ? 'var(--light)' : 'var(--terracotta)',
            color: loading ? 'var(--mid)' : 'white',
            border: 'none', borderRadius: 14, padding: '16px 0', width: '100%',
            fontSize: 'var(--text-base)', fontWeight: 700, fontFamily: 'var(--font-body)',
            cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, minHeight: 52,
          }}>
            {loading ? 'יוצרת חשבון...' : 'יצירת חשבון ←'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 'var(--text-sm)', color: 'var(--mid)' }}>
          כבר יש לך חשבון?{' '}
          <button onClick={() => navigate('auth-sign-in')} style={linkBtnStyle}>התחברי</button>
        </p>
      </div>
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
