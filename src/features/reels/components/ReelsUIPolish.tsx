'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Final UI Polish Components for Reels Feature
 * Instagram 2025 style animations and micro-interactions
 */

// Animated heart for like interactions
export const AnimatedHeart: React.FC<{
  isLiked: boolean;
  size?: number;
  className?: string;
}> = ({ isLiked, size = 24, className = '' }) => {
  return (
    <motion.div
      className={`inline-flex items-center justify-center ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={isLiked ? '#ff3040' : 'none'}
        stroke={isLiked ? '#ff3040' : 'currentColor'}
        strokeWidth="2"
        initial={false}
        animate={{
          scale: isLiked ? [1, 1.3, 1] : 1,
          fill: isLiked ? '#ff3040' : 'none',
        }}
        transition={{
          duration: 0.3,
          ease: 'easeOut',
        }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </motion.svg>
    </motion.div>
  );
};

// Floating hearts animation for double-tap like
export const FloatingHearts: React.FC<{
  show: boolean;
  onComplete?: () => void;
}> = ({ show, onComplete }) => {
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>(
    [],
  );

  useEffect(() => {
    if (show) {
      const newHearts = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
      }));
      setHearts(newHearts);

      const timer = setTimeout(() => {
        setHearts([]);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute pointer-events-none z-50"
          style={{
            left: '50%',
            top: '50%',
          }}
          initial={{
            scale: 0,
            x: 0,
            y: 0,
            opacity: 1,
          }}
          animate={{
            scale: [0, 1.2, 0.8],
            x: heart.x,
            y: heart.y - 100,
            opacity: [1, 1, 0],
          }}
          exit={{
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: 2,
            ease: 'easeOut',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="#ff3040"
            className="drop-shadow-lg"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

// Ripple effect for tap interactions
export const RippleEffect: React.FC<{
  x: number;
  y: number;
  show: boolean;
  onComplete?: () => void;
}> = ({ x, y, show, onComplete }) => {
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 600);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            left: x - 50,
            top: y - 50,
            width: 100,
            height: 100,
          }}
          initial={{ scale: 0, opacity: 0.7 }}
          animate={{ scale: 2, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="w-full h-full rounded-full bg-white/20 border border-white/30" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Smooth counter animation
export const AnimatedCounter: React.FC<{
  value: number;
  className?: string;
  duration?: number;
}> = ({ value, className = '', duration = 0.5 }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const startValue = displayValue;
    const difference = value - startValue;
    const startTime = Date.now();

    const updateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + difference * easeOut);

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [value, duration, displayValue]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <motion.span
      className={className}
      key={value}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 0.3 }}
    >
      {formatNumber(displayValue)}
    </motion.span>
  );
};

// Progress ring for video progress
export const ProgressRing: React.FC<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}> = ({ progress, size = 40, strokeWidth = 3, className = '' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`inline-flex ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

// Pulse animation for active states
export const PulseAnimation: React.FC<{
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}> = ({ children, isActive = false, className = '' }) => {
  return (
    <motion.div
      className={className}
      animate={
        isActive
          ? {
              scale: [1, 1.05, 1],
              boxShadow: [
                '0 0 0 0 rgba(59, 130, 246, 0.4)',
                '0 0 0 10px rgba(59, 130, 246, 0)',
                '0 0 0 0 rgba(59, 130, 246, 0)',
              ],
            }
          : {}
      }
      transition={{
        duration: 1,
        repeat: isActive ? Infinity : 0,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

// Shake animation for errors
export const ShakeAnimation: React.FC<{
  children: React.ReactNode;
  trigger: boolean;
  className?: string;
}> = ({ children, trigger, className = '' }) => {
  return (
    <motion.div
      className={className}
      animate={
        trigger
          ? {
              x: [-10, 10, -10, 10, 0],
              transition: { duration: 0.5 },
            }
          : {}
      }
    >
      {children}
    </motion.div>
  );
};

// Slide-in animation for side panels
export const SlideInPanel: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
}> = ({ children, isOpen, direction = 'right', className = '' }) => {
  const variants = {
    hidden: {
      x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
      y: direction === 'up' ? '-100%' : direction === 'down' ? '100%' : 0,
      opacity: 0,
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={className}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={variants}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 200,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Fade transition for content changes
export const FadeTransition: React.FC<{
  children: React.ReactNode;
  keyProp: string | number;
  className?: string;
}> = ({ children, keyProp, className = '' }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyProp}
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Stagger animation for lists
export const StaggeredList: React.FC<{
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}> = ({ children, className = '', staggerDelay = 0.1 }) => {
  return (
    <motion.div className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * staggerDelay,
            duration: 0.3,
            ease: 'easeOut',
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Loading dots animation
export const LoadingDots: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}> = ({ size = 'md', color = 'currentColor', className = '' }) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${sizeClasses[size]} rounded-full`}
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Reveal animation for text
export const TextReveal: React.FC<{
  children: string;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => {
  const words = children.split(' ');

  return (
    <motion.div className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: delay + index * 0.1,
            duration: 0.3,
            ease: 'easeOut',
          }}
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

// All components are already exported inline above
