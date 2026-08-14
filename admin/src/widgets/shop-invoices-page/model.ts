export interface IPlatformCard {
  number: string;
  holder: string;
  bank: string;
  note: string;
}

export interface IPlatformCardResponse {
  card: IPlatformCard;
}

export const ShopInvoicesTexts = {
  title: 'Счета за тариф',
  subtitle: 'Оплата платформы переводом на карту',
  searchPlaceholder: 'Номер счёта или период',
  cardTitle: 'Куда переводить',
  cardEmpty: 'Платформа пока не указала реквизиты — напишите в поддержку',
  number: 'Номер карты',
  holder: 'Получатель',
  bank: 'Банк',
  attach: 'Прикрепить чек',
  replace: 'Заменить чек',
  send: 'Отправить чек',
  notePlaceholder: 'Комментарий для платформы',
  sent: 'Чек отправлен, платформа проверит оплату',
  hint: 'Переведите сумму на карту платформы и прикрепите скриншот перевода',
} as const;
