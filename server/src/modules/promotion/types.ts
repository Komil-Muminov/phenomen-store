export interface IPromotionRow {
  id: string;
  code: string | null;
  name: string;
  kind: string;
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>;
  priority: number;
  usage_limit: number | null;
  usage_count: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}

export interface IPromotionInput {
  code: string | null;
  name: string;
  kind: string;
  minTotal: number;
  percent: number;
  amount: number;
  priority: number;
  usageLimit: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}

export interface IPromotionFilters {
  search: string | null;
  isActive: boolean | null;
}

export const PromotionPaths = {
  manageSearch: '/manage/search',
} as const;

export const PromotionKinds = {
  cartPercent: 'cart_percent',
  cartFixed: 'cart_fixed',
  freeDelivery: 'free_delivery',
} as const;

export const PromotionDefaults = {
  priority: 0,
  percentMax: 100,
  amountMax: 100000000,
  nameMaxLength: 120,
  codeMaxLength: 40,
} as const;

export const PromotionErrors = {
  nameRequired: 'Укажите название акции',
  kindInvalid: 'Неизвестный тип акции',
  codeInvalid: 'Код: латиница, цифры, дефис — от 3 до 40 символов',
  codeTaken: 'Акция с таким кодом уже есть',
  percentInvalid: 'Процент скидки — от 1 до 100',
  amountInvalid: 'Сумма скидки должна быть больше нуля',
  datesInvalid: 'Дата окончания раньше даты начала',
  limitInvalid: 'Лимит использований должен быть больше нуля',
} as const;

export const CODE_PATTERN = /^[A-Z0-9-]{3,40}$/;
