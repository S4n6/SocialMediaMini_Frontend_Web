'use client';

import React, { useEffect, useRef, useCallback } from 'react';

/**
 * Accessibility Utilities for Reels Feature
 * WCAG 2.1 AA compliance for Instagram 2025 Reels
 */

// Keyboard navigation hook
export const useKeyboardNavigation = (
  onArrowUp?: () => void,
  onArrowDown?: () => void,
  onSpace?: () => void,
  onEnter?: () => void,
  onEscape?: () => void,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for handled keys
      const handledKeys = ['ArrowUp', 'ArrowDown', 'Space', 'Enter', 'Escape'];
      
      if (handledKeys.includes(event.code)) {
        event.preventDefault();
      }

      switch (event.code) {
        case 'ArrowUp':
          onArrowUp?.();
          break;
        case 'ArrowDown':
          onArrowDown?.();
          break;
        case 'Space':
          onSpace?.();
          break;
        case 'Enter':
          onEnter?.();
          break;
        case 'Escape':
          onEscape?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onArrowUp, onArrowDown, onSpace, onEnter, onEscape, enabled]);
};

// Focus management hook
export const useFocusManagement = () => {
  const focusableElementsSelector = 
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(focusableElementsSelector);
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Focus first element
    firstFocusable?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  const restoreFocus = useCallback((element: HTMLElement | null) => {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }, []);

  return { trapFocus, restoreFocus };
};

// Screen reader announcements hook
export const useScreenReader = () => {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  const announceVideoChange = useCallback((videoDescription: string, username: string) => {
    announce(`Now playing: ${videoDescription} by ${username}`, 'polite');
  }, [announce]);

  const announceAction = useCallback((action: string, result?: string) => {
    const message = result ? `${action}. ${result}` : action;
    announce(message, 'assertive');
  }, [announce]);

  return { announce, announceVideoChange, announceAction };
};

// Reduced motion detection hook
export const useReducedMotion = () => {
  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return prefersReducedMotion;
};

// High contrast detection hook
export const useHighContrast = () => {
  const prefersHighContrast = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-contrast: high)').matches;

  return prefersHighContrast;
};

// WCAG color contrast utilities
export const getContrastRatio = (color1: string, color2: string): number => {
  // Simplified contrast ratio calculation
  // In production, use a proper color library
  const getLuminance = (color: string): number => {
    // Basic luminance calculation - replace with proper implementation
    return 0.5; // Placeholder
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

export const meetsWCAGAA = (foreground: string, background: string): boolean => {
  return getContrastRatio(foreground, background) >= 4.5;
};

export const meetsWCAGAAA = (foreground: string, background: string): boolean => {
  return getContrastRatio(foreground, background) >= 7;
};

// Accessible video player controls
export const useAccessibleVideoControls = (videoElement: HTMLVideoElement | null) => {
  const { announce } = useScreenReader();

  const handlePlay = useCallback(() => {
    if (videoElement) {
      videoElement.play();
      announce('Video playing');
    }
  }, [videoElement, announce]);

  const handlePause = useCallback(() => {
    if (videoElement) {
      videoElement.pause();
      announce('Video paused');
    }
  }, [videoElement, announce]);

  const handleSeek = useCallback((time: number) => {
    if (videoElement) {
      videoElement.currentTime = time;
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      announce(`Seeked to ${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
  }, [videoElement, announce]);

  const handleVolumeChange = useCallback((volume: number) => {
    if (videoElement) {
      videoElement.volume = volume;
      const percentage = Math.round(volume * 100);
      announce(`Volume ${percentage}%`);
    }
  }, [videoElement, announce]);

  return {
    handlePlay,
    handlePause,
    handleSeek,
    handleVolumeChange,
  };
};

// Skip links component
export const SkipLinks: React.FC = () => (
  <div className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50">
    <a
      href="#main-content"
      className="bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
    >
      Skip to main content
    </a>
    <a
      href="#video-controls"
      className="bg-blue-600 text-white px-4 py-2 rounded ml-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
    >
      Skip to video controls
    </a>
  </div>
);

// Screen reader only text component
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <span className={`sr-only ${className}`}>
    {children}
  </span>
);

// Accessible button with proper ARIA attributes
export const AccessibleButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel?: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
  disabled?: boolean;
  className?: string;
}> = ({ 
  children, 
  onClick, 
  ariaLabel, 
  ariaPressed, 
  ariaExpanded, 
  disabled = false,
  className = '' 
}) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    aria-pressed={ariaPressed}
    aria-expanded={ariaExpanded}
    disabled={disabled}
    className={`focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 ${className}`}
  >
    {children}
  </button>
);

// Accessible live region for dynamic content
export const LiveRegion: React.FC<{
  children: React.ReactNode;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
  className?: string;
}> = ({ 
  children, 
  priority = 'polite', 
  atomic = true,
  className = '' 
}) => (
  <div
    aria-live={priority}
    aria-atomic={atomic}
    className={`sr-only ${className}`}
  >
    {children}
  </div>
);

// Focus indicator styles
export const focusStyles = {
  default: 'focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2',
  inset: 'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-300',
  visible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300',
  high_contrast: 'focus:outline-2 focus:outline-white focus:outline-offset-2',
};

// Utility function to get appropriate focus styles based on user preferences
export const getFocusStyles = (highContrast?: boolean): string => {
  return highContrast ? focusStyles.high_contrast : focusStyles.default;
};

// Text alternatives for common UI elements
export const textAlternatives = {
  like: 'Like this video',
  liked: 'Unlike this video',
  comment: 'Comment on this video',
  share: 'Share this video',
  save: 'Save this video',
  saved: 'Remove from saved',
  follow: 'Follow this user',
  following: 'Unfollow this user',
  play: 'Play video',
  pause: 'Pause video',
  mute: 'Mute video',
  unmute: 'Unmute video',
  fullscreen: 'Enter fullscreen',
  exitFullscreen: 'Exit fullscreen',
  previousVideo: 'Go to previous video',
  nextVideo: 'Go to next video',
  openComments: 'Open comments',
  closeComments: 'Close comments',
  openProfile: 'View user profile',
  closeModal: 'Close modal',
};

// Accessibility testing utilities (development only)
export const a11yUtils = {
  // Check if element has accessible name
  hasAccessibleName: (element: HTMLElement): boolean => {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim()
    );
  },

  // Check if interactive element has focus indicator
  hasFocusIndicator: (element: HTMLElement): boolean => {
    const styles = getComputedStyle(element);
    return !!(
      styles.outline !== 'none' ||
      styles.boxShadow.includes('ring') ||
      styles.border !== 'none'
    );
  },

  // Log accessibility issues (development only)
  auditElement: (element: HTMLElement): string[] => {
    const issues: string[] = [];

    if (element.tagName === 'BUTTON' && !a11yUtils.hasAccessibleName(element)) {
      issues.push('Button missing accessible name');
    }

    if (element.hasAttribute('tabindex') && element.getAttribute('tabindex') === '-1') {
      issues.push('Element removed from tab order');
    }

    return issues;
  },
};