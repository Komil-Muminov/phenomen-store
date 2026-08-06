export const AuthSteps = {
  phone: 'phone',
  code: 'code',
} as const;

export type TAuthStep = (typeof AuthSteps)[keyof typeof AuthSteps];

export const AuthLabels = {
  title: 'Вход в профиль',
  subtitle: 'Отправим код подтверждения по SMS',
  phonePlaceholder: '+7 900 000-00-00',
  codePlaceholder: 'Код из SMS',
  sendCode: 'Получить код',
  confirm: 'Подтвердить',
  changePhone: 'Изменить номер',
  resend: 'Запросить код заново',
  devCodeHint: 'Код для теста',
} as const;

export const PHONE_MIN_DIGITS = 10;
export const CODE_LENGTH = 4;

export const isPhoneValid = (phone: string): boolean => (
  phone.replace(/\D/g, '').length >= PHONE_MIN_DIGITS
);

export const isCodeValid = (code: string): boolean => code.trim().length === CODE_LENGTH;
