// ============================================================
// OraclePath — Service Adapter
// Parent: Ervion Technologies
// Routes data access to real Supabase or mock (preview/staging only).
// This is the ONLY bridge between the mock system and the rest of the app.
// UI components must NEVER import from mockSupabase.ts directly.
// ============================================================

import { supabase } from '../lib/supabase';
import { env } from '../lib/env';
import { createMockClient } from '../lib/mockSupabase';
import type { SupabaseClient } from '@supabase/supabase-js';

// --- Force include mock code in bundle ---
// The mock client is needed for preview builds. This reference prevents
// Vite's tree-shaker from eliminating the module. Runtime safety checks
// below ensure mock is never used in production with credentials.
const _mockFactory = createMockClient;

// The client that services will use. In production with credentials this is always real Supabase.
// In preview/staging builds with VITE_USE_MOCK_DB=true, mock is used.
let _client: SupabaseClient | ReturnType<typeof _mockFactory> | null = null;
let _adapterMode: 'real' | 'mock' | 'dead' = 'dead';

function getAdapterClient() {
  if (_client) return _client;

  if (env.hasSupabaseCredentials) {
    _client = supabase;
    _adapterMode = 'real';
  } else if (import.meta.env.VITE_USE_MOCK_DB === 'true' && !env.hasSupabaseCredentials) {
    // Mock is enabled via VITE_USE_MOCK_DB=true and credentials are incomplete.
    // For production safety, reject mock mode in production builds at runtime.
    if (env.environment === 'production' && !import.meta.env.DEV) {
      _adapterMode = 'dead';
      _client = null;
    } else {
      _client = _mockFactory() as unknown as SupabaseClient;
      _adapterMode = 'mock';
      console.warn('[OraclePath] MOCK MODE ACTIVE — Preview/Staging only. Set VITE_USE_MOCK_DB=false for production.');
    }
  } else {
    _adapterMode = 'dead';
    _client = null;
  }
  return _client;
}

export function getServiceClient(): SupabaseClient {
  const client = getAdapterClient();
  if (!client) {
    throw new Error(
      'Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
      'In preview, set VITE_USE_MOCK_DB=true to enable mock data.'
    );
  }
  return client as SupabaseClient;
}

export function getAdapterMode(): 'real' | 'mock' | 'dead' {
  getAdapterClient(); // ensure initialized
  return _adapterMode;
}

export function isAdapterMock(): boolean {
  return getAdapterMode() === 'mock';
}

export function isAdapterReal(): boolean {
  return getAdapterMode() === 'real';
}

export function isAdapterDead(): boolean {
  return getAdapterMode() === 'dead';
}

/**
 * Low-level query escape hatch for complex queries.
 * UI components must NEVER use this directly.
 * Services may use this for complex multi-table, multi-filter, or IN-clause queries
 * that exceed the standard service method signatures.
 */
export function rawQuery<T>(
  builder: (client: SupabaseClient) => Promise<{ data: T | null; error: { message: string } | null }>
): Promise<{ data: T | null; error: { message: string } | null }> {
  const client = getServiceClient();
  return builder(client);
}

export function resetAdapter(): void {
  _client = null;
  _adapterMode = 'dead';
}
