import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

interface Props {
  onClose: () => void;
}

type View = 'main' | 'password';

export default function AccountSheet({ onClose }: Props) {
  const { state, signOut } = useApp();
  const { user, profile } = state;

  const [view,            setView]            = useState<View>('main');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [msg,             setMsg]             = useState<{ text: string; ok: boolean } | null>(null);

  const roleLabel = profile?.role === 'grandma' ? 'סבתא' : 'נכד / נכדה';
  const initials     = (profile?.full_name ?? user?.email ?? '?').charAt(0).toUpperCase();

  async function handleSignOut() {
    await signOut();
    onClose();
  }

  // ── Change password ────────────────────────────────────────────────────────
  async function handleChangePassword() {
    setMsg(null);
    if (newPassword.length < 6) {
      setMsg({ text: 'הסיסמה חייבת להכיל לפחות 6 תווים', ok: false });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ text: 'הסיסמאות אינן תואמות', ok: false });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      setMsg({ text: 'שגיאה בשינוי הסיסמה — נסי שוב', ok: false });
    } else {
      setMsg({ text: '✓ הסיסמה שונתה בהצלחה', ok: true });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => { goBack(); }, 2000);
    }
  }

  function goBack() {
    setView('main');
    setMsg(null);
    setNewPassword('');
    setConfirmPassword('');
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 200,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'white',
        borderRadius: '22px 22px 0 0',
        padding: '0 24px 44px',
        zIndex: 201,
        direction: 'rtl',
        animation: 'slideUp 0.28s ease',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Drag handle */}
        <div style={{
          width: 40, height: 4, background: '#DDD',
          borderRadius: 2, margin: '14px auto 22px',
        }} />

        {/* ── MAIN VIEW ── */}
        {view === 'main' && (
          <>
            {/* Avatar + info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'var(--terracotta)', color: 'white',
                fontSize: 24, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontFamily: 'var(--font-display)',
              }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 'var(--text-xl)', fontWeight: 800,
                  color: 'var(--dark)', marginBottom: 2,
                  fontFamily: 'var(--font-display)',
                }}>
                  {profile?.full_name ?? '—'}
                </div>
                <div style={{
                  fontSize: 'var(--text-sm)', color: 'var(--mid)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  direction: 'ltr', textAlign: 'right',
                }}>
                  {user?.email}
                </div>
                <div style={{
                  display: 'inline-block', marginTop: 5,
                  background: 'var(--light-bg)', borderRadius: 8,
                  padding: '2px 10px', fontSize: 'var(--text-xs)',
                  color: 'var(--dark-mid)', fontWeight: 700,
                }}>
                  {roleLabel}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <button onClick={() => { setMsg(null); setView('password'); }} style={actionBtn()}>
                <span style={{ fontSize: 20 }}>🔑</span>
                שינוי סיסמה
              </button>


              <button
                onClick={handleSignOut}
                style={actionBtn('#FFF5F5', '#F5C0C0', '#C0392B')}
              >
                <span style={{ fontSize: 20 }}>🚪</span>
                התנתקות
              </button>
            </div>

            <button onClick={onClose} style={ghostBtn}>סגור</button>
          </>
        )}

        {/* ── CHANGE PASSWORD VIEW ── */}
        {view === 'password' && (
          <>
            <button onClick={goBack} style={backLinkStyle}>‹ חזרה</button>

            <h2 style={sheetTitle}>שינוי סיסמה</h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--mid)', marginBottom: 22 }}>
              הסיסמה החדשה תיכנס לתוקף מיד
            </p>

            {/* New password */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>סיסמה חדשה</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="לפחות 6 תווים"
                  style={{ ...inputStyle, paddingLeft: 48 }}
                  dir="ltr"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={eyeBtn}
                  aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>אימות סיסמה</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="הכנס שוב את הסיסמה"
                style={inputStyle}
                dir="ltr"
                autoComplete="new-password"
              />
            </div>

            {msg && <MsgBox msg={msg} />}

            <button
              onClick={handleChangePassword}
              disabled={loading}
              style={submitBtn(loading)}
            >
              {loading ? 'שומר...' : 'שמור סיסמה חדשה'}
            </button>

            <button onClick={goBack} style={{ ...ghostBtn, marginTop: 10 }}>ביטול</button>
          </>
        )}

      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function MsgBox({ msg }: { msg: { text: string; ok: boolean } }) {
  return (
    <div style={{
      padding: '11px 14px', borderRadius: 10, marginBottom: 14,
      background: msg.ok ? '#F0FFF4' : '#FFF0F0',
      border: `1.5px solid ${msg.ok ? '#A8E6C8' : '#F5C0C0'}`,
      color: msg.ok ? '#2D7D50' : '#C0392B',
      fontSize: 'var(--text-sm)', fontWeight: 600,
    }}>
      {msg.text}
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
function actionBtn(bg = 'var(--light-bg)', border = 'var(--light)', color = 'var(--dark)'): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 12,
    width: '100%', padding: '16px 18px',
    background: bg, border: `1.5px solid ${border}`,
    borderRadius: 14, cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-base)', fontWeight: 700,
    color, textAlign: 'right',
    minHeight: 56,
  };
}

function submitBtn(loading: boolean): React.CSSProperties {
  return {
    width: '100%', padding: '15px',
    borderRadius: 14, border: 'none',
    background: loading ? 'var(--light)' : 'var(--terracotta)',
    color: loading ? 'var(--mid)' : 'white',
    fontSize: 'var(--text-base)', fontWeight: 700,
    fontFamily: 'var(--font-body)',
    cursor: loading ? 'not-allowed' : 'pointer',
    minHeight: 52,
  };
}

const sheetTitle: React.CSSProperties = {
  fontSize: 'var(--text-xl)', fontWeight: 800,
  color: 'var(--dark)', marginBottom: 6,
  fontFamily: 'var(--font-display)',
};

const backLinkStyle: React.CSSProperties = {
  background: 'none', border: 'none',
  color: 'var(--mid)', fontWeight: 700,
  fontSize: 'var(--text-sm)', cursor: 'pointer',
  fontFamily: 'var(--font-body)', padding: '0 0 16px',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 'var(--text-sm)',
  fontWeight: 700, color: 'var(--dark)', marginBottom: 7,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 14px',
  fontSize: 'var(--text-base)',
  border: '1.5px solid var(--light)', borderRadius: 12,
  background: 'white', fontFamily: 'var(--font-body)',
  color: 'var(--dark)', boxSizing: 'border-box',
};

const eyeBtn: React.CSSProperties = {
  position: 'absolute', left: 12,
  top: '50%', transform: 'translateY(-50%)',
  background: 'none', border: 'none',
  cursor: 'pointer', fontSize: 18,
  color: 'var(--mid)', padding: 4, lineHeight: 1,
};

const ghostBtn: React.CSSProperties = {
  width: '100%', padding: '12px',
  background: 'none', border: 'none',
  color: 'var(--mid)', fontSize: 'var(--text-sm)',
  fontWeight: 600, cursor: 'pointer',
  fontFamily: 'var(--font-body)', marginTop: 4,
  minHeight: 44,
};
