import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string | undefined;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnon) {
  console.error(
    '[Supabase] משתני סביבה חסרים!\n' +
    'צרי קובץ .env.local עם VITE_SUPABASE_URL ו-VITE_SUPABASE_ANON_KEY'
  );
}

// Abort any Supabase HTTP request after 8 seconds so a stale token-refresh
// never holds the GoTrue lock indefinitely.
function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000);
  return fetch(input, { ...init, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

export const SUPABASE_STORAGE_KEY = 'matamnim-yachad-auth';

export const supabase = createClient(
  supabaseUrl  ?? 'https://placeholder.supabase.co',
  supabaseAnon ?? 'placeholder',
  {
    auth: {
      persistSession:     true,
      autoRefreshToken:   true,
      storageKey:         SUPABASE_STORAGE_KEY,
      storage:            window.localStorage,
      detectSessionInUrl: false,
    },
    global: { fetch: fetchWithTimeout },
  }
);

export const supabaseConfigured = !!(supabaseUrl && supabaseAnon);

// ── Profile type (mirrors the Supabase profiles table) ──────────────────────
export interface UserProfile {
  id: string;
  full_name: string;
  role: 'grandma' | 'grandchild';
  phone: string | null;
  email: string | null;
  invite_code: string | null;
  nickname: string | null;
  gender: 'male' | 'female' | null;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}
