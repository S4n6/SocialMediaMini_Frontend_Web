'use client';

import { cn } from '@/lib/utils/cn-tailwind';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
  className?: string;
}

export function Loading({
  size = 'md',
  variant = 'spinner',
  text,
  className,
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  if (variant === 'spinner') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
            sizeClasses[size],
          )}
        />
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        </div>
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        <div
          className={cn(
            'rounded-full bg-blue-600 animate-pulse',
            sizeClasses[size],
          )}
        />
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  return null;
}

// Full page loading
export function PageLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <Loading size="lg" variant="spinner" />
        <p className="text-lg font-medium">{text}</p>
      </div>
    </div>
  );
}

// Loading overlay for components
export function LoadingOverlay({
  isLoading,
  children,
  loadingText = 'Loading...',
  className = '',
  overlayClassName = '',
}: {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  overlayClassName?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 bg-background/80 backdrop-blur-sm',
            'flex items-center justify-center',
            'transition-opacity duration-200',
            'z-50',
            overlayClassName,
          )}
        >
          <div className="flex flex-col items-center space-y-3">
            <Loading size="lg" />
            <p className="text-sm text-muted-foreground animate-pulse">
              {loadingText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline loading for buttons
export function ButtonLoader({
  isLoading,
  loadingText,
  children,
  className = '',
}: {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {isLoading && <Loading size="sm" />}
      <span>{isLoading && loadingText ? loadingText : children}</span>
    </div>
  );
}

// Progress loader
export function ProgressLoader({
  progress,
  size = 'md',
  color = 'primary',
  showPercentage = true,
  className = '',
}: {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  showPercentage?: boolean;
  className?: string;
}) {
  const sizeClasses = {
    sm: { height: 'h-1', text: 'text-xs' },
    md: { height: 'h-2', text: 'text-sm' },
    lg: { height: 'h-3', text: 'text-base' },
  };

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn('w-full space-y-1', className)}>
      <div
        className={cn(
          'w-full bg-muted rounded-full overflow-hidden',
          sizeClasses[size].height,
        )}
      >
        <div
          className={cn(
            sizeClasses[size].height,
            colorClasses[color],
            'transition-all duration-300 ease-out rounded-full',
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <div
          className={cn(
            'text-center',
            sizeClasses[size].text,
            'text-muted-foreground',
          )}
        >
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
}
