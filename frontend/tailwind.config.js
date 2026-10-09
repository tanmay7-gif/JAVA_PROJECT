/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Crisp Clinical Whites & Off-Whites
        'brand-white': '#FFFFFF',
        'offwhite-canvas': '#F8FAF8',
        'offwhite-muted': '#F3F6F3',
        'offwhite-surface': '#FAFCFA',
        
        // Mint & Light Green Accents
        'mint': {
          50: '#F0FDF4',
          100: '#ECFDF5',
          200: '#D1FAE5',
          300: '#A7F3D0',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        'mint-light': '#E6F4EA',
        'mint-accent': '#10B981',
        'mint-glow': '#34D399',
        'sage-muted': '#6B7280',
        'sage-border': '#D1E7DD',

        // Typography Charcoal Contrast
        'charcoal': {
          900: '#111827',
          800: '#1F2937',
          700: '#374151',
          600: '#4B5563',
          500: '#6B7280',
        },
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(16, 185, 129, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'soft-md': '0 4px 20px -2px rgba(16, 185, 129, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 30px -4px rgba(16, 185, 129, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
        'mint-glow': '0 0 25px rgba(52, 211, 153, 0.35)',
      },
      backdropBlur: {
        'clinical': '16px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
