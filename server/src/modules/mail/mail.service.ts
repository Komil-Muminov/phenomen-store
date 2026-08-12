import nodemailer, { Transporter } from 'nodemailer';
import { Env, HttpStatus } from '@/shared/config';
import { AppError } from '@/shared/utils';
import { IMailMessage, IOtpLetter, MailErrors, MailTexts, SECONDS_IN_MINUTE } from '@/modules/mail/types';

let transporter: Transporter | null = null;

export const isMailConfigured = (): boolean => Boolean(Env.mail.host && Env.mail.from);

const getTransporter = (): Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: Env.mail.host,
      port: Env.mail.port,
      secure: Env.mail.secure,
      auth: Env.mail.user ? { user: Env.mail.user, pass: Env.mail.password } : undefined,
    });
  }

  return transporter;
};

export const sendMail = async (message: IMailMessage): Promise<void> => {
  if (!isMailConfigured()) {
    console.warn(`[mail] SMTP не настроен, письмо для ${message.to} не отправлено`);

    return;
  }

  try {
    await getTransporter().sendMail({
      from: Env.mail.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
  } catch (error) {
    console.error('[mail] отправка не удалась', error);

    throw new AppError(MailErrors.sendFailed, HttpStatus.serverError);
  }
};

export const sendOtpLetter = async (letter: IOtpLetter): Promise<void> => {
  await sendMail({
    to: letter.to,
    subject: MailTexts.otpSubject,
    text: MailTexts.otpBody(letter.shopName, letter.code, letter.ttlMinutes),
  });
};

export const minutesFromSeconds = (seconds: number): number => (
  Math.max(1, Math.round(seconds / SECONDS_IN_MINUTE))
);
