"use client";

import React from "react";
import ErrorBoundary from "./ErrorBoundary";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

export const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({
  children,
  onReset,
}) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-md w-full p-6 text-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Page Error
              </h2>
              <p className="text-gray-600">
                We couldn&apos;t load this page. Please try going back or
                refreshing.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={onReset || (() => window.history.back())}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>
          </Card>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

interface ComponentErrorBoundaryProps {
  children: React.ReactNode;
  componentName?: string;
  onRetry?: () => void;
}

export const ComponentErrorBoundary: React.FC<ComponentErrorBoundaryProps> = ({
  children,
  componentName = "Component",
  onRetry,
}) => {
  return (
    <ErrorBoundary
      fallback={
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>

            <div className="space-y-1">
              <h4 className="font-medium text-red-800">
                {componentName} Error
              </h4>
              <p className="text-sm text-red-600">
                This component failed to load properly.
              </p>
            </div>

            {onRetry && (
              <Button
                onClick={onRetry}
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Retry
              </Button>
            )}
          </div>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

interface AsyncErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
}

export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({
  children,
  onRetry,
}) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>

            <div className="space-y-1">
              <h4 className="font-medium text-gray-900">Loading Error</h4>
              <p className="text-sm text-gray-600">
                Failed to load content. Please try again.
              </p>
            </div>

            {onRetry && (
              <Button onClick={onRetry} size="sm" variant="outline">
                Retry
              </Button>
            )}
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};
