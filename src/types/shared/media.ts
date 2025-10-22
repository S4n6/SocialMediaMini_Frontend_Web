/**
 * Media and file related types
 */

import { MediaType } from './common';

export interface MediaFile {
  id: string;
  url: string;
  type: MediaType;
  size?: number;
  originalName?: string;
  createdAt: string;
}

export interface ImageItem {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface VideoItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  width?: number;
  height?: number;
  caption?: string;
}

export interface PostMedia {
  id: string;
  url: string;
  type: string;
  order?: number;
  createdAt: string;
}

export interface UploadProgress {
  filename: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}
