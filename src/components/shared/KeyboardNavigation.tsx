'use client';

import React, { useEffect } from 'react';

interface KeyboardNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'Tab':
          // Handle tab navigation within modal
          // Trap focus within modal
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Trap focus within modal
    const modal = document.querySelector('[role="dialog"]');
    if (modal) {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      const trapFocus = (e: Event) => {
        const keyboardEvent = e as KeyboardEvent;
        if (keyboardEvent.key === 'Tab') {
          if (keyboardEvent.shiftKey) {
            if (document.activeElement === firstElement) {
              keyboardEvent.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              keyboardEvent.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      modal.addEventListener('keydown', trapFocus);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        modal.removeEventListener('keydown', trapFocus);
      };
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return <>{children}</>;
};

export default KeyboardNavigation;
