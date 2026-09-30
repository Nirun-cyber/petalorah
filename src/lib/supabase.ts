import { createClient } from '@supabase/supabase-js';

// Retrieve credentials strictly from environment variables without expired fallbacks
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Avoid using expired/quota-exceeded demo project
const EXPIRED_PROJECT_ID = 'vlbpolgzrnebajfmlisx';

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  !rawUrl.includes('YOUR_') &&
  !rawKey.includes('YOUR_') &&
  !rawUrl.includes(EXPIRED_PROJECT_ID) &&
  rawUrl.startsWith('http')
);

export const supabase = isSupabaseConfigured
  ? createClient(rawUrl, rawKey)
  : null;

