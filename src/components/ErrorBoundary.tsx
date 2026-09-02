import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[OraclePath] Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-xl bg-oracle-red/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-oracle-red text-2xl font-bold">OP</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">OraclePath</h1>
            <p className="text-dark-muted mb-6">Application initialization failed.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-lg bg-oracle-red text-white font-medium hover:bg-oracle-dark transition-colors"
            >
              Retry
            </button>
            {import.meta.env.DEV && this.state.error && (
              <div className="mt-6 p-4 rounded-lg bg-dark-card border border-dark-border text-left">
                <p className="text-red-400 text-sm font-mono">{this.state.error.message}</p>
              </div>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
