import { IThemeTokens } from '@/entities/tenant';
import { FALLBACK_THEME, ThemeVarNames } from '@/shared/theme/model';

export const normalizeTheme = (theme?: Partial<IThemeTokens> | null): IThemeTokens => ({
  colors: { ...FALLBACK_THEME.colors, ...(theme?.colors ?? {}) },
  radius: { ...FALLBACK_THEME.radius, ...(theme?.radius ?? {}) },
  density: theme?.density ?? FALLBACK_THEME.density,
  cardStyle: theme?.cardStyle ?? FALLBACK_THEME.cardStyle,
});

export const buildThemeVars = (theme: IThemeTokens): Record<string, string> => ({
  [ThemeVarNames.primary]: theme.colors.primary,
  [ThemeVarNames.onPrimary]: theme.colors.onPrimary,
  [ThemeVarNames.accent]: theme.colors.accent,
  [ThemeVarNames.background]: theme.colors.background,
  [ThemeVarNames.surface]: theme.colors.surface,
  [ThemeVarNames.text]: theme.colors.text,
  [ThemeVarNames.muted]: theme.colors.muted,
  [ThemeVarNames.border]: theme.colors.border,
  [ThemeVarNames.danger]: theme.colors.danger,
  [ThemeVarNames.success]: theme.colors.success,
  [ThemeVarNames.radiusSm]: `${theme.radius.sm}px`,
  [ThemeVarNames.radiusMd]: `${theme.radius.md}px`,
  [ThemeVarNames.radiusLg]: `${theme.radius.lg}px`,
});
