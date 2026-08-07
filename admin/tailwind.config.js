export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#7C3AED',
          secondary: '#A78BFA',
          cta: '#F97316',
          surface: '#FAF5FF',
          text: '#4C1D95',
        },
      },
      fontFamily: {
        sans: ['"Fira Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
};
