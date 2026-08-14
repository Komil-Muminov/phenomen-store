import nodemailer, { Transporter } from 'nodemailer';
import { Env, HttpStatus } from '@/shared/config';
import { AppError } from '@/shared/utils';
import {
  IMailMessage,
  IMailStatus,
  IOtpLetter,
  MailErrors,
  MailStatusTexts,
  MailTexts,
  SECONDS_IN_MINUTE,
} from '@/modules/mail/types';

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

export const checkMail = async (): Promise<IMailStatus> => {
  if (!isMailConfigured()) {
    return {
      configured: false,
      ready: false,
      reason: null,
      message: MailStatusTexts.offline,
    };
  }

  try {
    await getTransporter().verify();

    return { configured: true, ready: true, reason: null, message: MailStatusTexts.ready };
  } catch (error) {
    return {
      configured: true,
      ready: false,
      reason: error instanceof Error ? error.message : String(error),
      message: MailStatusTexts.broken,
    };
  }
};

export const sendTestLetter = async (to: string, login: string): Promise<void> => {
  if (!isMailConfigured()) {
    throw new AppError(MailErrors.notConfigured, HttpStatus.conflict);
  }

  await sendMail({
    to,
    subject: MailStatusTexts.testSubject,
    text: MailStatusTexts.testBody(login),
  });
};

export const reportMailStatus = async (): Promise<void> => {
  const status = await checkMail();

  if (!status.configured) {
    console.warn(MailStatusTexts.bootOffline);

    return;
  }

  if (status.ready) {
    console.log(MailStatusTexts.bootReady);

    return;
  }

  console.error(`${MailStatusTexts.bootWarning}: ${status.reason ?? ''}`);
};

export const minutesFromSeconds = (seconds: number): number => (
  Math.max(1, Math.round(seconds / SECONDS_IN_MINUTE))
);
