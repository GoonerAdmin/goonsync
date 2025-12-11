/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base colors
        'dark-base': '#0a0a0f',
        'dark-secondary': '#12121a',
        'dark-tertiary': '#1a1a24',
        
        // XP Green
        'xp-green': {
          DEFAULT: '#00ff88',
          dark: '#00cc6a',
          light: '#33ffaa',
        },
        
        // Achievement/Rarity colors
        'achievement-gold': '#ffd700',
        'rarity-common': '#9ca3af',
        'rarity-rare': '#a855f7',
        'rarity-epic': '#3b82f6',
        'rarity-legendary': '#ff6b35',
      },
      backgroundImage: {
        'xp-gradient': 'linear-gradient(90deg, #00ff88 0%, #00cc6a 100%)',
        'legendary-gradient': 'linear-gradient(135deg, #ff6b35 0%, #ffd700 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.3)',
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.3)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      animation: {
        'float-up': 'floatUp 1s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        floatUp: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-50px)', opacity: '0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 136, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
