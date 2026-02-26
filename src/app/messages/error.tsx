'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function MessagesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[MessagesError]', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center px-4">
      <h2 className="text-xl font-semibold">Messages failed to load</h2>
      <p className="text-muted-foreground max-w-md">
        We could not connect to the messaging service. Check your connection and
        try again.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => reset()}>Retry</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/')}>
          Go Home
        </Button>
      </div>
    </div>
  );
}
