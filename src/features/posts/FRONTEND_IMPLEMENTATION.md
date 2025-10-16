# Frontend Post Service Implementation

## Overview

The frontend has been updated to support client-side media upload with Cloudinary integration and proper error handling.

## New Service Methods

### 1. `createPostWithMedia(payload, mediaFiles?)`

Main method that handles the entire post creation flow:

```typescript
const result = await postsService.createPostWithMedia(
  {
    content: 'Hello World!',
    privacy: 'PUBLIC',
  },
  mediaFiles, // Optional File[] array
);
```

### 2. `uploadMediaFiles(files)`

Uploads files to Cloudinary with error handling:

```typescript
const urls = await postsService.uploadMediaFiles(files);
```

### 3. `getCloudinarySignature()`

Gets secure upload signature from backend:

```typescript
const signature = await postsService.getCloudinarySignature();
```

### 4. `cleanupUploadedFiles(urls)`

Cleans up orphaned files when post creation fails:

```typescript
await postsService.cleanupUploadedFiles(uploadedUrls);
```

## New Hooks

### 1. `useCreatePostWithMedia()`

Enhanced hook with progress tracking:

```typescript
const { createPost, isCreating, progress, currentStep, error, reset } =
  useCreatePostWithMedia();

// Usage
await createPost({
  payload: { content: 'Hello!' },
  mediaFiles: selectedFiles,
});
```

### 2. `useUploadProgress()`

Tracks upload progress for multiple files:

```typescript
const { progress, updateFileProgress, resetProgress, initializeFiles } =
  useUploadProgress();
```

## Components

### `UploadProgressDisplay`

Shows upload progress with file-by-file tracking:

```tsx
<UploadProgressDisplay
  currentStep={currentStep}
  progress={progress}
  error={error}
/>
```

## Usage in CreatePostDialog

### Basic Usage

```tsx
import { useCreatePostWithMedia } from '@/features/posts/hooks/useCreatePostWithMedia';
import { UploadProgressDisplay } from '@/features/posts/components/UploadProgressDisplay';

function CreatePostDialog() {
  const { createPost, isCreating, progress, currentStep, error, reset } =
    useCreatePostWithMedia();

  const handleSubmit = async () => {
    try {
      await createPost({
        payload: {
          content: formData.caption,
          privacy: formData.privacy.toUpperCase(),
          hashtags: formData.tags,
        },
        mediaFiles: selectedFiles,
      });

      // Success - dialog will close automatically
      onClose();
    } catch (error) {
      console.error('Post creation failed:', error);
    }
  };

  return (
    <Dialog>
      {/* Form fields */}

      {/* Progress display */}
      <UploadProgressDisplay
        currentStep={currentStep}
        progress={progress}
        error={error}
      />

      <Button onClick={handleSubmit} disabled={isCreating}>
        {isCreating ? 'Creating...' : 'Create Post'}
      </Button>
    </Dialog>
  );
}
```

## Error Handling

The service provides automatic error handling and cleanup:

1. **Upload Failure**: Cleans up partially uploaded files
2. **Post Creation Failure**: Cleans up all uploaded media
3. **Network Issues**: Provides user-friendly error messages
4. **Signature Issues**: Handles authentication failures

## Flow Diagram

```
1. User selects media files
2. User fills post form
3. User clicks "Create Post"
   ↓
4. Get Cloudinary signature
   ↓
5. Upload files to Cloudinary (with progress)
   ↓ (if failure: cleanup uploaded files)
6. Create post with media URLs
   ↓ (if failure: cleanup all uploaded files)
7. Success: Invalidate cache & show toast
```

## Benefits

1. **Better UX**: Real-time progress feedback
2. **Reliability**: Automatic cleanup on failure
3. **Performance**: Direct CDN uploads
4. **Scalability**: Reduces backend load
5. **Cost Effective**: Uses Cloudinary bandwidth instead of server

## Considerations

### Should Users Wait for Upload?

**Pros of Waiting:**

- ✅ Immediate feedback if upload fails
- ✅ Ensures post integrity (no broken images)
- ✅ Prevents orphaned media files
- ✅ Cleaner user experience (success = fully created post)
- ✅ Easier error handling and rollback

**Cons of Waiting:**

- ❌ Longer perceived creation time
- ❌ Users might close app during upload
- ❌ Poor experience on slow connections

**Recommendation:** **Make users wait** because:

1. Social media posts with media are typically not time-critical
2. Failed posts create confusion and poor UX
3. Progress feedback makes waiting tolerable
4. Ensures data consistency and reliability
