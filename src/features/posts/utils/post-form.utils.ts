import {
  PostFormData,
  CreatePostPayload,
  MediaFile,
} from '../types/create-post.types';

/**
 * Transform frontend form data to backend API payload
 */
export const transformPostFormToPayload = (
  formData: PostFormData,
  mediaFiles: MediaFile[] = [],
): CreatePostPayload => {
  // Transform media files to the format expected by backend
  const media = mediaFiles.map((file, index) => ({
    url: file.preview, // This will be replaced with actual uploaded URLs
    type: file.type,
    order: index,
  }));

  // Transform tags to hashtags (remove # if present)
  const hashtags: string[] = formData.tags.map((tag: string): string =>
    tag.startsWith('#') ? tag.slice(1) : tag,
  );

  return {
    content: formData.caption || undefined,
    privacy: formData.privacy,
    media: media.length > 0 ? media : undefined,
    hashtags: hashtags.length > 0 ? hashtags : undefined,
  };
};

/**
 * Validate post form data before submission
 */
export const validatePostForm = (
  formData: PostFormData,
  mediaFiles: MediaFile[],
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Must have either content or media
  if (!formData.caption.trim() && mediaFiles.length === 0) {
    errors.push('Post must have either content or media');
  }

  // Caption length check
  if (formData.caption.length > 2200) {
    errors.push('Caption cannot exceed 2,200 characters');
  }

  // Accessibility text length check
  if (formData.accessibility && formData.accessibility.length > 125) {
    errors.push('Alt text cannot exceed 125 characters');
  }

  // Tags validation
  if (formData.tags.length > 30) {
    errors.push('Cannot have more than 30 tags');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
