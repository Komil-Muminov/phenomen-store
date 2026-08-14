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

export interface ITenantOrderRules {
  minOrderTotal: number;
  maxItemsPerOrder: number;
  guestCheckout: boolean;
}

export interface ITenantDelivery {
  methods: string[];
  freeFrom: number | null;
  basePrice: number;
}

export interface IPaymentCard {
  number: string;
  holder: string;
  bank: string;
  note: string;
}

export interface ITenantPayment {
  methods: string[];
  provider: string;
  card?: IPaymentCard;
}

export interface ITenantContacts {
  phone: string;
  email: string;
}

export interface ITenantTheme {
  colors: Record<string, string>;
  radius: Record<string, number>;
  density: string;
  cardStyle: string;
}

export interface ITenantConfig {
  id: string;
  key: string;
  name: string;
  vertical: string;
  brand: ITenantBrand;
  theme: ITenantTheme;
  locale: ITenantLocale;
  orderRules: ITenantOrderRules;
  payment: ITenantPayment;
  delivery: ITenantDelivery;
  features: Record<string, boolean>;
  contacts: ITenantContacts;
  blocked: boolean;
}

export interface ITenantConfigPatch {
  brand?: Partial<ITenantBrand>;
  theme?: Partial<ITenantTheme>;
  locale?: Partial<ITenantLocale>;
  orderRules?: Partial<ITenantOrderRules>;
  payment?: Partial<ITenantPayment>;
  delivery?: Partial<ITenantDelivery>;
  features?: Record<string, boolean>;
  contacts?: Partial<ITenantContacts>;
}
