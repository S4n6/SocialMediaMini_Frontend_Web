import { describe, it, expect, vi } from 'vitest';
import {
  transformPostFormToPayload,
  validatePostForm,
  type UploadMediaFn,
} from '../post-form.utils';
import type { PostFormData, MediaFile } from '../../types/create-post.types';

// ─── Helpers ──────────────────────────────────────────────
function makeFormData(overrides: Partial<PostFormData> = {}): PostFormData {
  return {
    caption: '',
    location: '',
    tags: [],
    accessibility: '',
    privacy: 'public',
    ...overrides,
  };
}

function makeMediaFile(overrides: Partial<MediaFile> = {}): MediaFile {
  return {
    id: '1',
    file: new File([''], 'photo.jpg', { type: 'image/jpeg' }),
    preview: 'blob:http://localhost/abc',
    type: 'image',
    ...overrides,
  };
}

// ─── validatePostForm ─────────────────────────────────────
describe('validatePostForm', () => {
  it('requires either caption or media', () => {
    const result = validatePostForm(makeFormData(), []);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Post must have either content or media');
  });

  it('passes when caption is provided', () => {
    const result = validatePostForm(
      makeFormData({ caption: 'Hello world' }),
      [],
    );
    expect(result.isValid).toBe(true);
  });

  it('passes when media is provided', () => {
    const result = validatePostForm(makeFormData(), [makeMediaFile()]);
    expect(result.isValid).toBe(true);
  });

  it('rejects caption over 2200 chars', () => {
    const result = validatePostForm(
      makeFormData({ caption: 'x'.repeat(2201) }),
      [],
    );
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Caption cannot exceed 2,200 characters');
  });

  it('rejects alt text over 125 chars', () => {
    const result = validatePostForm(
      makeFormData({ caption: 'pic', accessibility: 'a'.repeat(126) }),
      [makeMediaFile()],
    );
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Alt text cannot exceed 125 characters');
  });

  it('rejects more than 30 tags', () => {
    const tags = Array.from({ length: 31 }, (_, i) => `tag${i}`);
    const result = validatePostForm(makeFormData({ caption: 'hi', tags }), []);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Cannot have more than 30 tags');
  });
});

// ─── transformPostFormToPayload ───────────────────────────
describe('transformPostFormToPayload', () => {
  it('maps caption to content', async () => {
    const payload = await transformPostFormToPayload(
      makeFormData({ caption: 'Hello' }),
    );
    expect(payload.content).toBe('Hello');
  });

  it('strips # from tags', async () => {
    const payload = await transformPostFormToPayload(
      makeFormData({ caption: 'Hi', tags: ['#react', 'nextjs'] }),
    );
    expect(payload.hashtags).toEqual(['react', 'nextjs']);
  });

  it('omits media array when no files provided', async () => {
    const payload = await transformPostFormToPayload(
      makeFormData({ caption: 'Hi' }),
    );
    expect(payload.media).toBeUndefined();
  });

  it('calls uploadFn and uses returned URLs', async () => {
    const uploadFn: UploadMediaFn = vi
      .fn()
      .mockResolvedValue(['https://cdn.example.com/photo.jpg']);

    const payload = await transformPostFormToPayload(
      makeFormData({ caption: 'pic' }),
      [makeMediaFile()],
      uploadFn,
    );

    expect(uploadFn).toHaveBeenCalledOnce();
    expect(payload.media?.[0].url).toBe('https://cdn.example.com/photo.jpg');
  });

  it('falls back to empty strings without uploadFn', async () => {
    const payload = await transformPostFormToPayload(
      makeFormData({ caption: 'pic' }),
      [makeMediaFile()],
    );
    expect(payload.media?.[0].url).toBe('');
  });
});
