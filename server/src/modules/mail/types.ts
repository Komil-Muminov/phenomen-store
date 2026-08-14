export interface IMailMessage {
  to: string;
  subject: string;
  text: string;
}

export interface IOtpLetter {
  to: string;
  code: string;
  shopName: string;
  ttlMinutes: number;
}

export const MailPaths = {
  status: '/status',
  test: '/test',
} as const;

export const MailErrors = {
  sendFailed: 'Не удалось отправить письмо с кодом',
  notConfigured: 'Почта не настроена: заполните SMTP_HOST и SMTP_FROM в .env',
  addressRequired: 'Укажите адрес, куда отправить проверочное письмо',
} as const;

export const MailStatusTexts = {
  offline: 'SMTP не настроен — письма не отправляются',
  ready: 'SMTP отвечает, письма отправляются',
  broken: 'SMTP настроен, но не отвечает',
  bootWarning: '[mail] ВНИМАНИЕ: SMTP настроен, но не отвечает — вход по коду работать не будет',
  bootReady: '[mail] SMTP проверен, письма отправляются',
  bootOffline: '[mail] SMTP не настроен — коды входа будут только в ответе API (dev-режим)',
  testSubject: 'Проверка почты PHENOMEN',
  testBody: (login: string): string => [
    'Это проверочное письмо из панели платформы PHENOMEN.',
    '',
    `Отправил: ${login}.`,
    'Если письмо дошло — почта настроена верно.',
  ].join('\n'),
} as const;

export interface IMailStatus {
  configured: boolean;
  ready: boolean;
  reason: string | null;
  message: string;
}

export const MailTexts = {
  otpSubject: 'Код для входа',
  otpBody: (shopName: string, code: string, ttlMinutes: number): string => [
    `Код для входа в ${shopName}: ${code}`,
    '',
    `Код действует ${ttlMinutes} мин. Если вы не запрашивали вход, просто удалите это письмо.`,
  ].join('\n'),
} as const;

export const SECONDS_IN_MINUTE = 60;
