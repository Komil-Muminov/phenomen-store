export { authRouter } from '@/modules/auth/auth.routes';
export {
  requestCode,
  verifyCode,
  getProfile,
  updateProfile,
  loginWithPassword,
  loginStaffWithPassword,
  issueToken,
  changePassword,
} from '@/modules/auth/auth.service';
export { AuthErrors, OtpSettings, normalizeEmail, normalizePhone } from '@/modules/auth/types';
export type { IUserRow } from '@/modules/auth/types';
