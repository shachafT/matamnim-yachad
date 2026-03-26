import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  sendMessage, getMessages, subscribeToMessages,
  markAsRead, getLinkedUser,
} from '../../lib/messageService';
import type { Message, LinkedUser } from '../../lib/messageService';
import type { RealtimeChannel } from '@supabase/supabase-js';

const TEMPLATES = [
  'סבתא, אני כל כך גאה בך! 🌟',
  'חשבתי עלייך היום ❤️',
  'את המגיבורית שלי! 💪',
  'כבר מתגעגע/ת 🤗',
];

export default function SendMessage() {
  const { state, navigate } = useApp();
  const { user, grandmaProfile } = state;

  const [messages,  setMessages]  = useState<Message[]>([]);
  const [text,      setText]      = useState('');
  const [other,     setOther]     = useState<LinkedUser | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const myId = user?.id;

  useEffect(() => {
    if (!myId) return;

    getLinkedUser(myId, 'grandchild').then(async linked => {
      setOther(linked);
      if (!linked) { setLoading(false); return; }

      const msgs = await getMessages(myId, linked.id);
      setMessages(msgs);
      setLoading(false);
      msgs.filter(m => m.recipient_id === myId && !m.read_at)
          .forEach(m => markAsRead(m.id));

      channelRef.current = subscribeToMessages(myId, msg => {
        setMessages(prev => [...prev, msg]);
        markAsRead(msg.id);
      });
    });

    return () => { channelRef.current?.unsubscribe(); };
  }, [myId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!text.trim() || !myId || !other || sending) return;
    setSending(true);
    setError(null);
    const content = text.trim();
    setText('');
    const { data, error: err } = await sendMessage(myId, other.id, content);
    setSending(false);
    if (err) { setError('שגיאה בשליחה — נסה שוב'); setText(content); return; }
    if (data) setMessages(prev => [...prev, data]);
  }

  const grandmaName = other?.name ?? grandmaProfile.name ?? 'הסבתא';

  if (loading) {
    return (
      <div style={fullScreen}>
        <p style={{ color: 'var(--mid)', margin: 'auto' }}>טוען הודעות...</p>
      </div>
    );
  }

  if (!other) {
    return (
      <div className="screen" style={{ textAlign: 'center', padding: '40px 24px', direction: 'rtl' }}>
        <button className="back-btn" onClick={() => navigate('grandchild-home')} style={{ display: 'block', marginBottom: 32 }}>‹ חזרה</button>
        <span style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>🔗</span>
        <h2>עדיין לא חיברת את הסבתא</h2>
        <p style={{ color: 'var(--mid)', marginBottom: 24, lineHeight: 1.6 }}>
          לחץ/י על כפתור החשבון בדף הבית, ותחת "שלח קישור כניסה לסבתא" הזן/י את האימייל שלה.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('grandchild-home')}>
          חזרה לדף הבית
        </button>
      </div>
    );
  }

  return (
    <div style={fullScreen}>
      {/* Header */}
      <div style={headerStyle}>
        <button
          onClick={() => navigate('grandchild-home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: 'var(--mid)', padding: '4px 8px', lineHeight: 1 }}
          aria-label="חזרה"
        >
          ‹
        </button>
        <span style={{ fontSize: 26 }}>💌</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--dark)', fontFamily: 'var(--font-display)' }}>
            שיחה עם {grandmaName}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--mid)' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>✉️</span>
            <span style={{ fontSize: 'var(--text-sm)' }}>שלח/י את ההודעה הראשונה לסבתא!</span>
          </div>
        )}
        {messages.map(msg => {
          const isMine = msg.sender_id === myId;
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-start' : 'flex-end' }}>
              <div style={{
                maxWidth: '78%',
                background: isMine ? 'var(--terracotta)' : 'white',
                color: isMine ? 'white' : 'var(--dark)',
                borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '11px 16px', fontSize: 'var(--text-base)', lineHeight: 1.5,
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              }}>
                {msg.content}
                <div style={{ fontSize: 10, marginTop: 4, opacity: 0.65, direction: 'ltr', textAlign: isMine ? 'left' : 'right' }}>
                  {fmtTime(msg.created_at)}{isMine && msg.read_at && ' ✓✓'}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Quick templates (shown when input is empty) */}
      {text.length === 0 && (
        <div style={{ padding: '8px 14px', display: 'flex', gap: 8, overflowX: 'auto', flexShrink: 0 }}>
          {TEMPLATES.map((t, i) => (
            <button key={i} onClick={() => setText(t)} style={templateBtnStyle}>
              {t}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div style={{ padding: '4px 16px', color: '#C0392B', fontSize: 'var(--text-xs)', textAlign: 'center', flexShrink: 0 }}>
          {error}
        </div>
      )}

      {/* Input bar */}
      <div style={inputBarStyle}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="כתוב/י הודעה לסבתא..."
          maxLength={300}
          rows={1}
          style={textareaStyle}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={{
            width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
            background: text.trim() ? 'var(--terracotta)' : 'var(--light)',
            border: 'none', cursor: text.trim() ? 'pointer' : 'default',
            fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          aria-label="שלח"
        >
          {sending ? '⏳' : '➤'}
        </button>
      </div>
    </div>
  );
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

const fullScreen: React.CSSProperties = {
  display: 'flex', flexDirection: 'column',
  height: '100vh', background: 'var(--cream)', direction: 'rtl',
};
const headerStyle: React.CSSProperties = {
  background: 'white', padding: '12px 16px',
  borderBottom: '1px solid var(--light)',
  display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
};
const inputBarStyle: React.CSSProperties = {
  background: 'white', padding: '10px 14px',
  borderTop: '1px solid var(--light)',
  display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0,
  paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
};
const textareaStyle: React.CSSProperties = {
  flex: 1, padding: '11px 14px',
  border: '1.5px solid var(--light)', borderRadius: 22,
  fontSize: 'var(--text-base)', fontFamily: 'var(--font-body)',
  resize: 'none', outline: 'none', lineHeight: 1.4,
  background: 'white', color: 'var(--dark)',
  maxHeight: 100, overflowY: 'auto',
};
const templateBtnStyle: React.CSSProperties = {
  flexShrink: 0, padding: '8px 14px',
  background: 'white', border: '1.5px solid var(--light)',
  borderRadius: 20, fontSize: 'var(--text-xs)',
  cursor: 'pointer', color: 'var(--dark)',
  fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
};
