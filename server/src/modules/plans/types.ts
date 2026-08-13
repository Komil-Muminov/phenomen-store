export const PlanPaths = {
  catalog: '/catalog',
  current: '/current',
} as const;

export const PlanCodes = {
  start: 'start',
  pro: 'pro',
  max: 'max',
} as const;

export const PlanResources = {
  products: 'products',
  banners: 'banners',
  promotions: 'promotions',
  categories: 'categories',
} as const;

export type TPlanResource = (typeof PlanResources)[keyof typeof PlanResources];

export type TPlanLimits = Record<TPlanResource, number | null>;

export interface IPlan {
  code: string;
  name: string;
  description: string;
  price: number;
  limits: TPlanLimits;
}

export const Plans: IPlan[] = [
  {
    code: PlanCodes.start,
    name: 'Старт',
    description: 'Небольшой магазин: витрина, заказы и базовая аналитика',
    price: 0,
    limits: { products: 100, banners: 3, promotions: 3, categories: 20 },
  },
  {
    code: PlanCodes.pro,
    name: 'Про',
    description: 'Растущий магазин: большой каталог, акции и баннеры',
    price: 490,
    limits: { products: 1000, banners: 10, promotions: 20, categories: 100 },
  },
  {
    code: PlanCodes.max,
    name: 'Максимум',
    description: 'Без ограничений по каталогу, баннерам и акциям',
    price: 1490,
    limits: { products: null, banners: null, promotions: null, categories: null },
  },
];

export const DEFAULT_PLAN = PlanCodes.start;

export const ResourceLabels: Record<TPlanResource, string> = {
  products: 'товаров',
  banners: 'баннеров',
  promotions: 'акций',
  categories: 'категорий',
};

export const PlanErrors = {
  unknownPlan: 'Неизвестный тариф',
} as const;

export const buildLimitMessage = (resource: TPlanResource, limit: number): string => (
  `На вашем тарифе можно не больше ${limit} ${ResourceLabels[resource]}. Обратитесь в поддержку платформы, чтобы расширить тариф.`
);

export interface IPlanUsage {
  resource: TPlanResource;
  used: number;
  limit: number | null;
}
