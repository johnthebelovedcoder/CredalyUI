'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-credaly-bg flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-credaly-s1 rounded-xl border border-border/30 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-credaly-danger/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-credaly-danger" />
            </div>
            <h2 className="text-xl font-bold text-credaly-text mb-2">Something went wrong</h2>
            <p className="text-sm text-credaly-muted mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <pre className="text-xs text-left bg-credaly-s2 rounded-md p-4 mb-4 overflow-auto max-h-40 text-credaly-danger font-mono">
                {this.state.error.message}
              </pre>
            )}
            <Button
              onClick={() => window.location.reload()}
              className="bg-credaly-amber text-credaly-bg hover:opacity-90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
