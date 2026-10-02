import { createClient } from '@supabase/supabase-js';

const rawUrl = (
  import.meta.env.VITE_SUPABASE_URL ||
  'https://oujrevpfdqmnwlklqzpu.supabase.co'
).trim();
const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const rawKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_ikLmoXLibedpjc2sDa6ajg_CLOc1g8z'
).trim();

// Avoid using expired/quota-exceeded demo project
const EXPIRED_PROJECT_ID = 'vlbpolgzrnebajfmlisx';

export const isSupabaseConfigured = Boolean(
  cleanUrl &&
  rawKey &&
  !cleanUrl.includes('YOUR_') &&
  !rawKey.includes('YOUR_') &&
  !cleanUrl.includes(EXPIRED_PROJECT_ID) &&
  cleanUrl.startsWith('http')
);

export const supabase = isSupabaseConfigured
  ? createClient(cleanUrl, rawKey)
  : null;

