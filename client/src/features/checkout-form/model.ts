import { DeliveryMethods } from '@/entities/cart';

export interface ICheckoutForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  slot: string;
  comment: string;
  deliveryMethod: string;
  paymentMethod: string;
}

export type TCheckoutField = keyof ICheckoutForm;

export const EMPTY_FORM: ICheckoutForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  slot: '',
  comment: '',
  deliveryMethod: DeliveryMethods.courier,
  paymentMethod: '',
};

export const FieldLabels: Record<string, string> = {
  name: 'Имя получателя',
  phone: 'Телефон',
  email: 'E-mail',
  address: 'Адрес доставки',
  comment: 'Комментарий к заказу',
};

export const SectionLabels = {
  contacts: 'Контакты',
  delivery: 'Доставка',
  payment: 'Оплата',
  submit: 'Подтвердить заказ',
} as const;

const PHONE_MIN_DIGITS = 10;

export const validateForm = (form: ICheckoutForm): Partial<Record<TCheckoutField, string>> => {
  const errors: Partial<Record<TCheckoutField, string>> = {};

  if (form.name.trim().length < 2) {
    errors.name = 'Укажите имя';
  }

  if (form.phone.replace(/\D/g, '').length < PHONE_MIN_DIGITS) {
    errors.phone = 'Укажите корректный телефон';
  }

  if (form.deliveryMethod === DeliveryMethods.courier && form.address.trim().length < 5) {
    errors.address = 'Укажите адрес доставки';
  }

  if (!form.paymentMethod) {
    errors.paymentMethod = 'Выберите способ оплаты';
  }

  return errors;
};

export const buildOrderPayload = (form: ICheckoutForm) => ({
  customer: {
    name: form.name.trim(),
    phone: form.phone.trim(),
    email: form.email.trim() || null,
  },
  delivery: {
    method: form.deliveryMethod,
    address: form.address.trim() || null,
    slot: form.slot.trim() || null,
    comment: form.comment.trim() || null,
  },
  paymentMethod: form.paymentMethod,
  comment: form.comment.trim() || null,
});
