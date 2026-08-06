import { IThemeTokens } from '@/entities/tenant';

export const ThemeVarNames = {
  primary: '--color-primary',
  onPrimary: '--color-on-primary',
  accent: '--color-accent',
  background: '--color-background',
  surface: '--color-surface',
  text: '--color-text',
  muted: '--color-muted',
  border: '--color-border',
  danger: '--color-danger',
  success: '--color-success',
  radiusSm: '--radius-sm',
  radiusMd: '--radius-md',
  radiusLg: '--radius-lg',
} as const;

export const FALLBACK_THEME: IThemeTokens = {
  colors: {
    primary: '#111827',
    onPrimary: '#ffffff',
    accent: '#e11d48',
    background: '#ffffff',
    surface: '#f6f6f7',
    text: '#0f172a',
    muted: '#6b7280',
    border: '#e5e7eb',
    danger: '#dc2626',
    success: '#16a34a',
  },
  radius: { sm: 8, md: 14, lg: 22 },
  density: 'comfortable',
  cardStyle: 'elevated',
};
