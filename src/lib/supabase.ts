// ============================================================
// OraclePath — Supabase Client (Production)
// Parent: Ervion Technologies
// REAL Supabase client only. No mock. No fallback.
// Mock routing is handled by src/services/adapter.ts (dev-only, explicit opt-in).
// ============================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

const supabaseUrl = env.supabaseUrl;
const supabaseAnonKey = env.supabaseAnonKey;

export const hasSupabaseCredentials = env.hasSupabaseCredentials;
export const isMockMode = env.isMockEnabled; // true ONLY in dev with explicit opt-in

let client: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  });
}

// In production without credentials, this will be null.
// The service adapter handles this gracefully by throwing a clear error.
// UI components should handle connection errors via the ServiceResult pattern.
export const supabase = client;

/**
 * Check Supabase connection health.
 * Returns the actual connection state from the real Supabase backend.
 */
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  mode: 'real' | 'dead';
  error?: string;
}> {
  if (!supabase) {
    return {
      connected: false,
      mode: 'dead',
      error: 'Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }
  try {
    const { error } = await supabase.auth.getUser();
    if (error) {
      return { connected: false, mode: 'real', error: error.message };
    }
    return { connected: true, mode: 'real' };
  } catch (err) {
    return {
      connected: false,
      mode: 'real',
      error: err instanceof Error ? err.message : 'Unknown connection error',
    };
  }
}

/**
 * Get current Supabase configuration info (safe, no secrets exposed).
 * For admin diagnostics only.
 */
export function getSupabaseConfig(): {
  url: string;
  hasKey: boolean;
  mode: 'real' | 'dead';
  features: string[];
} {
  return {
    url: supabaseUrl ? supabaseUrl.replace(/\/\/[^@]+@/, '//***@') : '',
    hasKey: !!supabaseAnonKey,
    mode: supabase ? 'real' : 'dead',
    features: supabase
      ? ['Real Supabase Auth', 'Supabase PostgREST', 'Supabase Realtime', 'Row Level Security', 'Auto-refresh Token', 'Session Persistence']
      : ['NOT CONNECTED'],
  };
}
