export const BillingPaths = {
  run: '/run',
  settings: '/settings',
  blocked: '/blocked',
} as const;

export const BillingDefaults = {
  graceDays: 3,
  autoBlock: true,
  intervalMinutes: 60,
} as const;

export const BillingLimits = {
  graceDaysMax: 60,
} as const;

export const BlockReasons = {
  overdue: 'Тариф не оплачен в срок',
} as const;

export const BillingErrors = {
  blocked: 'Магазин временно не принимает заказы и изменения',
} as const;

export interface IBillingSettings {
  graceDays: number;
  autoBlock: boolean;
}

export interface IBlockedTenantRow {
  id: string;
  key: string;
  name: string;
  blocked_at: string;
  block_reason: string | null;
  overdue_count: string;
  overdue_amount: string;
}

export interface IBillingRunResult {
  blocked: string[];
  unblocked: string[];
  checkedAt: string;
}
