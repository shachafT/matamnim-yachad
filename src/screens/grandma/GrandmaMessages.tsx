import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  sendMessage, getMessages, subscribeToMessages,
  markAsRead, getLinkedUser,
} from '../../lib/messageService';
import type { Message, LinkedUser } from '../../lib/messageService';
import type { RealtimeChannel } from '@supabase/supabase-js';

export default function GrandmaMessages() {
  const { state, navigate } = useApp();
  const { user } = state;

  const [messages, setMessages] = useState<Message[]>([]);
  const [other,    setOther]    = useState<LinkedUser | null>(null);
  const [text,     setText]     = useState('');
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const myId = user?.id;

  useEffect(() => {
    if (!myId) return;

    getLinkedUser(myId, 'grandma').then(async linked => {
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
    if (err) { setError('שגיאה בשליחה — נסי שוב'); setText(content); return; }
    if (data) setMessages(prev => [...prev, data]);
  }

  if (loading) {
    return (
      <div style={fullScreen}>
        <p style={{ color: 'var(--mid)', margin: 'auto', fontSize: 'var(--text-xl)' }}>
          טוענת הודעות...
        </p>
      </div>
    );
  }

  if (!other) {
    return (
      <div style={{ ...fullScreen, justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
        <button onClick={() => navigate('grandma-home')} style={backBtnStyle} aria-label="חזרה">‹ חזרה</button>
        <span style={{ fontSize: 60, display: 'block', margin: '40px auto 20px' }}>🔗</span>
        <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 12 }}>הנכד/ה עוד לא התחבר/ה</h2>
        <p style={{ color: 'var(--mid)', lineHeight: 1.7, fontSize: 'var(--text-lg)', marginBottom: 32 }}>
          כשהנכד/ה יחבר/ה את חשבונך,<br />ההודעות שלהם יופיעו כאן
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate('grandma-home')}
          style={{ fontSize: 'var(--text-xl)' }}
        >
          חזרה לדף הבית
        </button>
      </div>
    );
  }

  return (
    <div style={fullScreen}>
      {/* Header */}
      <div style={headerStyle}>
        <button onClick={() => navigate('grandma-home')} style={backBtnStyle} aria-label="חזרה">
          ‹
        </button>
        <span style={{ fontSize: 30 }}>💌</span>
        <div style={{
          fontSize: 'var(--text-xl)', fontWeight: 800,
          color: 'var(--dark)', fontFamily: 'var(--font-display)',
        }}>
          שיחה עם {other.name}
        </div>
      </div>

      {/* Messages list */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 16px 12px',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {messages.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--mid)' }}>
            <span style={{ fontSize: 52, display: 'block', marginBottom: 14 }}>✉️</span>
            <span style={{ fontSize: 'var(--text-lg)' }}>עדיין אין הודעות</span>
          </div>
        )}

        {messages.map(msg => {
          const isMine = msg.sender_id === myId;
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-start' : 'flex-end' }}>
              <div style={{
                maxWidth: '80%',
                background: isMine ? 'var(--terracotta)' : 'white',
                color: isMine ? 'white' : 'var(--dark)',
                borderRadius: isMine ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                padding: '14px 20px',
                fontSize: 'var(--text-xl)',
                lineHeight: 1.6,
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              }}>
                {msg.content}
                <div style={{
                  fontSize: 11, marginTop: 6, opacity: 0.6,
                  direction: 'ltr', textAlign: isMine ? 'left' : 'right',
                }}>
                  {fmtTime(msg.created_at)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div style={{
          padding: '6px 20px', flexShrink: 0,
          color: '#C0392B', fontSize: 'var(--text-base)', textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      {/* Input — large for elderly */}
      <div style={inputBarStyle}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={`כתבי הודעה ל${other.name}...`}
          maxLength={300}
          rows={2}
          style={{
            flex: 1, padding: '14px 16px',
            border: '2px solid var(--light)', borderRadius: 22,
            fontSize: 'var(--text-xl)', fontFamily: 'var(--font-body)',
            resize: 'none', outline: 'none', lineHeight: 1.5,
            background: 'white', color: 'var(--dark)',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          aria-label="שלח"
          style={{
            width: 62, height: 62, borderRadius: '50%', flexShrink: 0,
            background: text.trim() ? 'var(--terracotta)' : 'var(--light)',
            border: 'none', cursor: text.trim() ? 'pointer' : 'default',
            fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
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
  background: 'white', padding: '16px 20px',
  borderBottom: '2px solid var(--light)',
  display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
};
const backBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 28, color: 'var(--mid)', padding: '4px 8px',
  lineHeight: 1, fontFamily: 'var(--font-body)', fontWeight: 700,
};
const inputBarStyle: React.CSSProperties = {
  background: 'white', padding: '14px 16px',
  borderTop: '2px solid var(--light)',
  display: 'flex', gap: 12, alignItems: 'flex-end', flexShrink: 0,
  paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
};
