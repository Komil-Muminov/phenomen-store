export const AuthSteps = {
  email: 'email',
  code: 'code',
} as const;

export type TAuthStep = (typeof AuthSteps)[keyof typeof AuthSteps];

export const AuthLabels = {
  title: 'Вход или регистрация',
  codeTitle: 'Введите код из письма',
  subtitle: 'Пришлём код на почту. Сотрудники входят по логину и паролю',
  emailPlaceholder: 'Почта или логин сотрудника',
  sendCode: 'Продолжить',
  confirm: 'Подтвердить',
  changeEmail: 'Изменить адрес',
  resend: 'Запросить код заново',
  resendIn: 'Запросить код повторно через',
  sec: 'сек',
  enterCodeSubtitle: 'Код отправлен на',
  letterSentNotice: 'Письмо с кодом отправлено',
  letterNotSentNotice: 'Отправка писем не настроена — код показан ниже',
  devCodeHint: 'Тестовый код',
  paste: 'Вставить',
  termsNotice: 'Продолжая, вы соглашаетесь с',
  termsLink: 'Условиями использования',
  privacyLink: 'Политикой конфиденциальности',
} as const;

export const CODE_LENGTH = 4;
export const RESEND_DELAY_SEC = 60;
export const EMAIL_MAX_LENGTH = 254;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isEmailValid = (email: string): boolean => (
  EMAIL_PATTERN.test(email.trim()) && email.trim().length <= EMAIL_MAX_LENGTH
);

export const isCodeValid = (code: string): boolean => code.trim().length === CODE_LENGTH;
