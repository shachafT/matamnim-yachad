import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import AccountSheet from '../../components/AccountSheet';
import { PersonIcon } from '../../components/icons';
import {
  sendMessage, getMessages, subscribeToMessages,
  markAsRead, getLinkedUser,
} from '../../lib/messageService';
import { getOrCreateInviteCode } from '../../lib/inviteService';
import type { Message, LinkedUser } from '../../lib/messageService';
import type { RealtimeChannel } from '@supabase/supabase-js';

export default function GrandchildHome() {
  const { state, navigate } = useApp();
  const { user } = state;
  const [showAccount, setShowAccount] = useState(false);

  // ── Messages ──────────────────────────────────────────────────────────────
  const [messages,    setMessages]    = useState<Message[]>([]);
  const [msgText,     setMsgText]     = useState('');
  const [other,       setOther]       = useState<LinkedUser | null>(null);
  const [msgLoading,  setMsgLoading]  = useState(true);
  const [sending,     setSending]     = useState(false);
  const [inviteCode,  setInviteCode]  = useState<string | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeCopied,  setCodeCopied]  = useState(false);
  const msgBottomRef = useRef<HTMLDivElement>(null);
  const channelRef   = useRef<RealtimeChannel | null>(null);
  const myId = user?.id;

  useEffect(() => {
    if (!myId) return;
    getLinkedUser(myId, 'grandchild').then(async linked => {
      setOther(linked);
      if (!linked) { setMsgLoading(false); return; }
      const msgs = await getMessages(myId, linked.id);
      setMessages(msgs);
      setMsgLoading(false);
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
    msgBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleGetCode() {
    if (!myId || codeLoading) return;
    setCodeLoading(true);
    const code = await getOrCreateInviteCode(myId);
    setInviteCode(code);
    setCodeLoading(false);
  }

  function handleCopyCode() {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
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
    <div className="grandchild-area screen">
      {/* Account button */}
      <button
        onClick={() => setShowAccount(true)}
        aria-label="חשבון"
        style={{
          position: 'fixed', top: 16, left: 16,
          width: 44, height: 44, borderRadius: '50%',
          background: 'var(--sage)', color: 'white',
          border: 'none', cursor: 'pointer', zIndex: 50,
          fontSize: 20, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        }}
      >
        <PersonIcon size={20} color="white" />
      </button>

      {showAccount && <AccountSheet onClose={() => setShowAccount(false)} />}

      <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
        <span style={{ fontSize: 64, display: 'block', marginBottom: 'var(--space-4)' }}>🎁</span>
        <h1 style={{ color: 'var(--terracotta)' }}>מתנה לסבתא</h1>
        <p style={{ fontSize: 'var(--text-lg)', color: 'var(--mid)' }}>
          תן/תני לסבתא שלך מתנה שתעזור לה לזוז,<br />
          להרגיש טוב ולהישאר קרובה אלייך
        </p>
      </div>

      {/* ── Messages section ── */}
      <div style={{
        background: 'white', borderRadius: 'var(--radius-xl)',
        border: '1.5px solid var(--light)',
        padding: '18px 18px 14px',
        marginBottom: 'var(--space-6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <p style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <span>💌</span> שיחה עם סבתא
          </p>
          {other && (
            <button
              onClick={() => navigate('grandchild-send-message')}
              style={{
                background: 'none', border: 'none', color: 'var(--terracotta)',
                fontSize: 'var(--text-xs)', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--font-body)', padding: 0, textDecoration: 'underline',
              }}
            >
              כל השיחה ›
            </button>
          )}
        </div>

        {msgLoading ? (
          <p style={{ color: 'var(--mid)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: '12px 0' }}>טוען...</p>
        ) : !other ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <p style={{ color: 'var(--mid)', fontSize: 'var(--text-sm)', marginBottom: 14, lineHeight: 1.6 }}>
              שתף/י את הקוד הזה עם הסבתא שלך<br />כדי להתחבר אליה
            </p>
            {!inviteCode ? (
              <button
                onClick={handleGetCode}
                disabled={codeLoading}
                style={{
                  background: 'var(--terracotta)', color: 'white',
                  border: 'none', borderRadius: 12, padding: '12px 24px',
                  fontSize: 'var(--text-base)', fontWeight: 700,
                  fontFamily: 'var(--font-body)', cursor: 'pointer',
                }}
              >
                {codeLoading ? 'יוצר קוד...' : '🔗 צור קוד הזמנה'}
              </button>
            ) : (
              <div>
                <div style={{
                  fontSize: 36, fontWeight: 900, letterSpacing: 8,
                  color: 'var(--terracotta)', fontFamily: 'monospace',
                  background: 'var(--light-bg)', borderRadius: 14,
                  padding: '16px 20px', marginBottom: 12,
                  border: '2px dashed var(--light)',
                  display: 'inline-block',
                }}>
                  {inviteCode}
                </div>
                <br />
                <button
                  onClick={handleCopyCode}
                  style={{
                    background: codeCopied ? '#E8F8EE' : 'var(--light-bg)',
                    color: codeCopied ? '#2D7D50' : 'var(--dark)',
                    border: `1.5px solid ${codeCopied ? '#A8E6C8' : 'var(--light)'}`,
                    borderRadius: 10, padding: '9px 18px',
                    fontSize: 'var(--text-sm)', fontWeight: 700,
                    fontFamily: 'var(--font-body)', cursor: 'pointer',
                  }}
                >
                  {codeCopied ? '✓ הועתק!' : '📋 העתק קוד'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Last messages (compact — up to 4) */}
            <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {messages.length === 0 && (
                <p style={{ color: 'var(--mid)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: '8px 0' }}>
                  שלח/י את ההודעה הראשונה לסבתא!
                </p>
              )}
              {messages.slice(-4).map(msg => {
                const isMine = msg.sender_id === myId;
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-start' : 'flex-end' }}>
                    <div style={{
                      maxWidth: '80%',
                      background: isMine ? 'var(--terracotta)' : '#EEF7EE',
                      borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      padding: '9px 14px',
                      fontSize: 'var(--text-sm)',
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

            {/* Quick send */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="כתוב/י הודעה לסבתא..."
                maxLength={300}
                rows={2}
                style={{
                  flex: 1, padding: '10px 12px',
                  border: '1.5px solid var(--light)', borderRadius: 14,
                  fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)',
                  resize: 'none', lineHeight: 1.4,
                  background: 'var(--cream)', color: 'var(--dark)',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!msgText.trim() || sending}
                style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: msgText.trim() ? 'var(--terracotta)' : 'var(--light)',
                  border: 'none', cursor: msgText.trim() ? 'pointer' : 'default',
                  fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
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

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <button
          className="btn btn-primary btn-xl"
          onClick={() => navigate('grandchild-create-profile')}
        >
          ✨ הגדר/י את האפליקציה לסבתא
        </button>

        <button
          className="btn btn-primary btn-xl"
          onClick={() => navigate('grandchild-weekly-plan')}
          style={{ background: 'var(--sage)' }}
        >
          📅 תכנני אימונים לסבתא
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => navigate('grandchild-dashboard')}
        >
          📊 ראה/י את הפעילות של סבתא
        </button>
      </div>

      <div className="card card-warm" style={{ marginTop: 'var(--space-8)' }}>
        <p style={{ textAlign: 'center', fontSize: 'var(--text-lg)', lineHeight: 1.6 }}>
          "הדרך הכי יפה לאהוב מישהו היא לעזור לו להרגיש חיוני ונאהב" 💛
        </p>
      </div>

      <button
        className="btn btn-ghost"
        onClick={() => navigate('onboarding')}
        style={{ marginTop: 'var(--space-6)' }}
      >
        חזרה
      </button>
    </div>
  );
}
