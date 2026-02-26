'use client';

// Error logging and monitoring utilities for story feature

export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  context?: string;
  error?: Error;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  stack?: string;
  metadata?: Record<string, any>;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByTimeframe: Record<string, number>;
  lastError?: ErrorLogEntry;
}

class StoryErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private maxLogs = 100; // Keep only last 100 errors
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();

    // Initialize with browser info
    if (typeof window !== 'undefined') {
      this.setupGlobalErrorHandlers();
    }
  }

  private generateSessionId(): string {
    return `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason)),
        'Unhandled Promise Rejection',
      );
    });
  }

  logError(
    error: Error | string,
    context?: string,
    metadata?: Record<string, any>,
  ): string {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const logEntry: ErrorLogEntry = {
      id,
      timestamp: new Date().toISOString(),
      level: 'error',
      message: errorObj.message,
      context,
      error: errorObj,
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      stack: errorObj.stack,
      metadata,
    };

    this.addLogEntry(logEntry);

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔴 Story Error [${id}]`);
      console.error('Message:', errorObj.message);
      console.error('Context:', context);
      console.error('Error:', errorObj);
      if (metadata) console.error('Metadata:', metadata);
      console.groupEnd();
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(logEntry);
    }

    return id;
  }

  logWarning(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ): string {
    const id = `warn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const logEntry: ErrorLogEntry = {
      id,
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      metadata,
    };

    this.addLogEntry(logEntry);

    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ Story Warning [${id}]:`, message, context, metadata);
    }

    return id;
  }

  logInfo(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ): string {
    const id = `info_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const logEntry: ErrorLogEntry = {
      id,
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      metadata,
    };

    this.addLogEntry(logEntry);

    if (process.env.NODE_ENV === 'development') {
      console.info(`ℹ️ Story Info [${id}]:`, message, context, metadata);
    }

    return id;
  }

  private addLogEntry(entry: ErrorLogEntry) {
    this.logs.unshift(entry);

    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  private getCurrentUserId(): string | undefined {
    // Try to get user ID from localStorage or context
    if (typeof window !== 'undefined') {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.id;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  private async sendToMonitoring(logEntry: ErrorLogEntry) {
    try {
      // Send to your monitoring service (e.g., Sentry, LogRocket, etc.)
      // This is a placeholder - replace with your actual monitoring service
      const monitoringUrl = process.env.NEXT_PUBLIC_MONITORING_URL;

      if (monitoringUrl) {
        await fetch(monitoringUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service: 'story-frontend',
            ...logEntry,
          }),
        });
      }
    } catch (error) {
      console.warn('Failed to send error to monitoring service:', error);
    }
  }

  getLogs(level?: ErrorLogEntry['level']): ErrorLogEntry[] {
    if (!level) return [...this.logs];
    return this.logs.filter((log) => log.level === level);
  }

  getMetrics(): ErrorMetrics {
    const totalErrors = this.logs.length;
    const errorsByType: Record<string, number> = {};
    const errorsByTimeframe: Record<string, number> = {};

    this.logs.forEach((log) => {
      // Count by message type
      if (errorsByType[log.message]) {
        errorsByType[log.message]++;
      } else {
        errorsByType[log.message] = 1;
      }

      // Count by hour
      const hour = new Date(log.timestamp).toISOString().substring(0, 13);
      if (errorsByTimeframe[hour]) {
        errorsByTimeframe[hour]++;
      } else {
        errorsByTimeframe[hour] = 1;
      }
    });

    return {
      totalErrors,
      errorsByType,
      errorsByTimeframe,
      lastError: this.logs[0],
    };
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Create singleton instance
export const storyErrorLogger = new StoryErrorLogger();

// Convenience functions
export const logStoryError = (
  error: Error | string,
  context?: string,
  metadata?: Record<string, any>,
) => {
  return storyErrorLogger.logError(error, context, metadata);
};

export const logStoryWarning = (
  message: string,
  context?: string,
  metadata?: Record<string, any>,
) => {
  return storyErrorLogger.logWarning(message, context, metadata);
};

export const logStoryInfo = (
  message: string,
  context?: string,
  metadata?: Record<string, any>,
) => {
  return storyErrorLogger.logInfo(message, context, metadata);
};

export const getStoryErrorMetrics = (): ErrorMetrics => {
  return storyErrorLogger.getMetrics();
};

// React hook for error logging
export const useStoryErrorLogger = () => {
  return {
    logError: logStoryError,
    logWarning: logStoryWarning,
    logInfo: logStoryInfo,
    getLogs: (level?: ErrorLogEntry['level']) =>
      storyErrorLogger.getLogs(level),
    getMetrics: getStoryErrorMetrics,
    clearLogs: () => storyErrorLogger.clearLogs(),
    exportLogs: () => storyErrorLogger.exportLogs(),
  };
};
