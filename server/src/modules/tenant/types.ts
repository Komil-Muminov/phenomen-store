export interface ITenantRow {
  id: string;
  key: string;
  name: string;
  vertical: string;
  plan: string;
  status: string;
  bundle_id: string | null;
}

export interface ITenantConfigRow {
  tenant_id: string;
  brand: Record<string, unknown>;
  theme: Record<string, unknown>;
  locale: Record<string, unknown>;
  order_rules: Record<string, unknown>;
  payment: Record<string, unknown>;
  delivery: Record<string, unknown>;
  features: Record<string, unknown>;
  contacts: Record<string, unknown>;
}

export interface ITenantPublicConfig {
  id: string;
  key: string;
  name: string;
  vertical: string;
  brand: Record<string, unknown>;
  theme: Record<string, unknown>;
  locale: Record<string, unknown>;
  orderRules: Record<string, unknown>;
  payment: Record<string, unknown>;
  delivery: Record<string, unknown>;
  features: Record<string, unknown>;
  contacts: Record<string, unknown>;
}

export const TenantStatus = {
  active: 'active',
  suspended: 'suspended',
  archived: 'archived',
} as const;

export const CONFIG_UPDATABLE_FIELDS = [
  'brand',
  'theme',
  'locale',
  'order_rules',
  'payment',
  'delivery',
  'features',
  'contacts',
] as const;

export const DEFAULT_THEME = {
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

export const DEFAULT_LOCALE = {
  language: 'ru',
  currency: 'RUB',
  currencySymbol: '₽',
  timezone: 'Europe/Moscow',
};

export const TENANT_CACHE_TTL_MS = 60000;
