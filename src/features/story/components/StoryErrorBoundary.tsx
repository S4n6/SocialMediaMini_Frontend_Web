'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { STORY_CONSTANTS } from '../constants';

interface StoryErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  isRetrying: boolean;
}

interface StoryErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

export class StoryErrorBoundary extends Component<
  StoryErrorBoundaryProps,
  StoryErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: StoryErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<StoryErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log error for development
    if (process.env.NODE_ENV === 'development') {
      console.group('🔴 Story Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    this.setState({ isRetrying: true });

    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false,
      });
    }, 1000);
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.handleRetry);
      }

      // Default error UI with theme colors
      return (
        <div
          className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed"
          style={{
            backgroundColor: 'var(--color-muted)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-foreground)',
            minHeight: '200px',
          }}
        >
          <div className="text-center max-w-md">
            <AlertTriangle
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: 'var(--color-primary)' }}
            />

            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: 'var(--color-foreground)' }}
            >
              Something went wrong with stories
            </h3>

            <p
              className="text-sm mb-6 opacity-75"
              style={{ color: 'var(--color-foreground)' }}
            >
              {this.state.error?.message ||
                'An unexpected error occurred while loading stories.'}
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                disabled={this.state.isRetrying}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                }}
              >
                <RefreshCw
                  className={`w-4 h-4 ${this.state.isRetrying ? 'animate-spin' : ''}`}
                />
                {this.state.isRetrying ? 'Retrying...' : 'Try Again'}
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-all duration-300 hover:scale-105"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-foreground)',
                  backgroundColor: 'var(--color-background)',
                }}
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            {/* Show error details in development */}
            {this.props.showDetails &&
              process.env.NODE_ENV === 'development' && (
                <details className="mt-6 text-left">
                  <summary
                    className="cursor-pointer text-sm font-medium mb-2"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Error Details (Development)
                  </summary>
                  <pre
                    className="text-xs p-3 rounded border overflow-auto max-h-40"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-foreground)',
                    }}
                  >
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
