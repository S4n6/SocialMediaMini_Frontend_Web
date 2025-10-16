import { useState, useCallback } from 'react';

export interface UploadProgress {
  overall: number;
  files: {
    name: string;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
  }[];
}

export interface UseUploadProgressReturn {
  progress: UploadProgress;
  updateFileProgress: (
    index: number,
    progress: number,
    status?: 'pending' | 'uploading' | 'success' | 'error',
  ) => void;
  resetProgress: () => void;
  initializeFiles: (files: File[]) => void;
}

/**
 * Hook to track upload progress for multiple files
 */
export const useUploadProgress = (): UseUploadProgressReturn => {
  const [progress, setProgress] = useState<UploadProgress>({
    overall: 0,
    files: [],
  });

  const initializeFiles = useCallback((files: File[]) => {
    setProgress({
      overall: 0,
      files: files.map((file) => ({
        name: file.name,
        progress: 0,
        status: 'pending' as const,
      })),
    });
  }, []);

  const updateFileProgress = useCallback(
    (
      index: number,
      fileProgress: number,
      status: 'pending' | 'uploading' | 'success' | 'error' = 'uploading',
    ) => {
      setProgress((prev) => {
        const newFiles = [...prev.files];
        if (newFiles[index]) {
          newFiles[index] = {
            ...newFiles[index],
            progress: fileProgress,
            status,
          };
        }

        // Calculate overall progress
        const totalProgress = newFiles.reduce(
          (sum, file) => sum + file.progress,
          0,
        );
        const overall =
          newFiles.length > 0 ? totalProgress / newFiles.length : 0;

        return {
          overall,
          files: newFiles,
        };
      });
    },
    [],
  );

  const resetProgress = useCallback(() => {
    setProgress({
      overall: 0,
      files: [],
    });
  }, []);

  return {
    progress,
    updateFileProgress,
    resetProgress,
    initializeFiles,
  };
};
