import { toast } from "sonner";
import { handleApiResponseError } from "@/lib/helpers/api.helpers";

export enum ErrorType {
  NETWORK = "NETWORK",
  VALIDATION = "VALIDATION",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  SERVER = "SERVER",
  UNKNOWN = "UNKNOWN",
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

export interface ErrorDetails {
  type: ErrorType;
  message: string;
  originalError?: any;
  context?: ErrorContext;
  shouldLog?: boolean;
  shouldNotify?: boolean;
}

class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle different types of errors with appropriate responses
   */
  public handleError(error: any, context?: Partial<ErrorContext>): void {
    const errorDetails = this.analyzeError(error, context);

    if (errorDetails.shouldLog) {
      this.logError(errorDetails);
    }

    if (errorDetails.shouldNotify) {
      this.showErrorNotification(errorDetails);
    }

    // Special handling for different error types
    this.executeErrorTypeActions(errorDetails);
  }

  /**
   * Analyze error and categorize it
   */
  private analyzeError(
    error: any,
    context?: Partial<ErrorContext>
  ): ErrorDetails {
    const fullContext: ErrorContext = {
      component: context?.component || "Unknown",
      action: context?.action || "Unknown",
      userId: context?.userId || "anonymous",
      timestamp: new Date().toISOString(),
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "server",
      url: typeof window !== "undefined" ? window.location.href : "server",
      ...context,
    };

    // Network errors
    if (
      error?.code === "NETWORK_ERROR" ||
      error?.message?.includes("Network Error")
    ) {
      return {
        type: ErrorType.NETWORK,
        message: "Please check your internet connection and try again.",
        originalError: error,
        context: fullContext,
        shouldLog: true,
        shouldNotify: true,
      };
    }

    // Authentication errors
    if (error?.response?.status === 401 || error?.code === "UNAUTHORIZED") {
      return {
        type: ErrorType.AUTHENTICATION,
        message: "Your session has expired. Please log in again.",
        originalError: error,
        context: fullContext,
        shouldLog: true,
        shouldNotify: true,
      };
    }

    // Authorization errors
    if (error?.response?.status === 403 || error?.code === "FORBIDDEN") {
      return {
        type: ErrorType.AUTHORIZATION,
        message: "You don't have permission to perform this action.",
        originalError: error,
        context: fullContext,
        shouldLog: true,
        shouldNotify: true,
      };
    }

    // Validation errors
    if (error?.response?.status === 400 || error?.code === "VALIDATION_ERROR") {
      return {
        type: ErrorType.VALIDATION,
        message: handleApiResponseError(error),
        originalError: error,
        context: fullContext,
        shouldLog: false,
        shouldNotify: true,
      };
    }

    // Server errors
    if (error?.response?.status >= 500 || error?.code === "SERVER_ERROR") {
      return {
        type: ErrorType.SERVER,
        message: "Something went wrong on our end. Please try again later.",
        originalError: error,
        context: fullContext,
        shouldLog: true,
        shouldNotify: true,
      };
    }

    // Unknown errors
    return {
      type: ErrorType.UNKNOWN,
      message: handleApiResponseError(error) || "An unexpected error occurred.",
      originalError: error,
      context: fullContext,
      shouldLog: true,
      shouldNotify: true,
    };
  }

  /**
   * Log error to console and external services
   */
  private logError(errorDetails: ErrorDetails): void {
    // Console logging in development
    if (process.env.NODE_ENV === "development") {
      console.group(`🚨 Error: ${errorDetails.type}`);
      console.error("Message:", errorDetails.message);
      console.error("Context:", errorDetails.context);
      console.error("Original Error:", errorDetails.originalError);
      console.groupEnd();
    }

    // External error logging service
    this.sendToErrorLoggingService(errorDetails);
  }

  /**
   * Show user-friendly error notifications
   */
  private showErrorNotification(errorDetails: ErrorDetails): void {
    const { type, message } = errorDetails;

    switch (type) {
      case ErrorType.NETWORK:
        toast.error(message, {
          description: "Check your connection and try again",
          action: {
            label: "Retry",
            onClick: () => window.location.reload(),
          },
        });
        break;

      case ErrorType.AUTHENTICATION:
        toast.error(message, {
          description: "Redirecting to login page...",
          action: {
            label: "Login",
            onClick: () => {
              if (typeof window !== "undefined") {
                window.location.href = "/login";
              }
            },
          },
        });
        break;

      case ErrorType.AUTHORIZATION:
        toast.error(message, {
          description: "Contact support if you believe this is incorrect",
        });
        break;

      case ErrorType.VALIDATION:
        toast.error(message, {
          description: "Please check your input and try again",
        });
        break;

      case ErrorType.SERVER:
        toast.error(message, {
          description: "Our team has been notified",
          action: {
            label: "Report Issue",
            onClick: () => this.openReportIssue(errorDetails),
          },
        });
        break;

      default:
        toast.error(message);
        break;
    }
  }

  /**
   * Execute specific actions based on error type
   */
  private executeErrorTypeActions(errorDetails: ErrorDetails): void {
    switch (errorDetails.type) {
      case ErrorType.AUTHENTICATION:
        // Auto-redirect to login after delay
        setTimeout(() => {
          if (
            typeof window !== "undefined" &&
            !window.location.pathname.includes("/login")
          ) {
            window.location.href = "/login";
          }
        }, 3000);
        break;

      case ErrorType.NETWORK:
        // Could implement auto-retry logic here
        break;

      default:
        break;
    }
  }

  /**
   * Send error to external logging service
   */
  private async sendToErrorLoggingService(
    errorDetails: ErrorDetails
  ): Promise<void> {
    try {
      // Example: Send to Sentry, LogRocket, etc.
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorDetails),
      // });

      // For now, just log to console in production
      if (process.env.NODE_ENV === "production") {
        console.error("Error logged:", errorDetails.type, errorDetails.message);
      }
    } catch (loggingError) {
      console.error("Failed to log error:", loggingError);
    }
  }

  /**
   * Open issue reporting
   */
  private openReportIssue(errorDetails: ErrorDetails): void {
    const issueTitle = encodeURIComponent(`Error: ${errorDetails.type}`);
    const issueBody = encodeURIComponent(
      `**Error Type:** ${errorDetails.type}
**Message:** ${errorDetails.message}
**Component:** ${errorDetails.context?.component}
**Action:** ${errorDetails.context?.action}
**Timestamp:** ${errorDetails.context?.timestamp}
**URL:** ${errorDetails.context?.url}

**Description:**
Please describe what you were doing when this error occurred.`
    );

    // Open GitHub issue or support form
    const reportUrl = `https://github.com/your-repo/issues/new?title=${issueTitle}&body=${issueBody}`;
    window.open(reportUrl, "_blank");
  }

  /**
   * Handle async operation errors
   */
  public handleAsyncError = (error: any, context?: Partial<ErrorContext>) => {
    return this.handleError(error, context);
  };

  /**
   * Wrap async functions with error handling
   */
  public wrapAsyncFunction = <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context?: Partial<ErrorContext>
  ): T => {
    return (async (...args: any[]) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleError(error, context);
        throw error; // Re-throw to allow component-level handling
      }
    }) as T;
  };
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();
