import { useMemo, useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { WORKOUTS } from '../../data/workoutsData';
import { PersonIcon } from '../../components/icons';

const INDEPENDENT_WORKOUT_IDS = ['W06', 'W07', 'W08'];
import AccountSheet from '../../components/AccountSheet';
import { getScheduleForGrandma, type ScheduledWorkoutRow } from '../../lib/workoutScheduleService';
import {
  sendMessage, getMessages, subscribeToMessages,
  markAsRead, getLinkedUser,
} from '../../lib/messageService';
import { connectByCode } from '../../lib/inviteService';
import type { Message, LinkedUser } from '../../lib/messageService';
import type { RealtimeChannel } from '@supabase/supabase-js';

export default function GrandmaHome() {
  const { state, navigate, setSelectedWorkout, refreshGrandmaDifficulties } = useApp();
  const [showAccount, setShowAccount] = useState(false);
  const { grandmaProfile, user, profile } = state;
  const firstName = profile?.nickname || grandmaProfile.name.replace('סבתא ', '') || 'סבתא';

  const independentWorkouts = useMemo(
    () => WORKOUTS.filter(w => INDEPENDENT_WORKOUT_IDS.includes(w.id)),
    []
  );

  const today = new Date().toISOString().split('T')[0];
  const hour   = new Date().getHours();
  const greeting = hour < 12 ? 'בוקר טוב' : hour < 17 ? 'צהריים טובים' : 'ערב טוב';

  // Refresh grandma's difficulties from DB so workout adaptations stay current
  useEffect(() => { refreshGrandmaDifficulties(); }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [dbSchedule, setDbSchedule] = useState<ScheduledWorkoutRow[]>([]);
  useEffect(() => {
    if (!user?.id) return;
    getScheduleForGrandma(user.id).then(setDbSchedule);
  }, [user?.id]);

  const todaySchedule = useMemo(
    () => dbSchedule.find(s => s.date === today),
    [dbSchedule, today]
  );
  const todayWorkout = todaySchedule
    ? WORKOUTS.find(w => w.id === todaySchedule.workoutId)
    : null;

  const startTodayWorkout = () => {
    if (!todayWorkout) return;
    setSelectedWorkout(todayWorkout.id);
    navigate('grandma-active-workout');
  };

  // ── Messages ──────────────────────────────────────────────────────────────
  const [messages,      setMessages]      = useState<Message[]>([]);
  const [msgText,       setMsgText]       = useState('');
  const [other,         setOther]         = useState<LinkedUser | null>(null);
  const [msgLoading,    setMsgLoading]    = useState(true);
  const [sending,       setSending]       = useState(false);
  const [codeInput,     setCodeInput]     = useState('');
  const [codeError,     setCodeError]     = useState<string | null>(null);
  const [codeSuccess,   setCodeSuccess]   = useState<string | null>(null);
  const [codeConnecting, setCodeConnecting] = useState(false);
  const [refreshKey,    setRefreshKey]    = useState(0);
  const msgBottomRef = useRef<HTMLDivElement>(null);
  const channelRef   = useRef<RealtimeChannel | null>(null);
  const myId = user?.id;

  useEffect(() => {
    if (!myId) return;
    setMsgLoading(true);
    getLinkedUser(myId, 'grandma').then(async linked => {
      setOther(linked);
      if (!linked) { setMsgLoading(false); return; }
      const msgs = await getMessages(myId, linked.id);
      setMessages(msgs);
      setMsgLoading(false);
      msgs.filter(m => m.recipient_id === myId && !m.read_at)
          .forEach(m => markAsRead(m.id));
      channelRef.current?.unsubscribe();
      channelRef.current = subscribeToMessages(myId, msg => {
        setMessages(prev => [...prev, msg]);
        markAsRead(msg.id);
      });
    });
    return () => { channelRef.current?.unsubscribe(); };
  }, [myId, refreshKey]);

  useEffect(() => {
    msgBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleConnect() {
    if (!myId || codeConnecting) return;
    setCodeError(null);
    setCodeSuccess(null);
    setCodeConnecting(true);
    const result = await connectByCode(myId, codeInput);
    setCodeConnecting(false);
    if (result.ok) {
      setCodeSuccess(result.message);
      setCodeInput('');
      setTimeout(() => { setRefreshKey(k => k + 1); }, 1200);
    } else {
      setCodeError(result.message);
    }
  }

  async function handleSend() {
    if (!msgText.trim() || !myId || !other || sending) return;
    setSending(true);
    const content = msgText.trim();
    setMsgText('');
    const { data } = await sendMessage(myId, other.id, content);
    setSending(false);
    if (data) setMessages(prev => [...prev, data]);
  }

  return (
    <div className="grandma-home">
      {/* Account button */}
      <button
        onClick={() => setShowAccount(true)}
        aria-label="חשבון"
        style={{
          position: 'fixed', top: 16, left: 16,
          width: 44, height: 44, borderRadius: '50%',
          background: 'var(--terracotta)', color: 'white',
          border: 'none', cursor: 'pointer', zIndex: 50,
          fontSize: 20, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        }}
      >
        <PersonIcon size={20} color="white" />
      </button>

      {showAccount && <AccountSheet onClose={() => setShowAccount(false)} />}

      {/* Greeting */}
      <div className="home-greeting">
        <span className="greeting-icon">
          {hour < 12 ? '🌤️' : hour < 17 ? '☀️' : '🌙'}
        </span>
        <h1>{greeting}, {firstName}</h1>
        <p className="greeting-sub">שמחה שאת כאן ❤️</p>
      </div>

      {/* Today's workout */}
      {todayWorkout ? (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{
            background: todayWorkout.colors.bg,
            border: `2px solid ${todayWorkout.colors.light}`,
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-4)',
          }}>
            <p style={{ fontSize: 'var(--text-sm)', color: todayWorkout.colors.accent, fontWeight: 700, marginBottom: 6 }}>
              האימון שלך להיום ✨
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: todayWorkout.colors.text, marginBottom: 4 }}>
              {todayWorkout.title}
            </h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--mid)', marginBottom: 0 }}>
              {todayWorkout.durationMinutes} דקות · {todayWorkout.category}
            </p>
          </div>
          <button
            className="btn btn-primary btn-xl"
            onClick={startTodayWorkout}
            style={{ borderRadius: 'var(--radius-xl)', fontSize: 'var(--text-2xl)' }}
          >
            התחילי את האימון של היום
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{
            background: 'var(--card-bg)', border: '1.5px solid var(--light)',
            borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)',
            textAlign: 'center', marginBottom: 'var(--space-4)',
          }}>
            <span style={{ fontSize: 56, display: 'block', marginBottom: 'var(--space-4)' }}>🗓️</span>
            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--dark)', marginBottom: 8 }}>
              הנכד/ה עוד לא קבע אימון להיום
            </h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--mid)', lineHeight: 1.6 }}>
              כשנועה תשבץ אימון, הוא יופיע כאן
            </p>
          </div>
        </div>
      )}

      {/* Independent workouts */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <p style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--dark)', marginBottom: 4 }}>
          אני רוצה להתאמן עכשיו
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--mid)', marginBottom: 12 }}>
          אימונים קצרים — בלי תיאום עם הנכד/ה
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {independentWorkouts.map(w => (
            <div key={w.id} style={{
              background: w.colors.bg,
              border: `1.5px solid ${w.colors.light}`,
              borderRadius: 'var(--radius-xl)',
              padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--text-xs)', color: w.colors.accent, fontWeight: 700, marginBottom: 2 }}>
                  {w.category}
                </div>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: w.colors.text }}>
                  {w.title}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--mid)', marginTop: 2 }}>
                  {w.durationMinutes} דקות
                </div>
              </div>
              <button
                onClick={() => { setSelectedWorkout(w.id); navigate('grandma-active-workout'); }}
                style={{
                  background: w.colors.accent, color: 'white',
                  border: 'none', borderRadius: 'var(--radius-lg)',
                  padding: '10px 16px',
                  fontSize: 'var(--text-sm)', fontWeight: 700,
                  fontFamily: 'var(--font-body)', cursor: 'pointer',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                התחילי ›
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary actions */}
      <div className="secondary-actions">
        <button className="action-card" onClick={() => navigate('grandma-progress')} aria-label="מה עשיתי">
          <span className="action-card-icon">⭐</span>
          <div className="action-card-text">
            <div className="action-title">מה עשיתי השבוע</div>
            <div className="action-sub">ראי את ההתקדמות שלך</div>
          </div>
          <span className="action-card-arrow">‹</span>
        </button>
      </div>

      {/* ── Messages section ── */}
      <div style={{
        background: 'white', borderRadius: 'var(--radius-xl)',
        border: '1.5px solid var(--light)',
        padding: '18px 18px 14px',
        marginTop: 'var(--space-6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <p style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <span>💌</span> הודעות {other ? `מ${other.name}` : 'מהנכד/ה'}
          </p>
          {other && (
            <button
              onClick={() => navigate('grandma-messages')}
              style={{
                background: 'none', border: 'none', color: 'var(--terracotta)',
                fontSize: 'var(--text-sm)', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--font-body)', padding: 0, textDecoration: 'underline',
              }}
            >
              פתחי שיחה ›
            </button>
          )}
        </div>

        {msgLoading ? (
          <p style={{ color: 'var(--mid)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: '12px 0' }}>טוענת...</p>
        ) : !other ? (
          <div style={{ padding: '8px 0' }}>
            <p style={{ color: 'var(--mid)', fontSize: 'var(--text-base)', textAlign: 'center', marginBottom: 16, lineHeight: 1.6 }}>
              בקשי מהנכד/ה שלך קוד הזמנה<br />והכניסי אותו כאן
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                value={codeInput}
                onChange={e => setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                placeholder="ABCD12"
                maxLength={6}
                style={{
                  flex: 1, padding: '13px 14px',
                  fontSize: 24, fontWeight: 800, letterSpacing: 6,
                  border: '2px solid var(--light)', borderRadius: 12,
                  fontFamily: 'monospace', textAlign: 'center',
                  background: 'white', color: 'var(--dark)',
                  textTransform: 'uppercase',
                }}
                dir="ltr"
              />
              <button
                onClick={handleConnect}
                disabled={codeInput.length !== 6 || codeConnecting}
                style={{
                  padding: '13px 18px', borderRadius: 12, border: 'none',
                  background: codeInput.length === 6 ? 'var(--terracotta)' : 'var(--light)',
                  color: codeInput.length === 6 ? 'white' : 'var(--mid)',
                  fontSize: 'var(--text-base)', fontWeight: 700,
                  fontFamily: 'var(--font-body)', cursor: codeInput.length === 6 ? 'pointer' : 'default',
                  whiteSpace: 'nowrap', minHeight: 52,
                }}
              >
                {codeConnecting ? '...' : 'התחברי'}
              </button>
            </div>
            {codeError && (
              <p style={{ color: '#C0392B', fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 10, textAlign: 'center' }}>
                {codeError}
              </p>
            )}
            {codeSuccess && (
              <p style={{ color: '#2D7D50', fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 10, textAlign: 'center' }}>
                {codeSuccess}
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Last messages preview */}
            <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
              {messages.length === 0 && (
                <p style={{ color: 'var(--mid)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: '12px 0' }}>
                  עדיין אין הודעות
                </p>
              )}
              {messages.slice(-5).map(msg => {
                const isMine = msg.sender_id === myId;
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-start' : 'flex-end' }}>
                    <div style={{
                      maxWidth: '82%',
                      background: isMine ? 'var(--terracotta)' : '#EEF7EE',
                      borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '11px 16px',
                      fontSize: 'var(--text-lg)',
                      lineHeight: 1.5,
                      color: isMine ? 'white' : 'var(--dark)',
                    }}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={msgBottomRef} />
            </div>

            {/* Quick reply */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={`כתבי הודעה ל${other.name}...`}
                maxLength={300}
                rows={2}
                style={{
                  flex: 1, padding: '12px 14px',
                  border: '1.5px solid var(--light)', borderRadius: 16,
                  fontSize: 'var(--text-lg)', fontFamily: 'var(--font-body)',
                  resize: 'none', lineHeight: 1.5,
                  background: 'var(--cream)', color: 'var(--dark)',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!msgText.trim() || sending}
                style={{
                  width: 54, height: 54, borderRadius: '50%', flexShrink: 0,
                  background: msgText.trim() ? 'var(--terracotta)' : 'var(--light)',
                  border: 'none', cursor: msgText.trim() ? 'pointer' : 'default',
                  fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
                aria-label="שלח"
              >
                {sending ? '⏳' : '➤'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Tip */}
      <div style={{ marginTop: 'var(--space-6)' }}>
        <div className="card" style={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, #F4FAF4, #E8F3E8)',
          border: '1.5px solid var(--sage-light)',
        }}>
          <p style={{ fontSize: 'var(--text-base)' }}>
            אפילו 5 דקות של תנועה עדינה ביום עושות הבדל גדול 💚
          </p>
        </div>
      </div>

      <button
        className="btn btn-ghost"
        onClick={() => navigate('onboarding')}
        style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)' }}
      >
        החלף משתמש
      </button>
    </div>
  );
}
