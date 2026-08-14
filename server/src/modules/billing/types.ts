export const BillingPaths = {
  run: '/run',
  settings: '/settings',
  blocked: '/blocked',
} as const;

export const BillingDefaults = {
  graceDays: 3,
  autoBlock: true,
  remindDays: 3,
  intervalMinutes: 60,
} as const;

export const BillingLimits = {
  graceDaysMax: 60,
  remindDaysMax: 30,
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
  remindDays: number;
}

export interface IReminderRow {
  id: string;
  tenant_id: string;
  number: string;
  period: string;
  amount: string;
  currency: string;
  due_date: string;
  days_left: number;
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
  reminded: string[];
  checkedAt: string;
}

export const ReminderTexts = {
  title: 'Скоро срок оплаты тарифа',
  body: (number: string, period: string, dueDate: string, daysLeft: number): string => (
    daysLeft === 0
      ? `Счёт ${number} за ${period} нужно оплатить сегодня, ${dueDate}.`
      : `Счёт ${number} за ${period} нужно оплатить до ${dueDate} — осталось дней: ${daysLeft}.`
  ),
  subject: (number: string): string => `Счёт ${number}: скоро срок оплаты`,
  letter: (
    shop: string,
    number: string,
    amount: string,
    dueDate: string,
  ): string => (
    `Магазин «${shop}».\n\nСчёт ${number} на сумму ${amount} нужно оплатить до ${dueDate}.\n`
    + 'Переведите сумму на карту платформы и прикрепите чек в разделе «Счета» кабинета.\n'
    + 'После срока оплаты магазин будет временно заблокирован.'
  ),
} as const;
