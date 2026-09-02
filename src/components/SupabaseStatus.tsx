import { useSupabaseStatus } from '../hooks/useSupabaseStatus';
import { Wifi, WifiOff, Database, RefreshCw, Shield, Server } from 'lucide-react';
import { useState } from 'react';

export default function SupabaseStatus() {
  const { connected, mode, checking, error, config, recheck } = useSupabaseStatus();
  const [expanded, setExpanded] = useState(false);

  if (checking) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Checking Supabase connection...
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
          connected
            ? mode === 'real'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}
      >
        {connected ? (
          <Wifi className="w-4 h-4" />
        ) : (
          <WifiOff className="w-4 h-4" />
        )}
        <span className="font-medium">
          {connected
            ? mode === 'real'
              ? 'Supabase Connected'
              : 'Mock Mode Active'
            : 'Connection Error'}
        </span>
        {mode === 'real' && connected && <Shield className="w-3.5 h-3.5 ml-1" />}
      </button>

      {expanded && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-dark-card border border-dark-border rounded-xl shadow-xl p-4 z-50">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-oracle-red" />
              <span className="text-white font-medium text-sm">Connection Status</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-muted">Mode</span>
                <span className={`font-medium ${mode === 'real' ? 'text-green-400' : mode === 'dead' ? 'text-red-400' : 'text-blue-400'}`}>
                  {mode === 'real' ? 'Production' : mode === 'dead' ? 'Connection Failed' : 'Development Mock'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-muted">Status</span>
                <span className={`font-medium ${connected ? 'text-green-400' : 'text-red-400'}`}>
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {config.url && (
                <div className="flex justify-between">
                  <span className="text-dark-muted">Endpoint</span>
                  <span className="text-white font-mono text-xs">{config.url}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <div className="pt-2 border-t border-dark-border">
              <p className="text-dark-muted text-xs mb-2">Active Features:</p>
              <div className="flex flex-wrap gap-1.5">
                {config.features.map((feature) => (
                  <span key={feature} className="px-2 py-1 rounded-md bg-dark-surface border border-dark-border text-xs text-dark-muted">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {(mode === 'real' || mode === 'dead') && (
              <button
                onClick={recheck}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-sm text-dark-muted hover:text-white hover:border-oracle-red/30 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Recheck Connection
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
