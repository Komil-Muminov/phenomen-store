export interface ITenantConfig {
  id: string;
  key: string;
  name: string;
  brand: { title: string; logoUrl: string | null; slogan: string };
  orderRules: { minOrderTotal: number; maxItemsPerOrder: number; guestCheckout: boolean };
  delivery: { methods: string[]; freeFrom: number | null; basePrice: number };
  payment: { methods: string[]; provider: string };
  contacts: { phone: string; email: string };
}

export interface ISettingsValues {
  title: string;
  slogan: string;
  logoUrl: string;
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
