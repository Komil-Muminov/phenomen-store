import type { IPlan, IPlanState, IPlanUsageItem } from '@contracts';

export type { IPlan, IPlanState, IPlanUsageItem };

export const PlanCodes = {
  start: 'start',
  pro: 'pro',
  max: 'max',
} as const;

export const PlanLabels: Record<string, string> = {
  [PlanCodes.start]: 'Старт',
  [PlanCodes.pro]: 'Про',
  [PlanCodes.max]: 'Максимум',
};

export const PlanColors: Record<string, string> = {
  [PlanCodes.start]: 'default',
  [PlanCodes.pro]: 'blue',
  [PlanCodes.max]: 'purple',
};

export const PlanOptions = Object.values(PlanCodes).map((value) => ({
  value,
  label: PlanLabels[value],
}));

export const ResourceLabels: Record<string, string> = {
  products: 'Товары',
  banners: 'Баннеры',
  promotions: 'Акции',
  categories: 'Категории',
};

export const UNLIMITED_LABEL = 'без ограничений';

export const formatUsage = (item: IPlanUsageItem): string => (
  item.limit === null ? `${item.used} — ${UNLIMITED_LABEL}` : `${item.used} из ${item.limit}`
);

export const usagePercent = (item: IPlanUsageItem): number => (
  item.limit === null || item.limit === 0
    ? 0
    : Math.min(100, Math.round((item.used / item.limit) * 100))
);
