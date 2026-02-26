'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ExploreErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: error.stack || null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Explore Error Boundary caught an error:', error, errorInfo);

    // Log error to monitoring service
    if (typeof window !== 'undefined') {
      // In a real app, send to error monitoring service
      console.error('Error details:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle
                  size={32}
                  className="text-red-600 dark:text-red-400"
                />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                We encountered an error while loading the explore page. This
                might be a temporary issue.
              </p>
            </div>

            {/* Error details (development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-red-800 dark:text-red-200 mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="text-red-700 dark:text-red-300 space-y-2">
                    <div>
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.errorInfo && (
                      <div className="mt-2">
                        <strong>Stack Trace:</strong>
                        <pre className="mt-1 text-xs bg-red-100 dark:bg-red-900/40 p-2 rounded overflow-x-auto">
                          {this.state.errorInfo}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleRetry}
                variant="default"
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Try Again
              </Button>
              <Button
                onClick={this.handleReload}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Reload Page
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <Home size={16} />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useExploreErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error | string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    setError(errorObj);
    console.error('Explore Error:', errorObj);
  }, []);

  React.useEffect(() => {
    if (error) {
      // Log error details
      console.error('Error in explore:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    }
  }, [error]);

  return {
    error,
    hasError: !!error,
    resetError,
    handleError,
  };
};

// Simple error fallback component
export const ExploreErrorFallback: React.FC<{
  error?: Error | null;
  onRetry?: () => void;
  onReset?: () => void;
}> = ({ error, onRetry, onReset }) => {
  return (
    <div className="text-center py-8">
      <div className="inline-flex flex-col items-center gap-4 max-w-sm mx-auto">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
            Failed to load content
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {error?.message || 'An unexpected error occurred'}
          </p>
        </div>
        <div className="flex gap-2">
          {onRetry && (
            <Button size="sm" onClick={onRetry}>
              <RefreshCw size={14} className="mr-2" />
              Retry
            </Button>
          )}
          {onReset && (
            <Button size="sm" variant="outline" onClick={onReset}>
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
