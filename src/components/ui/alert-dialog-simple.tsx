'use client';

import * as React from 'react';
import { Button } from './button';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function AlertDialog({
  open,
  onOpenChange,
  children,
}: AlertDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-background rounded-lg shadow-lg max-w-md w-full mx-4 border">
        {children}
      </div>
    </div>
  );
}

export function AlertDialogContent({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function AlertDialogHeader({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`space-y-2 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function AlertDialogTitle({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={`text-lg font-semibold ${className}`} {...props}>
      {children}
    </h2>
  );
}

export function AlertDialogDescription({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`} {...props}>
      {children}
    </p>
  );
}

export function AlertDialogFooter({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex justify-end gap-2 mt-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function AlertDialogAction({
  className = '',
  onClick,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button className={className} onClick={onClick} {...props}>
      {children}
    </Button>
  );
}

export function AlertDialogCancel({
  className = '',
  onClick,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      variant="outline"
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </Button>
  );
}

// Re-exports for compatibility
export const AlertDialogTrigger = Button;
export const AlertDialogPortal = React.Fragment;
export const AlertDialogOverlay = React.Fragment;
