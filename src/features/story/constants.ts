export const STORY_CONSTANTS = {
  EXPIRY_HOURS: parseInt(process.env.NEXT_PUBLIC_STORY_EXPIRY_HOURS || '24'),
  MAX_FILE_SIZE: parseInt(
    process.env.NEXT_PUBLIC_STORY_MAX_FILE_SIZE || '10485760',
  ), // 10MB
  ALLOWED_MIME_TYPES: process.env.NEXT_PUBLIC_STORY_ALLOWED_TYPES?.split(
    ',',
  ) || ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'],

  // UI Constants
  MAX_CONTENT_LENGTH: 200,
  STORY_CARD_WIDTH: 80,
  STORY_CARD_HEIGHT: 120,

  // Animation durations (using CSS variables from globals.css)
  ANIMATION_DURATION: '0.3s',

  // Colors from global.css theme
  THEME_COLORS: {
    PRIMARY: 'var(--color-primary)',
    ACCENT_GRADIENT: 'var(--color-accent-gradient)',
    BACKGROUND: 'var(--color-background)',
    FOREGROUND: 'var(--color-foreground)',
    MUTED: 'var(--color-muted)',
    CARD: 'var(--color-card)',
    BORDER: 'var(--color-border)',
    INPUT: 'var(--color-input)',
    RING: 'var(--color-ring)',
    HIGHLIGHT: 'var(--color-highlight)',
  },
} as const;

export const STORY_ERRORS = {
  FILE_TOO_LARGE: 'File size exceeds maximum allowed',
  INVALID_FILE_TYPE: 'File type not supported',
  UPLOAD_FAILED: 'Failed to upload story',
  FETCH_FAILED: 'Failed to load stories',
  NETWORK_ERROR: 'Network connection error',
  UNAUTHORIZED: 'You need to be logged in',
  STORY_EXPIRED: 'This story has expired',
  STORY_NOT_FOUND: 'Story not found',
  ACCESS_DENIED: 'Access denied',
  VALIDATION_ERROR: 'Invalid data provided',
} as const;

export const STORY_FILE_VALIDATION = {
  getMaxSizeText: () =>
    `${Math.round(STORY_CONSTANTS.MAX_FILE_SIZE / 1024 / 1024)}MB`,
  getAllowedTypesText: () => STORY_CONSTANTS.ALLOWED_MIME_TYPES.join(', '),
  isValidSize: (size: number) => size <= STORY_CONSTANTS.MAX_FILE_SIZE,
  isValidType: (type: string) =>
    STORY_CONSTANTS.ALLOWED_MIME_TYPES.includes(type),
} as const;
