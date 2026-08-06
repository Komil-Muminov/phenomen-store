export interface IThemeColors {
  primary: string;
  onPrimary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  danger: string;
  success: string;
}

export interface IThemeRadius {
  sm: number;
  md: number;
  lg: number;
}

export interface IThemeTokens {
  colors: IThemeColors;
  radius: IThemeRadius;
  density: string;
  cardStyle: string;
}

export interface ITenantBrand {
  title: string;
  logoUrl: string | null;
  slogan: string;
}

export interface ITenantLocale {
  language: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
}

export interface ITenantFeatures {
  favorites: boolean;
  reviews: boolean;
  promoCodes: boolean;
  sizeGuide: boolean;
}

export interface ITenantConfig {
  id: string;
  key: string;
  name: string;
  vertical: string;
  brand: ITenantBrand;
  theme: IThemeTokens;
  locale: ITenantLocale;
  orderRules: Record<string, unknown>;
  payment: Record<string, unknown>;
  delivery: Record<string, unknown>;
  features: ITenantFeatures;
  contacts: Record<string, string>;
}
