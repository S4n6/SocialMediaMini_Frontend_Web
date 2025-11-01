'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

/**
 * Error Boundary for Reels Components
 * Catches JavaScript errors anywhere in the child component tree
 * Instagram 2025 style error handling with user-friendly recovery
 */

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

export class ReelsErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      eventId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Reels Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => prevResetKeys[index] !== key,
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }

    // Reset on any props change if enabled
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  // Report error to monitoring service
  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // In a real app, you would send this to your monitoring service
      // Like Sentry, LogRocket, or Bugsnag
      const errorReport = {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userId: 'anonymous', // Replace with actual user ID
        sessionId: this.state.eventId,
        buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || 'unknown',
      };

      console.log('📊 Error Report:', errorReport);

      // Example: Send to monitoring service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport),
      // });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  // Reset the error boundary
  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  // Auto-retry after a delay
  private scheduleRetry = (delay: number = 3000) => {
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
    }, delay);
  };

  // Copy error details to clipboard
  private copyErrorToClipboard = async () => {
    const { error, errorInfo, eventId } = this.state;

    const errorDetails = {
      eventId,
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(errorDetails, null, 2),
      );
      alert('Error details copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  render() {
    const { hasError, error, eventId } = this.state;
    const { fallback, showErrorDetails = false, children } = this.props;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      // Default error UI - Instagram 2025 style
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-6">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-gray-400 mb-6">
              We encountered an unexpected error while loading your Reels. Don't
              worry, we're working to fix this.
            </p>

            {/* Error Details (Development only) */}
            {showErrorDetails && error && (
              <div className="bg-gray-800 rounded-lg p-4 mb-6 text-left">
                <div className="text-sm font-mono">
                  <div className="text-red-400 font-semibold mb-2">
                    {error.name}: {error.message}
                  </div>
                  {eventId && (
                    <div className="text-gray-500 text-xs mb-2">
                      Event ID: {eventId}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.resetErrorBoundary}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Refresh Page
              </button>

              <button
                onClick={() => this.scheduleRetry(1000)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors text-sm"
              >
                Auto-retry in 3s
              </button>

              {/* Developer Actions */}
              {process.env.NODE_ENV === 'development' && (
                <div className="pt-4 border-t border-gray-700">
                  <button
                    onClick={this.copyErrorToClipboard}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    📋 Copy Error Details
                  </button>
                </div>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-8 text-xs text-gray-500">
              <p>
                If this problem persists, please{' '}
                <a href="/support" className="text-blue-400 hover:underline">
                  contact support
                </a>
                {eventId && ` with error ID: ${eventId}`}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>,
) {
  const WrappedComponent = (props: P) => (
    <ReelsErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ReelsErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook for handling errors in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    console.error('🚨 Error caught by useErrorHandler:', error);
    setError(error);

    // Report error in production
    if (process.env.NODE_ENV === 'production') {
      // Log to monitoring service
      console.log('📊 Reporting error to monitoring service');
    }
  }, []);

  // Throw error to be caught by Error Boundary
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError, error };
}
