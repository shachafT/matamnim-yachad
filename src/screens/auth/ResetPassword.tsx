import { useState, FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { EyeIcon, EyeOffIcon } from '../../components/icons';

export default function ResetPassword() {
  const { state, navigate } = useApp();
  const [password,     setPassword]     = useState('');
  const [confirm,      setConfirm]      = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [done,         setDone]         = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    if (password !== confirm) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    setDone(true);

    // Navigate to the user's home after a short success delay
    setTimeout(() => {
      const role = state.profile?.role ?? state.role;
      if (role === 'grandma')      navigate('grandma-home');
      else if (role === 'grandchild') navigate('grandchild-home');
      else                          navigate('auth-sign-in');
    }, 2200);
  }

  return (
    <div style={containerStyle}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        <div style={{ textAlign: 'center', margin: '16px 0 32px' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔒</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 6 }}>
            הגדרת סיסמה חדשה
          </h1>
          <p style={{ color: 'var(--mid)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
            הזיני סיסמה חדשה לחשבון שלך
          </p>
        </div>

        {done ? (
          <div style={successBoxStyle}>
            ✓ הסיסמה עודכנה בהצלחה!
            <br />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--mid)', fontWeight: 400 }}>
              מועברת למסך הראשי...
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <div>
              <label style={labelStyle}>סיסמה חדשה</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="לפחות 6 תווים"
                  style={{ ...inputStyle, paddingLeft: 48 }}
                  autoComplete="new-password"
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
                    {showPassword ? <EyeOffIcon size={18} color="var(--mid)" /> : <EyeIcon size={18} color="var(--mid)" />}
                  </button>
                )}
              </div>
            </div>

            <div>
              <label style={labelStyle}>אימות סיסמה</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="הזיני את הסיסמה שוב"
                style={inputStyle}
                autoComplete="new-password"
                dir="ltr"
              />
            </div>

            {error && (
              <div style={{
                background: '#FFF0F0', border: '1.5px solid #F5C0C0',
                borderRadius: 10, padding: '12px 14px',
                color: '#C0392B', fontSize: 'var(--text-sm)', fontWeight: 600,
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? 'var(--light)' : 'var(--terracotta)',
                color: loading ? 'var(--mid)' : 'white',
                border: 'none', borderRadius: 14, padding: '16px 0', width: '100%',
                fontSize: 'var(--text-base)', fontWeight: 700, fontFamily: 'var(--font-body)',
                cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, minHeight: 52,
              }}
            >
              {loading ? 'שומרת...' : 'עדכני סיסמה ←'}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
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

const successBoxStyle: React.CSSProperties = {
  background: '#F0FFF4', border: '1.5px solid #A8E6C8',
  borderRadius: 12, padding: '20px 16px',
  textAlign: 'center', color: '#2D7D50', fontWeight: 600,
  fontSize: 'var(--text-base)', lineHeight: 1.6,
};
