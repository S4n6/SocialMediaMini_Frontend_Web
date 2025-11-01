import { cn } from '@/lib/utils';

// Responsive Design Utilities
export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Mobile-first responsive classes
export const responsiveClasses = {
  // Container classes
  container: {
    mobile: 'px-4 py-2',
    tablet: 'md:px-6 md:py-4',
    desktop: 'lg:px-8 lg:py-6',
  },

  // Grid layouts
  grid: {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-2',
    desktop: 'lg:grid-cols-3 xl:grid-cols-4',
  },

  // Typography
  text: {
    heading: 'text-lg md:text-xl lg:text-2xl',
    body: 'text-sm md:text-base',
    caption: 'text-xs md:text-sm',
  },

  // Spacing
  spacing: {
    xs: 'space-y-2 md:space-y-3',
    sm: 'space-y-3 md:space-y-4',
    md: 'space-y-4 md:space-y-6',
    lg: 'space-y-6 md:space-y-8',
  },

  // Message layout
  message: {
    container: 'px-3 py-2 md:px-4 md:py-3',
    maxWidth: 'max-w-[85%] md:max-w-[70%] lg:max-w-[60%]',
    avatar: 'w-8 h-8 md:w-10 md:h-10',
    bubble: 'px-3 py-2 md:px-4 md:py-3 text-sm md:text-base',
  },

  // Search interface
  search: {
    input: 'h-10 md:h-12 text-sm md:text-base',
    results: 'max-h-[60vh] md:max-h-[70vh]',
    filters: 'p-3 md:p-4 space-y-3 md:space-y-4',
  },

  // Dialog/Modal
  dialog: {
    content: 'w-[95vw] max-w-md md:w-full md:max-w-lg lg:max-w-xl',
    padding: 'p-4 md:p-6',
    header: 'pb-3 md:pb-4',
  },

  // Navigation
  nav: {
    height: 'h-14 md:h-16',
    padding: 'px-4 md:px-6',
    gap: 'space-x-2 md:space-x-4',
  },
};

// Touch-friendly mobile optimizations
export const touchOptimizations = {
  // Recommended touch target sizes
  touchTarget: {
    small: 'min-h-[44px] min-w-[44px]', // iOS/Android minimum
    medium: 'min-h-[48px] min-w-[48px]', // Comfortable size
    large: 'min-h-[56px] min-w-[56px]', // Easy to tap
  },

  // Touch interactions
  interaction: {
    tapHighlight: '-webkit-tap-highlight-color: transparent',
    touchAction: 'touch-action: manipulation',
    userSelect: 'user-select: none',
  },

  // Scroll behavior
  scroll: {
    smooth: 'scroll-smooth',
    momentum: '-webkit-overflow-scrolling: touch',
    hide: 'scrollbar-hide',
  },

  // Safe areas (for notched devices)
  safeArea: {
    top: 'pt-safe-area-inset-top',
    bottom: 'pb-safe-area-inset-bottom',
    left: 'pl-safe-area-inset-left',
    right: 'pr-safe-area-inset-right',
    all: 'p-safe-area-inset',
  },
};

// Device-specific styles
export const deviceStyles = {
  // Mobile phones
  mobile: {
    maxWidth: 'max-w-sm',
    fontSize: 'text-sm',
    padding: 'p-3',
    margin: 'm-2',
    borderRadius: 'rounded-lg',
  },

  // Tablets
  tablet: {
    maxWidth: 'md:max-w-2xl',
    fontSize: 'md:text-base',
    padding: 'md:p-4',
    margin: 'md:m-4',
    borderRadius: 'md:rounded-xl',
  },

  // Desktop
  desktop: {
    maxWidth: 'lg:max-w-4xl',
    fontSize: 'lg:text-lg',
    padding: 'lg:p-6',
    margin: 'lg:m-6',
    borderRadius: 'lg:rounded-2xl',
  },
};

// Performance optimizations
export const performanceOptimizations = {
  // GPU acceleration
  gpu: 'transform-gpu',
  willChange: 'will-change-transform',

  // Reduce layout thrashing
  contain: 'contain-layout contain-style',

  // Virtual scrolling hints
  scrolling: 'overscroll-contain',

  // Image optimization
  image: 'object-cover object-center',

  // Content visibility
  contentVisibility: 'content-visibility: auto',
};

// Accessibility improvements
export const accessibilityFeatures = {
  // Focus management
  focus: {
    visible:
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    trap: 'focus:outline-none',
    skip: 'sr-only focus:not-sr-only',
  },

  // Screen reader support
  screenReader: {
    only: 'sr-only',
    announce: 'aria-live="polite"',
    assertive: 'aria-live="assertive"',
  },

  // High contrast mode
  highContrast: {
    border: 'border-2 border-transparent hover:border-current',
    background: 'bg-background text-foreground',
  },

  // Reduced motion
  reducedMotion: {
    noAnimation: 'motion-reduce:animate-none',
    noTransition: 'motion-reduce:transition-none',
  },
};

// Utility functions
export function getResponsiveClass(
  category: keyof typeof responsiveClasses,
  key: string,
): string {
  const categoryClasses = responsiveClasses[category] as Record<string, string>;
  return categoryClasses[key] || '';
}

export function getTouchOptimization(
  category: keyof typeof touchOptimizations,
  key: string,
): string {
  const categoryClasses = touchOptimizations[category] as Record<
    string,
    string
  >;
  return categoryClasses[key] || '';
}

export function getDeviceStyle(
  device: keyof typeof deviceStyles,
  property: string,
): string {
  const deviceClasses = deviceStyles[device] as Record<string, string>;
  return deviceClasses[property] || '';
}

export function combineResponsiveClasses(
  ...classes: (string | undefined)[]
): string {
  return cn(...classes.filter(Boolean));
}

// Pre-built responsive patterns
export const responsivePatterns = {
  // Message components
  messageContainer: combineResponsiveClasses(
    responsiveClasses.message.container,
    touchOptimizations.touchTarget.medium,
    accessibilityFeatures.focus.visible,
  ),

  messageBubble: combineResponsiveClasses(
    responsiveClasses.message.bubble,
    performanceOptimizations.gpu,
    accessibilityFeatures.reducedMotion.noAnimation,
  ),

  // Search components
  searchInput: combineResponsiveClasses(
    responsiveClasses.search.input,
    touchOptimizations.touchTarget.large,
    accessibilityFeatures.focus.visible,
  ),

  searchResults: combineResponsiveClasses(
    responsiveClasses.search.results,
    touchOptimizations.scroll.smooth,
    performanceOptimizations.scrolling,
  ),

  // Dialog components
  dialogContent: combineResponsiveClasses(
    responsiveClasses.dialog.content,
    responsiveClasses.dialog.padding,
    touchOptimizations.safeArea.all,
  ),

  // Navigation components
  navContainer: combineResponsiveClasses(
    responsiveClasses.nav.height,
    responsiveClasses.nav.padding,
    touchOptimizations.safeArea.top,
  ),

  // Interactive elements
  interactiveElement: combineResponsiveClasses(
    touchOptimizations.touchTarget.medium,
    accessibilityFeatures.focus.visible,
    performanceOptimizations.gpu,
  ),

  // Mobile-optimized cards
  mobileCard: combineResponsiveClasses(
    deviceStyles.mobile.padding,
    deviceStyles.mobile.borderRadius,
    deviceStyles.tablet.padding,
    deviceStyles.tablet.borderRadius,
    touchOptimizations.touchTarget.medium,
  ),
};

export default {
  responsive: responsiveClasses,
  touch: touchOptimizations,
  device: deviceStyles,
  performance: performanceOptimizations,
  accessibility: accessibilityFeatures,
  patterns: responsivePatterns,
};
