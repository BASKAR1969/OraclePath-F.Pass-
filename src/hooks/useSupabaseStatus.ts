import { useState, useEffect, useCallback } from 'react';
import { checkSupabaseConnection, isMockMode, getSupabaseConfig } from '../lib/supabase';

interface SupabaseStatus {
  connected: boolean;
  mode: 'real' | 'mock' | 'dead';
  checking: boolean;
  error?: string;
  config: ReturnType<typeof getSupabaseConfig>;
}

export function useSupabaseStatus(): SupabaseStatus & { recheck: () => void } {
  const [status, setStatus] = useState<SupabaseStatus>({
    connected: isMockMode,
    mode: isMockMode ? 'mock' : 'real',
    checking: !isMockMode,
    config: getSupabaseConfig(),
  });

  const recheck = useCallback(async () => {
    if (isMockMode) {
      setStatus({ connected: true, mode: 'mock', checking: false, config: getSupabaseConfig() });
      return;
    }
    setStatus((prev) => ({ ...prev, checking: true }));
    const result = await checkSupabaseConnection();
    setStatus({
      connected: result.connected,
      mode: result.mode,
      checking: false,
      error: result.error,
      config: getSupabaseConfig(),
    });
  }, []);

  useEffect(() => {
    recheck();
  }, [recheck]);

  return { ...status, recheck };
}
