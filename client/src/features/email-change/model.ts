export const EmailChangeSteps = {
  email: 'email',
  code: 'code',
} as const;

export type TEmailChangeStep = (typeof EmailChangeSteps)[keyof typeof EmailChangeSteps];

export const EmailChangeTexts = {
  current: 'Почта для входа',
  action: 'Изменить',
  title: 'Смена почты',
  emailSubtitle: 'Код придёт на новый адрес — старый останется рабочим, пока вы его не подтвердите',
  codeSubtitle: 'Введите код, отправленный на',
  emailLabel: 'Новый адрес',
  emailPlaceholder: 'name@example.com',
  codeLabel: 'Код из письма',
  codePlaceholder: '0000',
  sendCode: 'Получить код',
  confirm: 'Подтвердить',
  cancel: 'Отмена',
  changed: 'Почта изменена',
  devCodeHint: 'Тестовый код',
  notDelivered: 'Отправка писем не настроена — код показан ниже',
} as const;

export const CODE_LENGTH = 4;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isEmailValid = (email: string): boolean => EMAIL_PATTERN.test(email.trim());

export const isCodeValid = (code: string): boolean => code.trim().length === CODE_LENGTH;
