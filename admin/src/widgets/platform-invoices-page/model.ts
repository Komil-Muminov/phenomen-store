export interface IPlatformSettings {
  card: { number: string; holder: string; bank: string; note: string };
  plans: { code: string; name: string; price: number }[];
}

export const PlatformInvoicesTexts = {
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
