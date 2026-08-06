module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        onPrimary: 'var(--color-on-primary)',
        accent: 'var(--color-accent)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        content: 'var(--color-text)',
        muted: 'var(--color-muted)',
        line: 'var(--color-border)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
      },
      borderRadius: {
        brandSm: 'var(--radius-sm)',
        brandMd: 'var(--radius-md)',
        brandLg: 'var(--radius-lg)',
      },
    },
  },
  plugins: [],
};
