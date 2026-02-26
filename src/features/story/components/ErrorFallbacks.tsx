'use client';

import React from 'react';
import {
  AlertCircle,
  RefreshCw,
  WifiOff,
  ImageOff,
  Upload,
  Clock,
  Shield,
} from 'lucide-react';

interface BaseErrorFallbackProps {
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

// Generic Error Fallback
export const ErrorFallback: React.FC<
  BaseErrorFallbackProps & {
    title?: string;
    message?: string;
    icon?: React.ReactNode;
  }
> = ({
  title = 'Something went wrong',
  message = 'An error occurred',
  icon,
  onRetry,
  isRetrying = false,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center ${className}`}
      style={{
        backgroundColor: 'var(--color-muted)',
        borderRadius: 'var(--radius)',
        minHeight: '200px',
      }}
    >
      <div style={{ color: 'var(--color-primary)' }} className="mb-4">
        {icon || <AlertCircle className="w-12 h-12" />}
      </div>

      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--color-foreground)' }}
      >
        {title}
      </h3>

      <p
        className="text-sm mb-4 opacity-75 max-w-md"
        style={{ color: 'var(--color-foreground)' }}
      >
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
          }}
        >
          <RefreshCw
            className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`}
          />
          {isRetrying ? 'Retrying...' : 'Try Again'}
        </button>
      )}
    </div>
  );
};

// Network Error Fallback
export const NetworkErrorFallback: React.FC<BaseErrorFallbackProps> = (
  props,
) => {
  return (
    <ErrorFallback
      {...props}
      title="Connection Lost"
      message="Unable to connect to the server. Please check your internet connection and try again."
      icon={<WifiOff className="w-12 h-12" />}
    />
  );
};

// Loading Error Fallback
export const LoadingErrorFallback: React.FC<BaseErrorFallbackProps> = (
  props,
) => {
  return (
    <ErrorFallback
      {...props}
      title="Failed to Load Stories"
      message="We couldn't load the stories right now. This might be a temporary issue."
      icon={<ImageOff className="w-12 h-12" />}
    />
  );
};

// Upload Error Fallback
export const UploadErrorFallback: React.FC<
  BaseErrorFallbackProps & {
    fileName?: string;
  }
> = ({ fileName, ...props }) => {
  return (
    <ErrorFallback
      {...props}
      title="Upload Failed"
      message={
        fileName
          ? `Failed to upload "${fileName}". Please check the file and try again.`
          : 'Failed to upload your story. Please try again with a different file.'
      }
      icon={<Upload className="w-12 h-12" />}
    />
  );
};

// Timeout Error Fallback
export const TimeoutErrorFallback: React.FC<BaseErrorFallbackProps> = (
  props,
) => {
  return (
    <ErrorFallback
      {...props}
      title="Request Timed Out"
      message="The request took too long to complete. Please try again."
      icon={<Clock className="w-12 h-12" />}
    />
  );
};

// Permission Error Fallback
export const PermissionErrorFallback: React.FC<BaseErrorFallbackProps> = (
  props,
) => {
  return (
    <ErrorFallback
      {...props}
      title="Access Denied"
      message="You don't have permission to perform this action. Please check your login status."
      icon={<Shield className="w-12 h-12" />}
    />
  );
};

// Compact Error for inline display
export const CompactErrorFallback: React.FC<
  BaseErrorFallbackProps & {
    message?: string;
  }
> = ({ message = 'Error occurred', onRetry, isRetrying, className = '' }) => {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${className}`}
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center gap-2">
        <AlertCircle
          className="w-4 h-4 flex-shrink-0"
          style={{ color: 'var(--color-primary)' }}
        />
        <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
          {message}
        </span>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors hover:opacity-80 disabled:opacity-50"
          style={{
            color: 'var(--color-primary)',
            backgroundColor: 'transparent',
          }}
        >
          <RefreshCw
            className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`}
          />
          Retry
        </button>
      )}
    </div>
  );
};

// Error type detector and router
export const SmartErrorFallback: React.FC<
  BaseErrorFallbackProps & {
    error?: Error | string;
    compact?: boolean;
  }
> = ({ error, compact = false, ...props }) => {
  const errorMessage = typeof error === 'string' ? error : error?.message || '';

  // Determine error type from message
  const getErrorType = (message: string) => {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('network') ||
      lowerMessage.includes('connection')
    ) {
      return 'network';
    }
    if (lowerMessage.includes('timeout')) {
      return 'timeout';
    }
    if (lowerMessage.includes('upload') || lowerMessage.includes('file')) {
      return 'upload';
    }
    if (
      lowerMessage.includes('permission') ||
      lowerMessage.includes('denied') ||
      lowerMessage.includes('unauthorized')
    ) {
      return 'permission';
    }
    if (lowerMessage.includes('load') || lowerMessage.includes('fetch')) {
      return 'loading';
    }

    return 'generic';
  };

  const errorType = getErrorType(errorMessage);

  if (compact) {
    return <CompactErrorFallback {...props} message={errorMessage} />;
  }

  switch (errorType) {
    case 'network':
      return <NetworkErrorFallback {...props} />;
    case 'timeout':
      return <TimeoutErrorFallback {...props} />;
    case 'upload':
      return <UploadErrorFallback {...props} />;
    case 'permission':
      return <PermissionErrorFallback {...props} />;
    case 'loading':
      return <LoadingErrorFallback {...props} />;
    default:
      return <ErrorFallback {...props} message={errorMessage} />;
  }
};
