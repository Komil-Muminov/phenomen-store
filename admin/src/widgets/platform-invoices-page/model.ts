export interface IPlatformSettings {
  card: { number: string; holder: string; bank: string; note: string };
  plans: { code: string; name: string; price: number }[];
}

export interface IBillingSettings {
  graceDays: number;
  autoBlock: boolean;
  remindDays: number;
}

export interface IBlockedTenant {
  id: string;
  key: string;
  name: string;
  blockedAt: string;
  reason: string | null;
  overdueCount: number;
  overdueAmount: number;
}

export interface IBlockedList {
  items: IBlockedTenant[];
}

export const PlatformInvoicesTexts = {
  billingTitle: 'Автоблокировка за неоплату',
  graceDays: 'Отсрочка после срока оплаты',
  graceHint: 'Столько дней магазин работает после просрочки',
  remindDays: 'Напомнить об оплате за',
  remindHint: 'Владельцу магазина придёт уведомление и письмо',
  autoBlock: 'Блокировать автоматически',
  saveBilling: 'Сохранить правило',
  runCheck: 'Проверить сейчас',
  billingSaved: 'Правило сохранено',
  checked: 'Проверка выполнена',
  blockedTitle: 'Заблокированные магазины',
  blockedEmpty: 'Заблокированных магазинов нет',
  release: 'Разблокировать',
  released: 'Магазин разблокирован',
  title: 'Счета магазинам',
  subtitle: 'Оплата тарифа переводом на карту платформы',
  searchPlaceholder: 'Номер счёта, название или ключ магазина',
  issue: 'Выставить счёт',
  issued: 'Счёт выставлен',
  accepted: 'Оплата подтверждена, тариф магазина обновлён',
  rejected: 'Оплата отклонена',
  cancelled: 'Счёт отменён',
  cardTitle: 'Карта платформы для приёма оплаты',
  cardHint: 'Магазины увидят эти реквизиты в своём кабинете',
  cardSaved: 'Реквизиты сохранены',
  number: 'Номер карты',
  holder: 'Владелец',
  bank: 'Банк',
  note: 'Примечание',
  saveCard: 'Сохранить реквизиты',
} as const;
