'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera,
  RotateCcw,
  Zap,
  ZapOff,
  Circle,
  Square,
  ImageIcon,
  Upload,
  X,
} from 'lucide-react';
import { STORY_FILE_VALIDATION } from '../constants';

interface MediaCaptureProps {
  onMediaSelected: (file: File, type: 'image' | 'video') => void;
  onError: (error: string) => void;
}

type CameraMode = 'photo' | 'video';
type CameraFacing = 'user' | 'environment';

export const MediaCapture: React.FC<MediaCaptureProps> = ({
  onMediaSelected,
  onError,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraMode, setCameraMode] = useState<CameraMode>('photo');
  const [cameraFacing, setCameraFacing] = useState<CameraFacing>('user');
  const [hasFlash, setHasFlash] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize camera
  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, [cameraFacing]);

  const initializeCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraSupported(false);
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
        audio: cameraMode === 'video',
      };

      const mediaStream =
        await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Check for flash support
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities();
        setHasFlash('torch' in capabilities);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraSupported(false);
      onError('Unable to access camera. Please allow camera permissions.');
    }
  };

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  const toggleFlash = async () => {
    if (!stream || !hasFlash) return;

    try {
      const videoTrack = stream.getVideoTracks()[0];
      await videoTrack.applyConstraints({
        advanced: [{ torch: !flashEnabled } as any],
      });
      setFlashEnabled(!flashEnabled);
    } catch (error) {
      console.error('Error toggling flash:', error);
    }
  };

  const switchCamera = () => {
    setCameraFacing((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `story-photo-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });

          // Validate file
          const validation =
            STORY_FILE_VALIDATION.isValidSize(file.size) &&
            STORY_FILE_VALIDATION.isValidType(file.type);

          if (!validation) {
            onError('Photo size or format not supported');
            return;
          }

          onMediaSelected(file, 'image');
        }
      },
      'image/jpeg',
      0.9,
    );
  }, [onMediaSelected, onError]);

  const startRecording = useCallback(() => {
    if (!stream) return;

    try {
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm',
        });

        const file = new File([blob], `story-video-${Date.now()}.webm`, {
          type: 'video/webm',
        });

        onMediaSelected(file, 'video');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 30) {
            // Max 30 seconds like Instagram
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      onError('Unable to start video recording');
    }
  }, [stream, onMediaSelected, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  }, [isRecording]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const sizeValid = STORY_FILE_VALIDATION.isValidSize(file.size);
    const typeValid = STORY_FILE_VALIDATION.isValidType(file.type);

    if (!sizeValid) {
      onError(
        `File too large. Maximum size: ${STORY_FILE_VALIDATION.getMaxSizeText()}`,
      );
      return;
    }

    if (!typeValid) {
      onError(
        `File type not supported. Allowed: ${STORY_FILE_VALIDATION.getAllowedTypesText()}`,
      );
      return;
    }

    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
    onMediaSelected(file, mediaType);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!cameraSupported) {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-8">
        <Camera
          className="w-16 h-16 mb-4 opacity-50"
          style={{ color: 'var(--color-foreground)' }}
        />
        <h3
          className="text-lg font-medium mb-2"
          style={{ color: 'var(--color-foreground)' }}
        >
          Camera not available
        </h3>
        <p
          className="text-sm opacity-60 text-center mb-6"
          style={{ color: 'var(--color-foreground)' }}
        >
          Your browser doesn't support camera access or camera permissions were
          denied.
        </p>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
          }}
        >
          <Upload className="w-5 h-5" />
          Choose from device
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="relative h-96 bg-black rounded-lg overflow-hidden">
      {/* Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Recording Timer */}
      {isRecording && (
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-red-500 text-white">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-medium">
            {formatTime(recordingTime)}
          </span>
        </div>
      )}

      {/* Top Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {hasFlash && (
          <button
            onClick={toggleFlash}
            className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
          >
            {flashEnabled ? (
              <Zap className="w-5 h-5" />
            ) : (
              <ZapOff className="w-5 h-5" />
            )}
          </button>
        )}

        <button
          onClick={switchCamera}
          className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center">
        <div className="flex items-center gap-8">
          {/* Gallery Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
          >
            <ImageIcon className="w-6 h-6" />
          </button>

          {/* Capture Button */}
          <button
            onClick={
              cameraMode === 'photo'
                ? capturePhoto
                : isRecording
                  ? stopRecording
                  : startRecording
            }
            className="relative p-1 rounded-full bg-white"
            disabled={!stream}
          >
            <div className="w-16 h-16 rounded-full border-4 border-gray-300 flex items-center justify-center">
              {cameraMode === 'photo' ? (
                <Circle className="w-8 h-8 text-gray-600" />
              ) : isRecording ? (
                <Square className="w-6 h-6 text-red-500 fill-current" />
              ) : (
                <Circle className="w-8 h-8 text-red-500" />
              )}
            </div>

            {/* Recording progress ring */}
            {isRecording && (
              <div
                className="absolute inset-0 w-18 h-18 rounded-full border-4 border-red-500 transition-all"
                style={{
                  background: `conic-gradient(red ${(recordingTime / 30) * 360}deg, transparent 0deg)`,
                }}
              />
            )}
          </button>

          {/* Mode Switch */}
          <div className="flex flex-col items-center">
            <button
              onClick={() =>
                setCameraMode(cameraMode === 'photo' ? 'video' : 'photo')
              }
              className={`text-xs font-medium transition-colors ${
                cameraMode === 'photo' ? 'text-yellow-400' : 'text-white/60'
              }`}
            >
              PHOTO
            </button>
            <button
              onClick={() =>
                setCameraMode(cameraMode === 'photo' ? 'video' : 'photo')
              }
              className={`text-xs font-medium transition-colors ${
                cameraMode === 'video' ? 'text-yellow-400' : 'text-white/60'
              }`}
            >
              VIDEO
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
