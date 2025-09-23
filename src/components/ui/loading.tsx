"use client";

import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots" | "pulse";
  text?: string;
  className?: string;
}

export function Loading({
  size = "md",
  variant = "spinner",
  text,
  className,
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  if (variant === "spinner") {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        <div
          className={cn(
            "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
            sizeClasses[size]
          )}
        />
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        </div>
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        <div
          className={cn(
            "rounded-full bg-blue-600 animate-pulse",
            sizeClasses[size]
          )}
        />
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  return null;
}

// Loading Skeleton cho cards/lists
export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );
}

// Full page loading
export function PageLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <Loading size="lg" variant="spinner" />
        <p className="text-lg font-medium">{text}</p>
      </div>
    </div>
  );
}
