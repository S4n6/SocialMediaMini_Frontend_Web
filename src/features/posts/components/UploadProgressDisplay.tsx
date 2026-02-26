'use client';

import { CheckCircle, XCircle, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface UploadProgressDisplayProps {
  currentStep: 'idle' | 'uploading' | 'creating' | 'success' | 'error';
  progress: {
    overall: number;
    files: {
      name: string;
      progress: number;
      status: 'pending' | 'uploading' | 'success' | 'error';
    }[];
  };
  error?: string | null;
  className?: string;
}

export function UploadProgressDisplay({
  currentStep,
  progress,
  error,
  className,
}: UploadProgressDisplayProps) {
  if (currentStep === 'idle') return null;

  const getStatusIcon = () => {
    switch (currentStep) {
      case 'uploading':
        return <Upload className="w-4 h-4 animate-pulse text-blue-500" />;
      case 'creating':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (currentStep) {
      case 'uploading':
        return `Uploading ${progress.files.length} file(s)...`;
      case 'creating':
        return 'Creating post...';
      case 'success':
        return 'Post created successfully!';
      case 'error':
        return 'Upload failed';
      default:
        return '';
    }
  };

  const getProgressValue = () => {
    switch (currentStep) {
      case 'uploading':
        return progress.overall;
      case 'creating':
        return 90; // Show high progress while creating
      case 'success':
        return 100;
      case 'error':
        return 0;
      default:
        return 0;
    }
  };

  return (
    <div className={cn('space-y-3 p-4 bg-muted rounded-lg border', className)}>
      {/* Main Status */}
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium">{getStatusMessage()}</p>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
        {currentStep === 'uploading' && (
          <span className="text-xs text-muted-foreground">
            {Math.round(progress.overall)}%
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {(currentStep === 'uploading' || currentStep === 'creating') && (
        <Progress value={getProgressValue()} className="h-2" />
      )}

      {/* Individual File Progress */}
      {currentStep === 'uploading' && progress.files.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            File Progress:
          </p>
          {progress.files.map((file, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {file.status === 'uploading' && (
                    <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                  )}
                  {file.status === 'success' && (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                  {file.status === 'pending' && (
                    <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                  )}
                  <span className="text-xs truncate">{file.name}</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {file.progress}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Success Message */}
      {currentStep === 'success' && (
        <div className="text-center py-2">
          <p className="text-sm text-green-600 font-medium">
            🎉 Your post has been published successfully!
          </p>
        </div>
      )}
    </div>
  );
}
