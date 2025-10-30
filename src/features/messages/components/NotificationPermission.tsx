'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationPermissionBannerProps {
  conversationId?: string;
  className?: string;
  onDismiss?: () => void;
}

export function NotificationPermissionBanner({
  conversationId,
  className = '',
  onDismiss,
}: NotificationPermissionBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const { isSupported, permission, requestPermission } = useNotifications({
    conversationId,
  });

  // Show banner if notifications are supported but permission is default
  useEffect(() => {
    const shouldShow = isSupported && permission.default;
    setIsVisible(shouldShow);
  }, [isSupported, permission]);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const result = await requestPermission();
      if (result.granted || result.denied) {
        // Hide banner after permission is decided
        setIsVisible(false);
        onDismiss?.();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`
        relative flex items-center gap-3 p-4 
        bg-blue-50 dark:bg-blue-950/20 
        border border-blue-200 dark:border-blue-800
        rounded-lg shadow-sm
        ${className}
      `}
    >
      <div className="flex-shrink-0">
        <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
          Enable notifications for new messages
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
          Get notified when you receive new messages, even when the app is
          closed.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleRequestPermission}
          disabled={isRequesting}
          className="
            bg-white dark:bg-gray-800 
            border-blue-300 dark:border-blue-600
            text-blue-700 dark:text-blue-300
            hover:bg-blue-50 dark:hover:bg-blue-900/50
            text-xs
          "
        >
          {isRequesting ? 'Requesting...' : 'Enable'}
        </Button>

        <button
          onClick={handleDismiss}
          className="
            p-1 rounded-md text-blue-600 dark:text-blue-400
            hover:bg-blue-100 dark:hover:bg-blue-800/50
            transition-colors
          "
          aria-label="Dismiss notification banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Compact version for mobile or smaller spaces
export function NotificationPermissionButton({
  conversationId,
  className = '',
}: {
  conversationId?: string;
  className?: string;
}) {
  const [isRequesting, setIsRequesting] = useState(false);
  const { isSupported, permission, requestPermission } = useNotifications({
    conversationId,
  });

  // Don't show if not supported or already granted/denied
  if (!isSupported || !permission.default) {
    return null;
  }

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      await requestPermission();
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleRequestPermission}
      disabled={isRequesting}
      className={`
        text-xs text-muted-foreground hover:text-foreground
        h-8 px-2
        ${className}
      `}
    >
      <BellOff className="h-3 w-3 mr-1" />
      {isRequesting ? 'Requesting...' : 'Enable notifications'}
    </Button>
  );
}

// Permission status indicator
export function NotificationStatus({
  conversationId,
  className = '',
}: {
  conversationId?: string;
  className?: string;
}) {
  const { isSupported, permission } = useNotifications({ conversationId });

  if (!isSupported) {
    return null;
  }

  const getStatusIcon = () => {
    if (permission.granted) {
      return <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />;
    }
    if (permission.denied) {
      return <BellOff className="h-4 w-4 text-red-600 dark:text-red-400" />;
    }
    return <Bell className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
  };

  const getStatusText = () => {
    if (permission.granted) return 'Notifications enabled';
    if (permission.denied) return 'Notifications blocked';
    return 'Notifications disabled';
  };

  const getStatusColor = () => {
    if (permission.granted) return 'text-green-700 dark:text-green-300';
    if (permission.denied) return 'text-red-700 dark:text-red-300';
    return 'text-yellow-700 dark:text-yellow-300';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {getStatusIcon()}
      <span className={`text-xs ${getStatusColor()}`}>{getStatusText()}</span>
    </div>
  );
}
