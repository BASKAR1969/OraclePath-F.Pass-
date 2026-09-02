// ============================================================
// OraclePath — Environment Configuration
// Parent: Ervion Technologies
// Centralized environment detection. No secrets. No defaults.
// ============================================================

declare const import_meta_env: ImportMetaEnv;

export type AppEnvironment = 'development' | 'staging' | 'production' | 'unknown';

export interface EnvConfig {
  environment: AppEnvironment;
  supabaseUrl: string | undefined;
  supabaseAnonKey: string | undefined;
  useMockInDev: boolean;
  hasSupabaseCredentials: boolean;
  isMockEnabled: boolean;
  appVersion: string;
  nodeEnv: string | undefined;
}

function detectEnvironment(): AppEnvironment {
  const nodeEnv = import.meta.env?.MODE;
  if (nodeEnv === 'production') {
    // Detect staging vs production by URL or explicit env
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    if (host.includes('staging') || host.includes('dev') || host.includes('vercel.app')) {
      return 'staging';
    }
    return 'production';
  }
  if (nodeEnv === 'development') return 'development';
  return 'unknown';
}

export const env: EnvConfig = Object.freeze({
  environment: detectEnvironment(),
  supabaseUrl: import.meta.env?.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env?.VITE_SUPABASE_ANON_KEY,
  useMockInDev: import.meta.env?.VITE_USE_MOCK_DB === 'true',
  get hasSupabaseCredentials() {
    return !!this.supabaseUrl && !!this.supabaseAnonKey;
  },
  get isMockEnabled() {
    // Mock is enabled when explicitly opted in and credentials are missing.
    // The calling code (adapter) must decide whether to actually use the mock
    // based on the environment. This getter is kept simple so Vite's tree-shaker
    // can determine at build time whether the mock code path is reachable.
    return this.useMockInDev && !this.hasSupabaseCredentials;
  },
  appVersion: import.meta.env?.VITE_APP_VERSION || '0.0.0',
  nodeEnv: import.meta.env?.MODE,
});

export function isProduction(): boolean {
  return env.environment === 'production';
}

export function isStaging(): boolean {
  return env.environment === 'staging';
}

export function isDevelopment(): boolean {
  return env.environment === 'development';
}

export function isMockAllowed(): boolean {
  return env.isMockEnabled;
}

export function requireSupabaseCredentials(): void {
  if (!env.hasSupabaseCredentials) {
    const msg =
      '[OraclePath] Supabase credentials are required. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
      (isDevelopment()
        ? 'In development, set VITE_USE_MOCK_DB=true to enable mock data.'
        : 'Running in production without Supabase credentials is not supported.');
    throw new Error(msg);
  }
}

export function getPublicEnv(): Omit<EnvConfig, 'supabaseAnonKey'> {
  return {
    environment: env.environment,
    supabaseUrl: env.supabaseUrl,
    useMockInDev: env.useMockInDev,
    hasSupabaseCredentials: env.hasSupabaseCredentials,
    isMockEnabled: env.isMockEnabled,
    appVersion: env.appVersion,
    nodeEnv: env.nodeEnv,
  };
}
