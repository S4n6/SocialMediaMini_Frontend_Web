'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { responsivePatterns } from '@/lib/responsive';

interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  loadingText?: string;
  successText?: string;
  successDuration?: number;
  children: React.ReactNode;
}

export function AnimatedButton({
  variant = 'default',
  size = 'default',
  isLoading = false,
  loadingText = 'Loading...',
  successText,
  successDuration = 2000,
  className,
  onClick,
  disabled,
  children,
  ...props
}: AnimatedButtonProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (showSuccess && successDuration > 0) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, successDuration);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, successDuration]);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;

    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);

    if (onClick) {
      try {
        await onClick(e);
        if (successText) {
          setShowSuccess(true);
        }
      } catch (error) {
        console.error('Button action failed:', error);
      }
    }
  };

  const buttonContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>{loadingText}</span>
        </div>
      );
    }

    if (showSuccess && successText) {
      return (
        <div className="flex items-center space-x-2">
          <svg
            className="w-4 h-4 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>{successText}</span>
        </div>
      );
    }

    return children;
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        'transition-all duration-200 ease-out',
        'hover:scale-105 active:scale-95',
        'focus-visible:ring-2 focus-visible:ring-primary/50',
        isClicked && 'scale-95',
        showSuccess && 'bg-green-500 hover:bg-green-600 text-white',
        responsivePatterns.interactiveElement,
        className,
      )}
      {...props}
    >
      {buttonContent()}
    </Button>
  );
}

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  clickEffect?: boolean;
  delay?: number;
  onClick?: () => void;
}

export function AnimatedCard({
  children,
  className,
  hoverEffect = true,
  clickEffect = false,
  delay = 0,
  onClick,
}: AnimatedCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const handleClick = () => {
    if (clickEffect) {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 150);
    }
    onClick?.();
  };

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out',
        'transform',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        hoverEffect && 'hover:-translate-y-1 hover:shadow-lg',
        clickEffect && isClicked && 'scale-95',
        onClick && 'cursor-pointer',
        responsivePatterns.mobileCard,
        className,
      )}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}

interface TypingIndicatorProps {
  isTyping: boolean;
  userName?: string;
  className?: string;
}

export function TypingIndicator({
  isTyping,
  userName,
  className,
}: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <div
      className={cn(
        'flex items-center space-x-2 p-3 text-sm text-muted-foreground',
        'animate-fade-in-up transition-all duration-300',
        className,
      )}
    >
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-current rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="w-2 h-2 bg-current rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <div
          className="w-2 h-2 bg-current rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
      <span>
        {userName ? `${userName} is typing...` : 'Someone is typing...'}
      </span>
    </div>
  );
}

interface SlideInListProps {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function SlideInList({
  children,
  className,
  itemClassName,
  staggerDelay = 100,
  direction = 'up',
}: SlideInListProps) {
  const getDirectionClasses = () => {
    switch (direction) {
      case 'up':
        return 'translate-y-4';
      case 'down':
        return '-translate-y-4';
      case 'left':
        return 'translate-x-4';
      case 'right':
        return '-translate-x-4';
      default:
        return 'translate-y-4';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn(
            'transition-all duration-500 ease-out',
            'transform opacity-0',
            getDirectionClasses(),
            'animate-[slide-in-up_0.5s_ease-out_forwards]',
            itemClassName,
          )}
          style={{
            animationDelay: `${index * staggerDelay}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

interface PulseLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export function PulseLoader({
  size = 'md',
  color = 'current',
  className,
}: PulseLoaderProps) {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            sizeClasses[size],
            'rounded-full animate-pulse',
            `bg-${color}`,
          )}
          style={{
            animationDelay: `${index * 200}ms`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
}

interface SlideToggleProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
  direction?: 'vertical' | 'horizontal';
}

export function SlideToggle({
  isOpen,
  children,
  className,
  direction = 'vertical',
}: SlideToggleProps) {
  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out overflow-hidden',
        direction === 'vertical'
          ? isOpen
            ? 'max-h-96 opacity-100'
            : 'max-h-0 opacity-0'
          : isOpen
            ? 'max-w-96 opacity-100'
            : 'max-w-0 opacity-0',
        className,
      )}
    >
      <div
        className={cn(
          'transition-transform duration-300 ease-out',
          isOpen ? 'transform translate-y-0' : 'transform -translate-y-2',
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface FadeTransitionProps {
  show: boolean;
  children: React.ReactNode;
  className?: string;
  duration?: number;
}

export function FadeTransition({
  show,
  children,
  className,
  duration = 300,
}: FadeTransitionProps) {
  return (
    <div
      className={cn(
        'transition-opacity ease-out',
        show ? 'opacity-100' : 'opacity-0',
        className,
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

interface ScaleTransitionProps {
  show: boolean;
  children: React.ReactNode;
  className?: string;
  scale?: number;
}

export function ScaleTransition({
  show,
  children,
  className,
  scale = 0.95,
}: ScaleTransitionProps) {
  return (
    <div
      className={cn(
        'transition-all duration-200 ease-out origin-center',
        show
          ? 'opacity-100 scale-100'
          : `opacity-0 scale-${Math.round(scale * 100)}`,
        className,
      )}
    >
      {children}
    </div>
  );
}
