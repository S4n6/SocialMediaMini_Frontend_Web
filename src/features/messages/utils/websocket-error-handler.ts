import { toast } from 'sonner';
import { networkMonitor } from './network-monitor';

export interface WebSocketError {
  type:
    | 'connection'
    | 'authentication'
    | 'message'
    | 'timeout'
    | 'network'
    | 'unknown';
  code?: string | number;
  message: string;
  timestamp: Date;
  retry?: boolean;
  data?: any;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffFactor: number;
  retryOn?: (error: WebSocketError) => boolean;
}

export class WebSocketErrorHandler {
  private static instance: WebSocketErrorHandler;
  private retryConfig: RetryConfig;
  private errorLog: WebSocketError[] = [];
  private maxLogSize = 50;

  private constructor(config?: Partial<RetryConfig>) {
    this.retryConfig = {
      maxAttempts: 5,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
      retryOn: (error) => this.shouldRetry(error),
      ...config,
    };
  }

  static getInstance(config?: Partial<RetryConfig>): WebSocketErrorHandler {
    if (!WebSocketErrorHandler.instance) {
      WebSocketErrorHandler.instance = new WebSocketErrorHandler(config);
    }
    return WebSocketErrorHandler.instance;
  }

  // Classify and handle different types of errors
  handleError(
    error: any,
    context?: string,
    onRetry?: () => Promise<void>,
  ): WebSocketError {
    const wsError = this.classifyError(error, context);
    this.logError(wsError);

    // Show user-friendly notification
    this.showErrorNotification(wsError);

    // Handle retry logic if applicable
    if (wsError.retry && onRetry) {
      this.scheduleRetry(wsError, onRetry);
    }

    return wsError;
  }

  private classifyError(error: any, context?: string): WebSocketError {
    const timestamp = new Date();
    let type: WebSocketError['type'] = 'unknown';
    let message = 'An unknown error occurred';
    let code: string | number | undefined;
    let retry = false;

    // Network-related errors
    if (!networkMonitor.isOnline()) {
      type = 'network';
      message = 'No internet connection';
      retry = true;
    }
    // WebSocket specific errors
    else if (error instanceof Event) {
      if (error.type === 'close') {
        type = 'connection';
        const closeEvent = error as CloseEvent;
        code = closeEvent.code;

        switch (closeEvent.code) {
          case 1000: // Normal closure
            message = 'Connection closed normally';
            retry = false;
            break;
          case 1001: // Going away
            message = 'Server going away';
            retry = true;
            break;
          case 1006: // Abnormal closure
            message = 'Connection lost unexpectedly';
            retry = true;
            break;
          case 1011: // Server error
            message = 'Server encountered an error';
            retry = true;
            break;
          case 4001: // Custom: Authentication failed
            message = 'Authentication failed';
            retry = false;
            type = 'authentication';
            break;
          default:
            message = `Connection closed with code: ${closeEvent.code}`;
            retry = closeEvent.code !== 1000;
        }
      } else if (error.type === 'error') {
        type = 'connection';
        message = 'WebSocket connection error';
        retry = true;
      }
    }
    // Network/fetch errors
    else if (error instanceof TypeError && error.message.includes('fetch')) {
      type = 'network';
      message = 'Network request failed';
      retry = true;
    }
    // Timeout errors
    else if (
      error.message?.includes('timeout') ||
      error.name === 'TimeoutError'
    ) {
      type = 'timeout';
      message = 'Request timed out';
      retry = true;
    }
    // Authentication errors
    else if (
      error.message?.includes('auth') ||
      error.message?.includes('401')
    ) {
      type = 'authentication';
      message = 'Authentication failed';
      retry = false;
    }
    // Generic errors
    else if (error instanceof Error) {
      message = error.message;
      code = error.name;
      retry = !error.message.includes('401') && !error.message.includes('403');
    }
    // String errors
    else if (typeof error === 'string') {
      message = error;
      retry = true;
    }

    return {
      type,
      code,
      message,
      timestamp,
      retry,
      data: { context, originalError: error },
    };
  }

  private shouldRetry(error: WebSocketError): boolean {
    // Don't retry authentication errors
    if (error.type === 'authentication') {
      return false;
    }

    // Don't retry if explicitly disabled
    if (error.retry === false) {
      return false;
    }

    // Retry network and connection errors
    if (
      error.type === 'network' ||
      error.type === 'connection' ||
      error.type === 'timeout'
    ) {
      return true;
    }

    return false;
  }

  private async scheduleRetry(
    error: WebSocketError,
    onRetry: () => Promise<void>,
    attempt: number = 1,
  ): Promise<void> {
    if (attempt > this.retryConfig.maxAttempts) {
      this.showFinalErrorNotification();
      return;
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.retryConfig.baseDelay *
        Math.pow(this.retryConfig.backoffFactor, attempt - 1),
      this.retryConfig.maxDelay,
    );

    // Add jitter to prevent thundering herd
    const jitteredDelay = delay + Math.random() * 1000;

    console.log(
      `Retrying in ${Math.round(jitteredDelay)}ms (attempt ${attempt})`,
    );

    setTimeout(async () => {
      try {
        // Check network status before retry
        if (!networkMonitor.isOnline()) {
          // Wait for network to come back online
          const unsubscribe = networkMonitor.addListener((status) => {
            if (status.isOnline) {
              unsubscribe();
              this.scheduleRetry(error, onRetry, attempt);
            }
          });
          return;
        }

        await onRetry();
      } catch (retryError) {
        console.error(`Retry attempt ${attempt} failed:`, retryError);
        this.scheduleRetry(error, onRetry, attempt + 1);
      }
    }, jitteredDelay);
  }

  private showErrorNotification(error: WebSocketError): void {
    const title = this.getErrorTitle(error);
    const description = this.getErrorDescription(error);

    switch (error.type) {
      case 'network':
        toast.error(title, {
          description,
          action: {
            label: 'Retry',
            onClick: () => window.location.reload(),
          },
        });
        break;

      case 'authentication':
        toast.error(title, {
          description: 'Please sign in again',
          action: {
            label: 'Sign In',
            onClick: () => (window.location.href = '/auth/login'),
          },
        });
        break;

      case 'connection':
        if (error.retry) {
          toast.warning(title, {
            description: 'Attempting to reconnect...',
          });
        } else {
          toast.error(title, { description });
        }
        break;

      default:
        toast.error(title, { description });
    }
  }

  private showFinalErrorNotification(): void {
    toast.error('Connection Failed', {
      description:
        'Unable to establish connection after multiple attempts. Please check your internet connection and try again.',
      action: {
        label: 'Reload',
        onClick: () => window.location.reload(),
      },
    });
  }

  private getErrorTitle(error: WebSocketError): string {
    switch (error.type) {
      case 'network':
        return 'Connection Problem';
      case 'authentication':
        return 'Authentication Failed';
      case 'connection':
        return 'Connection Lost';
      case 'timeout':
        return 'Request Timeout';
      case 'message':
        return 'Message Error';
      default:
        return 'Error';
    }
  }

  private getErrorDescription(error: WebSocketError): string {
    switch (error.type) {
      case 'network':
        return 'Please check your internet connection';
      case 'authentication':
        return 'Your session has expired';
      case 'connection':
        return 'Trying to reconnect...';
      case 'timeout':
        return 'The request took too long to complete';
      default:
        return error.message;
    }
  }

  private logError(error: WebSocketError): void {
    this.errorLog.unshift(error);

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[WebSocket Error]', error);
    }
  }

  // Public API for retrieving errors
  getErrorLog(): WebSocketError[] {
    return [...this.errorLog];
  }

  getRecentErrors(minutes: number = 5): WebSocketError[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.errorLog.filter((error) => error.timestamp > cutoff);
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  // Check if we should use fallback mode based on recent errors
  shouldUseFallbackMode(): boolean {
    const recentErrors = this.getRecentErrors(10); // Last 10 minutes
    const connectionErrors = recentErrors.filter(
      (error) => error.type === 'connection' || error.type === 'network',
    );

    // Use fallback if we've had multiple connection issues recently
    return connectionErrors.length >= 3;
  }

  // Update retry configuration
  updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
  }
}

// Export singleton instance
export const wsErrorHandler = WebSocketErrorHandler.getInstance();
