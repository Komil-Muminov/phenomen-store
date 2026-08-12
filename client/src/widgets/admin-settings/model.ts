export interface ITenantConfig {
  id: string;
  key: string;
  name: string;
  brand: { title: string; logoUrl: string | null; slogan: string };
  theme: { colors: Record<string, string> };
  orderRules: { minOrderTotal: number; maxItemsPerOrder: number; guestCheckout: boolean };
  delivery: { methods: string[]; freeFrom: number | null; basePrice: number };
  payment: { methods: string[]; provider: string };
  contacts: { phone: string; email: string };
}

export interface ISettingsValues {
  title: string;
  slogan: string;
  logoUrl: string;
  colors: Record<string, string>;
  minOrderTotal: string;
  maxItemsPerOrder: string;
  guestCheckout: boolean;
  deliveryMethods: string[];
  deliveryBasePrice: string;
  deliveryFreeFrom: string;
  paymentMethods: string[];
  phone: string;
  email: string;
}

export const ColorFields = [
  { key: 'primary', label: 'Основной', fallback: '#111827' },
  { key: 'accent', label: 'Акцент', fallback: '#e11d48' },
  { key: 'background', label: 'Фон', fallback: '#ffffff' },
  { key: 'text', label: 'Текст', fallback: '#0f172a' },
] as const;

export const ColorPresets = [
  '#111827',
  '#4f46e5',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#e11d48',
  '#7c3aed',
  '#0f172a',
  '#64748b',
  '#ffffff',
] as const;

const HEX_PATTERN = /^#[0-9a-f]{6}$/i;

export const maskHex = (raw: string): string => {
  const clean = raw.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);

  return `#${clean}`;
};

export const isHexValid = (value: string): boolean => HEX_PATTERN.test(value);

export const DeliveryMethodOptions = [
  { value: 'courier', label: 'Курьером' },
  { value: 'pickup', label: 'Самовывоз' },
] as const;

export const PaymentMethodOptions = [
  { value: 'card_online', label: 'Картой онлайн' },
  { value: 'cash_on_delivery', label: 'При получении' },
] as const;

export const SettingsTexts = {
  title: 'Настройки',
  brandBlock: 'Бренд',
  ordersBlock: 'Заказы и доставка',
  contactsBlock: 'Контакты поддержки',
  shopTitle: 'Название магазина',
  slogan: 'Слоган',
  logo: 'Логотип',
  colorsBlock: 'Цвета приложения',
  colorsHint: 'Выберите из палитры или впишите свой HEX',
  addLogo: 'Выбрать файл',
  replaceLogo: 'Заменить',
  removeLogo: 'Убрать',
  minOrderTotal: 'Минимальная сумма заказа',
  minOrderHint: '0 — без ограничений',
  maxItems: 'Максимум позиций в заказе',
  guestCheckout: 'Заказ без регистрации',
  deliveryMethods: 'Способы доставки',
  basePrice: 'Стоимость доставки',
  freeFrom: 'Бесплатно от суммы',
  freeFromHint: 'Пусто — бесплатной доставки нет',
  paymentMethods: 'Способы оплаты',
  phone: 'Телефон поддержки',
  email: 'Email поддержки',
  save: 'Сохранить настройки',
  saved: 'Настройки сохранены',
} as const;

const toText = (value: number | null | undefined): string => (
  value === null || value === undefined ? '' : String(value)
);

export const toSettingsValues = (config: ITenantConfig): ISettingsValues => ({
  title: config.brand?.title ?? '',
  slogan: config.brand?.slogan ?? '',
  logoUrl: config.brand?.logoUrl ?? '',
  colors: ColorFields.reduce<Record<string, string>>(
    (acc, field) => ({ ...acc, [field.key]: config.theme?.colors?.[field.key] ?? field.fallback }),
    {},
  ),
  minOrderTotal: toText(config.orderRules?.minOrderTotal),
  maxItemsPerOrder: toText(config.orderRules?.maxItemsPerOrder),
  guestCheckout: config.orderRules?.guestCheckout !== false,
  deliveryMethods: config.delivery?.methods ?? [],
  deliveryBasePrice: toText(config.delivery?.basePrice),
  deliveryFreeFrom: toText(config.delivery?.freeFrom),
  paymentMethods: config.payment?.methods ?? [],
  phone: config.contacts?.phone ?? '',
  email: config.contacts?.email ?? '',
});

export const toSettingsPatch = (values: ISettingsValues) => ({
  brand: {
    title: values.title.trim(),
    slogan: values.slogan.trim(),
    logoUrl: values.logoUrl.trim() ? values.logoUrl.trim() : null,
  },
  theme: {
    colors: Object.entries(values.colors).reduce<Record<string, string>>(
      (acc, [key, value]) => (isHexValid(value) ? { ...acc, [key]: value.toLowerCase() } : acc),
      {},
    ),
  },
  orderRules: {
    minOrderTotal: Number(values.minOrderTotal) || 0,
    maxItemsPerOrder: Number(values.maxItemsPerOrder) || 0,
    guestCheckout: values.guestCheckout,
  },
  delivery: {
    methods: values.deliveryMethods,
    basePrice: Number(values.deliveryBasePrice) || 0,
    freeFrom: values.deliveryFreeFrom ? Number(values.deliveryFreeFrom) : null,
  },
  payment: {
    methods: values.paymentMethods,
  },
  contacts: {
    phone: values.phone.trim(),
    email: values.email.trim(),
  },
});

export const toggleMethod = (methods: string[], value: string): string[] => (
  methods.includes(value) ? methods.filter((item) => item !== value) : [...methods, value]
);

export const PASSWORD_MIN_LENGTH = 8;

export const PasswordTexts = {
  title: 'Пароль для входа',
  subtitle: 'Смените пароль, который выдали при создании магазина',
  current: 'Текущий пароль',
  next: 'Новый пароль',
  repeat: 'Повторите новый',
  hint: `Минимум ${PASSWORD_MIN_LENGTH} символов`,
  mismatch: 'Пароли не совпадают',
  submit: 'Сменить пароль',
  changed: 'Пароль изменён',
} as const;

export const isPasswordValid = (current: string, next: string): boolean => (
  current.length > 0 && next.length >= PASSWORD_MIN_LENGTH && current !== next
);
