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

export const DEFAULT_TENANT_CONFIG: ITenantConfig = {
  id: 'demo',
  key: 'demo-fashion',
  name: 'PHENOMEN',
  vertical: 'fashion',
  brand: {
    title: 'PHENOMEN',
    logoUrl: null,
    slogan: 'Твой стиль',
  },
  theme: {
    colors: {
      primary: '#171717',
      onPrimary: '#ffffff',
      accent: '#ef4444',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#171717',
      muted: '#737373',
      border: '#e5e5e5',
      danger: '#ef4444',
      success: '#10b981',
    },
    radius: { sm: 8, md: 12, lg: 16 },
    density: 'compact',
    cardStyle: 'elevated',
  },
  locale: {
    language: 'ru',
    currency: 'TJS',
    currencySymbol: 'смн',
    timezone: 'Asia/Dushanbe',
  },
  orderRules: {},
  payment: {},
  delivery: {},
  features: { favorites: true, reviews: true, promoCodes: true, sizeGuide: true },
  contacts: {},
};
