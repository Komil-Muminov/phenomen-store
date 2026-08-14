export { mailRouter } from '@/modules/mail/mail.routes';
export {
  checkMail,
  isMailConfigured,
  minutesFromSeconds,
  reportMailStatus,
  sendMail,
  sendOtpLetter,
} from '@/modules/mail/mail.service';
export type { IMailMessage, IMailStatus, IOtpLetter } from '@/modules/mail/types';
