// Reels configuration constants - Instagram 2025 style
export const REELS_CONFIG = {
  // Video constraints (Instagram 2025 specs)
  VIDEO: {
    MAX_DURATION: 90, // seconds - Instagram increased from 60s
    MIN_DURATION: 3, // seconds
    MAX_FILE_SIZE: 250 * 1024 * 1024, // 250MB - increased for higher quality
    ASPECT_RATIO: {
      MIN: 0.5625, // 9:16 vertical
      MAX: 1.91, // 1.91:1 landscape (rare for reels)
      RECOMMENDED: 0.5625, // 9:16 - Instagram's preferred ratio
    },
    QUALITY: {
      DEFAULT: '720p',
      AUTO_SWITCH_THRESHOLD: 0.8, // Switch to lower quality if buffering
    },
  },

  // Playback settings
  PLAYBACK: {
    PRELOAD_COUNT: 3, // Number of videos to preload ahead
    PRELOAD_BEHIND: 1, // Number of videos to keep loaded behind
    AUTO_PLAY_DELAY: 100, // ms delay before auto-play
    SCROLL_THRESHOLD: 0.6, // 60% of video must be visible to start playing
    PAUSE_THRESHOLD: 0.3, // 30% visibility to pause
    BUFFER_AHEAD: 10, // seconds to buffer ahead
    RETRY_ATTEMPTS: 3, // Number of retry attempts for failed videos
    RETRY_DELAY: 1000, // ms delay between retries
  },

  // UI/UX settings
  UI: {
    CONTROLS_HIDE_DELAY: 3000, // ms - Hide controls after interaction
    PROGRESS_UPDATE_INTERVAL: 100, // ms - Progress bar update frequency
    DOUBLE_TAP_LIKE_DELAY: 300, // ms - Double tap detection
    LONG_PRESS_DELAY: 500, // ms - Long press detection
    SCROLL_DEBOUNCE: 100, // ms - Scroll event debouncing
    ANIMATION_DURATION: 200, // ms - UI animations
    TOAST_DURATION: 2000, // ms - Success/error messages
  },

  // Performance settings
  PERFORMANCE: {
    MAX_CONCURRENT_VIDEOS: 3, // Maximum videos playing at once
    MEMORY_CLEANUP_THRESHOLD: 10, // Clean up after N videos
    INTERSECTION_THRESHOLD: [0, 0.25, 0.5, 0.75, 1], // Intersection observer thresholds
    LAZY_LOAD_OFFSET: 200, // px - Start loading before element is visible
  },

  // Supported formats and codecs
  FORMATS: {
    VIDEO: ['video/mp4', 'video/webm', 'video/ogg'],
    AUDIO: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac'],
    CODECS: {
      VIDEO: ['h264', 'vp9', 'av1'],
      AUDIO: ['aac', 'opus', 'vorbis'],
    },
  },

  // Instagram 2025 specific features
  FEATURES: {
    REMIX_ENABLED: true,
    DUET_ENABLED: true,
    STITCH_ENABLED: true,
    AR_EFFECTS_ENABLED: true,
    MUSIC_SYNC_ENABLED: true,
    AUTO_CAPTIONS_ENABLED: true,
    QUALITY_AUTO_SWITCH: true,
    PICTURE_IN_PICTURE: true,
  },

  // Analytics
  ANALYTICS: {
    VIEW_THRESHOLD: 3, // seconds - Minimum watch time to count as view
    ENGAGEMENT_EVENTS: [
      'video_start',
      'video_25_percent',
      'video_50_percent',
      'video_75_percent',
      'video_complete',
      'like',
      'comment',
      'share',
      'save',
      'follow',
      'profile_visit',
    ],
    BATCH_SIZE: 10, // Number of events to batch before sending
    FLUSH_INTERVAL: 30000, // ms - Force flush analytics events
  },
} as const;

// Route constants
export const REELS_ROUTES = {
  MAIN: '/reels',
  CREATE: '/reels/create',
  VIDEO: (id: string) => `/reels/${id}`,
  USER: (username: string) => `/reels/user/${username}`,
  HASHTAG: (tag: string) => `/reels/hashtag/${tag}`,
  SOUND: (soundId: string) => `/reels/sound/${soundId}`,
  TRENDING: '/reels/trending',
  FOLLOWING: '/reels/following',
} as const;

// Error messages
export const REELS_ERRORS = {
  // Video loading errors
  VIDEO_LOAD_FAILED: 'Failed to load video',
  VIDEO_NOT_FOUND: 'Video not found',
  VIDEO_UNAVAILABLE: 'Video is no longer available',
  VIDEO_PRIVATE: 'This video is private',
  VIDEO_REGION_BLOCKED: 'Video not available in your region',

  // Network errors
  NETWORK_ERROR: 'Network connection error',
  TIMEOUT_ERROR: 'Request timed out',
  SERVER_ERROR: 'Server error occurred',

  // Format/Upload errors
  UNSUPPORTED_FORMAT: 'Video format not supported',
  FILE_TOO_LARGE: 'Video file too large (max 250MB)',
  DURATION_INVALID: 'Video duration must be between 3-90 seconds',
  ASPECT_RATIO_INVALID: 'Invalid aspect ratio for Reels',
  RESOLUTION_TOO_LOW: 'Video resolution too low',

  // Permission errors
  UNAUTHORIZED: 'You are not authorized to perform this action',
  ACCOUNT_PRIVATE: 'This account is private',
  BLOCKED_USER: 'You cannot view content from this user',

  // Content errors
  CONTENT_FLAGGED: 'This content has been flagged',
  COPYRIGHT_CLAIM: 'This video contains copyrighted content',
  COMMUNITY_GUIDELINES: 'This content violates community guidelines',

  // Feature errors
  COMMENTS_DISABLED: 'Comments are disabled for this video',
  FEATURE_UNAVAILABLE: 'This feature is not available',
  QUOTA_EXCEEDED: 'You have exceeded your daily limit',

  // Generic
  UNKNOWN_ERROR: 'An unexpected error occurred',
} as const;

// Success messages
export const REELS_MESSAGES = {
  VIDEO_LIKED: 'Added to favorites',
  VIDEO_UNLIKED: 'Removed from favorites',
  VIDEO_SAVED: 'Saved to collection',
  VIDEO_UNSAVED: 'Removed from collection',
  USER_FOLLOWED: 'Now following',
  USER_UNFOLLOWED: 'Unfollowed',
  COMMENT_POSTED: 'Comment posted',
  COMMENT_DELETED: 'Comment deleted',
  VIDEO_SHARED: 'Video shared',
  VIDEO_REPORTED: 'Thanks for reporting',
  PLAYLIST_CREATED: 'Playlist created',
} as const;

// UI Text constants
export const REELS_UI = {
  BUTTONS: {
    PLAY: 'Play',
    PAUSE: 'Pause',
    LIKE: 'Like',
    UNLIKE: 'Unlike',
    SAVE: 'Save',
    UNSAVE: 'Remove from saved',
    SHARE: 'Share',
    COMMENT: 'Comment',
    FOLLOW: 'Follow',
    UNFOLLOW: 'Unfollow',
    MUTE: 'Mute',
    UNMUTE: 'Unmute',
    FULLSCREEN: 'Fullscreen',
    EXIT_FULLSCREEN: 'Exit fullscreen',
  },

  LABELS: {
    VIEWS: 'views',
    LIKES: 'likes',
    COMMENTS: 'comments',
    SHARES: 'shares',
    FOLLOWERS: 'followers',
    FOLLOWING: 'following',
    DURATION: 'Duration',
    QUALITY: 'Quality',
    PLAYBACK_SPEED: 'Playback speed',
  },

  PLACEHOLDERS: {
    SEARCH: 'Search reels...',
    COMMENT: 'Add a comment...',
    DESCRIPTION: 'Write a caption...',
  },

  SECTIONS: {
    FOR_YOU: 'For You',
    FOLLOWING: 'Following',
    TRENDING: 'Trending',
    MUSIC: 'Music',
    HASHTAGS: 'Hashtags',
    EFFECTS: 'Effects',
  },
} as const;

// Keyboard shortcuts
export const REELS_SHORTCUTS = {
  PLAY_PAUSE: 'Space',
  MUTE_UNMUTE: 'M',
  LIKE: 'L',
  COMMENT: 'C',
  SHARE: 'S',
  SAVE: 'B', // Bookmark
  FULLSCREEN: 'F',
  NEXT_VIDEO: 'ArrowDown',
  PREV_VIDEO: 'ArrowUp',
  VOLUME_UP: 'ArrowRight',
  VOLUME_DOWN: 'ArrowLeft',
  SEEK_FORWARD: 'ArrowRight',
  SEEK_BACKWARD: 'ArrowLeft',
} as const;

// Animation presets
export const REELS_ANIMATIONS = {
  LIKE_HEART: {
    scale: [0, 1.2, 1],
    opacity: [0, 1, 0],
    duration: 800,
  },
  DOUBLE_TAP_HEART: {
    scale: [0, 1.5, 0],
    opacity: [0, 1, 0],
    duration: 1000,
  },
  SLIDE_UP: {
    y: [100, 0],
    opacity: [0, 1],
    duration: 300,
  },
  SLIDE_DOWN: {
    y: [-100, 0],
    opacity: [0, 1],
    duration: 300,
  },
  FADE_IN: {
    opacity: [0, 1],
    duration: 200,
  },
  FADE_OUT: {
    opacity: [1, 0],
    duration: 200,
  },
} as const;

// Device detection constants
export const DEVICE_CONSTANTS = {
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,

  // Touch gestures
  SWIPE_THRESHOLD: 50, // px
  SWIPE_VELOCITY_THRESHOLD: 0.3, // px/ms
  PINCH_THRESHOLD: 0.1, // scale difference

  // Performance by device
  MOBILE_PRELOAD_COUNT: 2,
  TABLET_PRELOAD_COUNT: 3,
  DESKTOP_PRELOAD_COUNT: 4,
} as const;
