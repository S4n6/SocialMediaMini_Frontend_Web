import { useCallback } from "react";
import {
  errorHandler,
  ErrorType,
  type ErrorContext,
} from "@/lib/error-handler";

interface UseErrorHandlerReturn {
  handleError: (error: any, context?: Partial<ErrorContext>) => void;
  handleAsyncOperation: <T>(
    operation: () => Promise<T>,
    context?: Partial<ErrorContext>
  ) => Promise<T | null>;
  wrapAsyncFunction: <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context?: Partial<ErrorContext>
  ) => T;
}

/**
 * Hook for centralized error handling in React components
 */
export const useErrorHandler = (
  defaultContext?: Partial<ErrorContext> | string
): UseErrorHandlerReturn => {
  const resolvedDefaultContext: Partial<ErrorContext> | undefined =
    typeof defaultContext === "string"
      ? { component: defaultContext }
      : defaultContext;

  const handleError = useCallback(
    (error: any, context?: Partial<ErrorContext>) => {
      const mergedContext = { ...resolvedDefaultContext, ...context };
      errorHandler.handleError(error, mergedContext);
    },
    [resolvedDefaultContext]
  );

  const handleAsyncOperation = useCallback(
    async <T extends unknown>(
      operation: () => Promise<T>,
      context?: Partial<ErrorContext>
    ): Promise<T | null> => {
      try {
        return await operation();
      } catch (error) {
        handleError(error, context);
        return null;
      }
    },
    [handleError]
  );

  const wrapAsyncFunction = useCallback(
    <T extends (...args: any[]) => Promise<any>>(
      fn: T,
      context?: Partial<ErrorContext>
    ): T => {
      return errorHandler.wrapAsyncFunction(fn, {
        ...resolvedDefaultContext,
        ...context,
      });
    },
    [resolvedDefaultContext]
  );

  return {
    handleError,
    handleAsyncOperation,
    wrapAsyncFunction,
  };
};

/**
 * Hook for API error handling with specific context
 */
export const useApiErrorHandler = (componentName: string) => {
  return useErrorHandler({
    component: componentName,
  });
};

/**
 * Hook for form error handling
 */
export const useFormErrorHandler = (formName: string) => {
  const { handleError } = useErrorHandler({
    component: `Form:${formName}`,
  });

  const handleValidationError = useCallback(
    (error: any, field?: string) => {
      handleError(error, {
        action: "validation",
        component: `Form:${formName}:${field || "unknown"}`,
      });
    },
    [handleError, formName]
  );

  const handleSubmitError = useCallback(
    (error: any) => {
      handleError(error, {
        action: "submit",
      });
    },
    [handleError]
  );

  return {
    handleError,
    handleValidationError,
    handleSubmitError,
  };
};

/**
 * Higher-order component for error boundary integration
 */
export const withErrorHandler = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return function WrappedComponent(props: P) {
    const { handleError } = useErrorHandler({
      component: componentName,
    });

    // Add error handling to component props if needed
    const enhancedProps = {
      ...props,
      onError: handleError,
    } as P;

    return <Component {...enhancedProps} />;
  };
};
