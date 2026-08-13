export const DeliveryStatuses = [
  { value: 'pending', label: 'Ожидает отправки' },
  { value: 'assigned', label: 'Назначен курьер' },
  { value: 'in_transit', label: 'В пути' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'returned', label: 'Возвращён' },
];

export const DeliveryStatusLabels: Record<string, string> = DeliveryStatuses
  .reduce<Record<string, string>>((acc, item) => {
    acc[item.value] = item.label;

    return acc;
  }, {});

export const PaymentStates = {
  pending: 'pending',
  review: 'review',
  paid: 'paid',
  failed: 'failed',
  refunded: 'refunded',
} as const;

export const PaymentStateLabels: Record<string, string> = {
  pending: 'ожидает оплаты',
  review: 'чек на проверке',
  paid: 'оплачен',
  failed: 'оплата не принята',
  refunded: 'возврат',
};

export const PaymentStateColors: Record<string, string> = {
  pending: 'default',
  review: 'gold',
  paid: 'green',
  failed: 'red',
  refunded: 'purple',
};

export const PaymentMethodLabels: Record<string, string> = {
  card_transfer: 'Перевод на карту',
  cash_on_delivery: 'Наличными при получении',
  card_online: 'Картой онлайн',
};

export interface IDeliveryValues {
  status: string;
  courierName: string;
  courierPhone: string;
  trackingNumber: string;
  eta: string;
}

export const EMPTY_DELIVERY: IDeliveryValues = {
  status: 'pending',
  courierName: '',
  courierPhone: '',
  trackingNumber: '',
  eta: '',
};

export const readDelivery = (source: Record<string, unknown> | null): Partial<IDeliveryValues> => {
  const values = source ?? {};

  return {
    courierName: typeof values.courierName === 'string' ? values.courierName : '',
    courierPhone: typeof values.courierPhone === 'string' ? values.courierPhone : '',
    trackingNumber: typeof values.trackingNumber === 'string' ? values.trackingNumber : '',
    eta: typeof values.eta === 'string' ? values.eta : '',
  };
};

export const formatHistoryLabel = (status: string): string => (
  status.startsWith('delivery:')
    ? `Доставка: ${DeliveryStatusLabels[status.slice('delivery:'.length)] ?? status}`
    : status
);

export const OrderDrawerTexts = {
  title: 'Заказ',
  payment: 'Оплата',
  delivery: 'Доставка',
  history: 'История',
  accept: 'Подтвердить оплату',
  reject: 'Отклонить',
  rejectPlaceholder: 'Причина отказа — покупатель её увидит',
  noReceipt: 'Покупатель ещё не прикрепил чек',
  receiptNote: 'Комментарий покупателя',
  openReceipt: 'Открыть чек в новой вкладке',
  save: 'Сохранить доставку',
  courierName: 'Курьер',
  courierPhone: 'Телефон курьера',
  trackingNumber: 'Трек-номер',
  eta: 'Ожидаемая дата',
  reviewedBy: 'Проверил',
} as const;
