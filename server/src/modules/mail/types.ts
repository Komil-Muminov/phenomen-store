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

export const MailErrors = {
  sendFailed: 'Не удалось отправить письмо с кодом',
} as const;

export const MailTexts = {
  otpSubject: 'Код для входа',
  otpBody: (shopName: string, code: string, ttlMinutes: number): string => [
    `Код для входа в ${shopName}: ${code}`,
    '',
    `Код действует ${ttlMinutes} мин. Если вы не запрашивали вход, просто удалите это письмо.`,
  ].join('\n'),
} as const;

export const SECONDS_IN_MINUTE = 60;
