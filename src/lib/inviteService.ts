import { supabase } from './supabase';

// Unambiguous chars: no 0/O, 1/I/l
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

/**
 * Returns the grandchild's existing invite code, or generates + saves a new one.
 */
export async function getOrCreateInviteCode(userId: string): Promise<string | null> {
  // Try to get existing code first
  const { data: existing } = await supabase
    .from('profiles')
    .select('invite_code')
    .eq('id', userId)
    .single();

  if (existing?.invite_code) return existing.invite_code;

  // Generate a unique code (retry up to 5 times on collision)
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const { data: updated, error } = await supabase
      .from('profiles')
      .update({ invite_code: code })
      .eq('id', userId)
      .select('invite_code')
      .single();

    if (error) {
      console.error('[inviteService] update error:', error.message, error.code);
      // 23505 = unique constraint violation → try a different code
      if (error.code === '23505') continue;
      return null;
    }
    if (updated?.invite_code === code) return code;
    // zero rows updated (silent RLS block) — log and bail
    console.error('[inviteService] update returned 0 rows — likely missing RLS UPDATE policy on profiles');
    return null;
  }

  return null;
}

/**
 * Grandma enters the code → finds grandchild → creates family_links row.
 * Returns { ok, message } in Hebrew.
 */
export async function connectByCode(
  grandmaId: string,
  rawCode: string,
): Promise<{ ok: boolean; message: string }> {
  const code = rawCode.trim().toUpperCase();

  if (code.length !== 6) {
    return { ok: false, message: 'הקוד חייב להכיל 6 תווים' };
  }

  // Find grandchild via secure RPC (SECURITY DEFINER — bypasses RLS without opening broad SELECT)
  const { data: rows, error: findErr } = await supabase
    .rpc('find_grandchild_by_invite_code', { input_code: code });

  if (findErr) return { ok: false, message: 'שגיאה בחיפוש הקוד — נסי שוב' };
  const grandchildId: string | null = rows?.[0]?.grandchild_id ?? null;
  if (!grandchildId) return { ok: false, message: 'קוד לא נמצא — בדקי שהקוד נכון' };
  if (grandchildId === grandmaId) return { ok: false, message: 'לא ניתן להתחבר לעצמך' };

  // Check if already linked
  const { data: existing } = await supabase
    .from('family_links')
    .select('id')
    .eq('grandma_id', grandmaId)
    .maybeSingle();

  if (existing) {
    return { ok: false, message: 'כבר מחוברת לנכד/נכדה אחרת' };
  }

  // Create the family link
  const { error: linkErr } = await supabase
    .from('family_links')
    .insert({ grandchild_id: grandchildId, grandma_id: grandmaId });

  if (linkErr) {
    if (linkErr.code === '23505') {
      return { ok: false, message: 'החיבור כבר קיים' };
    }
    return { ok: false, message: 'שגיאה ביצירת החיבור — נסי שוב' };
  }

  return { ok: true, message: '✓ מחוברת בהצלחה! כעת תוכלי לתקשר עם הנכד/ה' };
}
