'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ProfileError]', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center px-4">
      <h2 className="text-xl font-semibold">Could not load this profile</h2>
      <p className="text-muted-foreground max-w-md">
        The profile may not exist or we ran into an issue loading it.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => reset()}>Retry</Button>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    </div>
  );
}
