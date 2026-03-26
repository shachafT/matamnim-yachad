import { supabase } from './supabase';
import type { Message } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type { Message };

// ── Linked user — single active link per user via family_links ───────────────
export interface LinkedUser {
  id:   string;
  name: string;
}

/**
 * Returns the one linked user for the current user via family_links.
 */
export async function getLinkedUser(
  myId:   string,
  myRole: 'grandma' | 'grandchild',
): Promise<LinkedUser | null> {
  const { data: link, error } = myRole === 'grandchild'
    ? await supabase.from('family_links').select('grandma_id').eq('grandchild_id', myId).maybeSingle()
    : await supabase.from('family_links').select('grandchild_id').eq('grandma_id', myId).maybeSingle();

  if (error) {
    console.warn('[messageService] getLinkedUser error:', error.message);
    return null;
  }

  const linkedId = myRole === 'grandchild'
    ? (link as { grandma_id: string } | null)?.grandma_id ?? null
    : (link as { grandchild_id: string } | null)?.grandchild_id ?? null;

  if (!linkedId) return null;

  const { data: prof } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', linkedId)
    .single();

  if (!prof) return null;
  return { id: prof.id, name: prof.full_name };
}

// ── Core messaging ────────────────────────────────────────────────────────────

/**
 * Send a message. Validates the recipient is the linked user before inserting.
 * If family_links doesn't exist yet, the check is skipped (graceful degradation).
 */
export async function sendMessage(
  senderId:    string,
  recipientId: string,
  content:     string,
): Promise<{ data: Message | null; error: string | null }> {
  // Verify this is a valid linked pair before sending
  try {
    const { data: link } = await supabase
      .from('family_links')
      .select('id')
      .or(
        `and(grandchild_id.eq.${senderId},grandma_id.eq.${recipientId}),` +
        `and(grandma_id.eq.${senderId},grandchild_id.eq.${recipientId})`,
      )
      .maybeSingle();

    if (!link) {
      return { data: null, error: 'לא ניתן לשלוח — אין חיבור פעיל בין המשתמשים' };
    }
  } catch {
    // family_links table not yet set up — allow send (graceful degradation)
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: senderId, recipient_id: recipientId, content: content.trim() })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

/**
 * Load the full conversation between two users, oldest-first.
 * Always filtered to exactly these two users — no cross-conversation leakage.
 */
export async function getMessages(
  userId:  string,
  otherId: string,
): Promise<Message[]> {
  const { data } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${userId},recipient_id.eq.${otherId}),` +
      `and(sender_id.eq.${otherId},recipient_id.eq.${userId})`,
    )
    .order('created_at', { ascending: true });
  return data ?? [];
}

/**
 * Subscribe to new incoming messages for myId.
 * Fires only when someone sends TO myId — not for all messages.
 */
export function subscribeToMessages(
  myId:     string,
  onInsert: (msg: Message) => void,
): RealtimeChannel {
  return supabase
    .channel(`inbox:${myId}`)
    .on(
      'postgres_changes',
      {
        event:  'INSERT',
        schema: 'public',
        table:  'messages',
        filter: `recipient_id=eq.${myId}`,
      },
      payload => onInsert(payload.new as Message),
    )
    .subscribe();
}

export async function markAsRead(messageId: string): Promise<void> {
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId)
    .is('read_at', null);
}
