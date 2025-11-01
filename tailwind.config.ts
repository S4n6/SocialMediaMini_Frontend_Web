import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-dot': 'bounce-dot 1.4s ease-in-out infinite',
      },
      keyframes: {
        'bounce-dot': {
          '0%, 80%, 100%': {
            transform: 'scale(0.8)',
            opacity: '0.5',
          },
          '40%': {
            transform: 'scale(1.2)',
            opacity: '1',
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
      },
      backgroundImage: {
        shimmer:
          'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.3) 60%, rgba(255,255,255,0))',
      },
      backgroundSize: {
        shimmer: '200px 100%',
      },
      transitionTimingFunction: {
        reels: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
