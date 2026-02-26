import {
  PostFormData,
  CreatePostPayload,
  MediaFile,
} from '../types/create-post.types';

/**
 * Upload an array of media files and return their remote URLs.
 * Accepts an injected upload function so callers can swap between
 * real uploads and stubs in tests.
 */
export type UploadMediaFn = (files: File[]) => Promise<string[]>;

/**
 * Transform frontend form data to backend API payload.
 *
 * @param formData  – current form state
 * @param mediaFiles – files selected by the user
 * @param uploadFn  – async function that uploads files and returns URLs
 *                    (defaults to a no-op that returns empty strings so the
 *                     app never sends blob: URLs to the backend)
 */
export const transformPostFormToPayload = async (
  formData: PostFormData,
  mediaFiles: MediaFile[] = [],
  uploadFn?: UploadMediaFn,
): Promise<CreatePostPayload> => {
  // Upload files first, then build payload with real URLs
  let uploadedUrls: string[] = [];

  if (mediaFiles.length > 0) {
    const rawFiles = mediaFiles.map((mf) => mf.file);
    if (uploadFn) {
      uploadedUrls = await uploadFn(rawFiles);
    } else {
      // Fallback: use empty strings so we never leak blob: URLs
      console.warn(
        '[transformPostFormToPayload] No uploadFn provided – media URLs will be empty',
      );
      uploadedUrls = rawFiles.map(() => '');
    }
  }

  // Build media array with real uploaded URLs
  const media = mediaFiles.map((file, index) => ({
    url: uploadedUrls[index] ?? '',
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
