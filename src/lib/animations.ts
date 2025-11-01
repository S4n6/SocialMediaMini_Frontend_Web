// Animation utilities for messaging components using Tailwind CSS

// Animation Classes
export const animationClasses = {
  // Slide animations
  'animate-slide-in-left': 'animate-[slideInLeft_0.3s_ease-out]',
  'animate-slide-in-right': 'animate-[slideInRight_0.3s_ease-out]',
  'animate-slide-in-up': 'animate-[slideInUp_0.3s_ease-out]',
  'animate-slide-in-down': 'animate-[slideInDown_0.3s_ease-out]',

  // Fade animations
  'animate-fade-in': 'animate-[fadeIn_0.2s_ease-out]',
  'animate-fade-in-scale': 'animate-[fadeInScale_0.2s_ease-out]',

  // Bounce animations
  'animate-bounce-in': 'animate-[bounceIn_0.6s_ease-out]',

  // Utility animations
  'animate-shake': 'animate-[shake_0.5s_ease-in-out]',
  'animate-pulse-soft': 'animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]',
  'animate-shimmer': 'animate-[shimmer_2s_linear_infinite]',
  'animate-typing': 'animate-[typing_1.4s_ease-in-out_infinite]',
  'animate-message-appear': 'animate-[messageAppear_0.3s_ease-out]',
  'animate-notification': 'animate-[notificationSlide_4s_ease-in-out]',
  'animate-loading-dots': 'animate-[loadingDots_1.4s_ease-in-out_infinite]',
};

// Transition Classes
export const transitionClasses = {
  // Duration
  'transition-fast': 'transition-all duration-150 ease-out',
  'transition-normal': 'transition-all duration-200 ease-out',
  'transition-slow': 'transition-all duration-300 ease-out',
  'transition-slower': 'transition-all duration-500 ease-out',

  // Easing
  'transition-bounce':
    'transition-all duration-200 cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  'transition-smooth':
    'transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)',

  // Specific properties
  'transition-colors-fast': 'transition-colors duration-150 ease-out',
  'transition-transform': 'transition-transform duration-200 ease-out',
  'transition-opacity': 'transition-opacity duration-200 ease-out',
  'transition-shadow': 'transition-shadow duration-200 ease-out',
};

// Hover Effects
export const hoverEffects = {
  'hover-lift':
    'hover:transform hover:-translate-y-1 hover:shadow-lg transition-all duration-200',
  'hover-scale': 'hover:scale-105 transition-transform duration-200',
  'hover-glow':
    'hover:shadow-md hover:shadow-primary/25 transition-shadow duration-200',
  'hover-bg-shift': 'hover:bg-muted/80 transition-colors duration-200',
  'hover-border': 'hover:border-primary/50 transition-colors duration-200',
};

// Focus Effects
export const focusEffects = {
  'focus-ring':
    'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
  'focus-glow':
    'focus:shadow-md focus:shadow-primary/25 transition-shadow duration-200',
  'focus-scale': 'focus:scale-105 transition-transform duration-200',
};

// Loading States
export const loadingStates = {
  'loading-shimmer':
    'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] animate-shimmer',
  'loading-pulse': 'animate-pulse bg-muted',
  'loading-dots': 'inline-flex space-x-1',
  'loading-spinner':
    'animate-spin rounded-full border-2 border-muted border-t-primary',
};

// Mobile Optimizations
export const mobileOptimized = {
  'touch-target': 'min-h-[44px] min-w-[44px]', // iOS/Android recommended touch target
  'tap-highlight': 'tap-highlight-transparent', // Remove tap highlight on mobile
  'scroll-smooth': 'scroll-smooth overflow-y-auto',
  'safe-area': 'pb-safe-area-inset-bottom pt-safe-area-inset-top',
};

// Combined utility function
export function getAnimationClass(
  animation: keyof typeof animationClasses,
): string {
  return animationClasses[animation] || '';
}

export function getTransitionClass(
  transition: keyof typeof transitionClasses,
): string {
  return transitionClasses[transition] || '';
}

export function getHoverEffect(effect: keyof typeof hoverEffects): string {
  return hoverEffects[effect] || '';
}

export function getFocusEffect(effect: keyof typeof focusEffects): string {
  return focusEffects[effect] || '';
}

export function getLoadingState(state: keyof typeof loadingStates): string {
  return loadingStates[state] || '';
}

export function getMobileOptimization(
  opt: keyof typeof mobileOptimized,
): string {
  return mobileOptimized[opt] || '';
}
